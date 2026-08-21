#!/usr/bin/env python3
"""
FreshLife AI - Complete Training Pipeline

Usage:
    python train.py --dataset "./data/raw/Processed Data/Processed Data"
    python train.py --resume  # Resume from last checkpoint
    python train.py --skip-audit  # Skip dataset audit (if already done)
"""
import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import argparse
import json
import time
import logging

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def print_banner():
    """Print the FreshLife AI training banner."""
    print("=" * 60)
    print("       FreshLife AI v2 - Training Pipeline")
    print("=" * 60)
    print()


def step_header(step_num: int, total: int, description: str):
    """Print a step header."""
    print()
    print(f"{'-' * 60}")
    print(f"  Step {step_num}/{total}: {description}")
    print(f"{'-' * 60}")
    print()


def run_audit(dataset_dir: str) -> bool:
    """Run dataset audit."""
    from ml.data.audit import run_audit as audit_main
    try:
        report = audit_main(dataset_dir)
        if report.get("total_images", 0) == 0:
            logger.error("No images found in dataset!")
            return False
        logger.info(
            "Audit complete: %d images, %d classes, %d corrupted",
            report.get("total_images", 0),
            report.get("total_classes", 0),
            report.get("corrupted_count", 0),
        )
        return True
    except Exception as e:
        logger.error("Dataset audit failed: %s", e)
        return False


def run_cleaning() -> bool:
    """Run dataset cleaning."""
    from ml.data.cleaner import run_cleaning as clean_main
    try:
        clean_main()
        logger.info("Dataset cleaning complete")
        return True
    except Exception as e:
        logger.error("Dataset cleaning failed: %s", e)
        # Non-fatal — continue even if cleaning finds nothing
        return True


def run_splitting(dataset_dir: str) -> bool:
    """Run augmentation-aware dataset splitting."""
    from ml.data.splitter import run_split as split_main
    output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    try:
        split_main(dataset_dir, output_dir)
        # Verify splits exist
        for split in ["train", "val", "test"]:
            split_path = os.path.join(output_dir, split)
            if not os.path.exists(split_path):
                logger.error("Split directory not found: %s", split_path)
                return False
            n_classes = len([d for d in os.listdir(split_path)
                          if os.path.isdir(os.path.join(split_path, d))])
            n_images = sum(
                len(os.listdir(os.path.join(split_path, d)))
                for d in os.listdir(split_path)
                if os.path.isdir(os.path.join(split_path, d))
            )
            logger.info("  %s: %d classes, %d images", split, n_classes, n_images)
        return True
    except Exception as e:
        logger.error("Dataset splitting failed: %s", e)
        return False


def run_produce_training() -> bool:
    """Train produce classifier."""
    from ml.training.produce_classifier import train_produce_classifier
    data_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    output_dir = os.path.join(PROJECT_ROOT, "models", "v1", "produce_classifier")
    try:
        train_produce_classifier(data_dir, output_dir)
        if os.path.exists(os.path.join(output_dir, "model.pth")):
            logger.info("Produce classifier trained and saved")
            return True
        else:
            logger.error("Produce classifier model file not found after training")
            return False
    except Exception as e:
        logger.error("Produce classifier training failed: %s", e)
        return False


def run_freshness_training() -> bool:
    """Train freshness classifier."""
    from ml.training.freshness_classifier import train_freshness_classifier
    data_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    output_dir = os.path.join(PROJECT_ROOT, "models", "v1", "freshness_classifier")
    try:
        train_freshness_classifier(data_dir, output_dir)
        if os.path.exists(os.path.join(output_dir, "model.pth")):
            logger.info("Freshness classifier trained and saved")
            return True
        else:
            logger.error("Freshness classifier model file not found after training")
            return False
    except Exception as e:
        logger.error("Freshness classifier training failed: %s", e)
        return False


def run_shelf_life_training() -> bool:
    """Train shelf-life prediction model."""
    from ml.training.shelf_life_model import train_shelf_life_model
    data_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    output_dir = os.path.join(PROJECT_ROOT, "models", "v1", "shelf_life")
    try:
        train_shelf_life_model(data_dir, output_dir)
        logger.info("Shelf-life model trained and saved")
        return True
    except Exception as e:
        logger.error("Shelf-life model training failed: %s", e)
        return False


def run_evaluation() -> bool:
    """Evaluate all trained models."""
    from ml.evaluation.evaluate import run_full_evaluation
    try:
        results = run_full_evaluation(
            models_dir=os.path.join(PROJECT_ROOT, "models", "v1"),
            test_data_dir=os.path.join(PROJECT_ROOT, "data", "processed", "test"),
            output_dir=os.path.join(PROJECT_ROOT, "reports", "evaluation"),
        )
        logger.info("Evaluation complete")
        return True
    except Exception as e:
        logger.error("Evaluation failed: %s", e)
        return False


def create_active_model_config():
    """Create models/active_model.json pointing to v1."""
    config = {
        "active_version": "v1",
        "model_dir": "models/v1",
        "models": {
            "produce_classifier": "models/v1/produce_classifier",
            "freshness_classifier": "models/v1/freshness_classifier",
            "shelf_life": "models/v1/shelf_life",
        },
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    config_path = os.path.join(PROJECT_ROOT, "models", "active_model.json")
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    logger.info("Active model config saved to %s", config_path)


def main():
    """Run the complete training pipeline."""
    parser = argparse.ArgumentParser(description="FreshLife AI Training Pipeline")
    parser.add_argument(
        "--dataset",
        type=str,
        default=os.path.join(PROJECT_ROOT, "data", "raw", "Processed Data", "Processed Data"),
        help="Path to raw dataset directory",
    )
    parser.add_argument("--skip-audit", action="store_true", help="Skip dataset audit")
    parser.add_argument("--skip-split", action="store_true", help="Skip dataset splitting")
    parser.add_argument("--skip-produce", action="store_true", help="Skip produce classifier training")
    parser.add_argument("--skip-freshness", action="store_true", help="Skip freshness classifier training")
    parser.add_argument("--skip-shelf-life", action="store_true", help="Skip shelf-life model training")
    parser.add_argument("--skip-eval", action="store_true", help="Skip evaluation")
    parser.add_argument("--eval-only", action="store_true", help="Only run evaluation")
    args = parser.parse_args()

    print_banner()
    start_time = time.time()

    if args.eval_only:
        step_header(1, 1, "Evaluating models")
        if not run_evaluation():
            logger.error("Evaluation failed")
            sys.exit(1)
        elapsed = time.time() - start_time
        print(f"\nEvaluation completed in {elapsed:.1f} seconds.")
        sys.exit(0)

    total_steps = 8
    current_step = 0

    # Step 1: Dataset Audit
    current_step += 1
    if not args.skip_audit:
        step_header(current_step, total_steps, "Dataset Audit")
        if not run_audit(args.dataset):
            logger.error("Dataset audit failed. Fix issues before continuing.")
            sys.exit(1)
    else:
        logger.info("Skipping dataset audit")

    # Step 2: Dataset Cleaning
    current_step += 1
    if not args.skip_audit:
        step_header(current_step, total_steps, "Dataset Cleaning")
        run_cleaning()
    else:
        logger.info("Skipping dataset cleaning")

    # Step 3: Dataset Splitting
    current_step += 1
    if not args.skip_split:
        step_header(current_step, total_steps, "Augmentation-Aware Dataset Splitting")
        if not run_splitting(args.dataset):
            logger.error("Dataset splitting failed.")
            sys.exit(1)
    else:
        logger.info("Skipping dataset splitting")

    # Step 4: Train Produce Classifier
    current_step += 1
    if not args.skip_produce:
        step_header(current_step, total_steps, "Training Produce Classifier (EfficientNet-B0)")
        if not run_produce_training():
            logger.error("Produce classifier training failed.")
            sys.exit(1)
    else:
        logger.info("Skipping produce classifier training")

    # Step 5: Train Freshness Classifier
    current_step += 1
    if not args.skip_freshness:
        step_header(current_step, total_steps, "Training Freshness Classifier (EfficientNet-B0)")
        if not run_freshness_training():
            logger.error("Freshness classifier training failed.")
            sys.exit(1)
    else:
        logger.info("Skipping freshness classifier training")

    # Step 6: Train Shelf-Life Model
    current_step += 1
    if not args.skip_shelf_life:
        step_header(current_step, total_steps, "Training Shelf-Life Model (XGBoost)")
        if not run_shelf_life_training():
            logger.error("Shelf-life model training failed.")
            sys.exit(1)
    else:
        logger.info("Skipping shelf-life model training")

    # Step 7: Evaluation
    current_step += 1
    if not args.skip_eval:
        step_header(current_step, total_steps, "Model Evaluation")
        run_evaluation()
    else:
        logger.info("Skipping evaluation")

    # Step 8: Model Versioning
    current_step += 1
    step_header(current_step, total_steps, "Model Versioning")
    create_active_model_config()

    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print("       Training Pipeline Complete!")
    print(f"       Total time: {elapsed / 60:.1f} minutes")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Start FastAPI server: python -m uvicorn ml.main:app --port 8000")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Or start both: python start.py")
    print()


if __name__ == "__main__":
    main()
