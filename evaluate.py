#!/usr/bin/env python3
"""
FreshLife AI - Model Evaluation

Usage:
    python evaluate.py
    python evaluate.py --models-dir models/v1
"""
import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import argparse
import logging

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="FreshLife AI Model Evaluation")
    parser.add_argument(
        "--models-dir",
        type=str,
        default=os.path.join(PROJECT_ROOT, "models", "v1"),
        help="Path to model directory",
    )
    parser.add_argument(
        "--test-dir",
        type=str,
        default=os.path.join(PROJECT_ROOT, "data", "processed", "test"),
        help="Path to test dataset directory",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=os.path.join(PROJECT_ROOT, "reports", "evaluation"),
        help="Path to save evaluation reports",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("       FreshLife AI - Model Evaluation")
    print("=" * 60)

    # Check models exist
    if not os.path.exists(args.models_dir):
        logger.error("Models directory not found: %s", args.models_dir)
        logger.error("Run 'python train.py' first to train models.")
        sys.exit(1)

    # Check test data exists
    if not os.path.exists(args.test_dir):
        logger.error("Test data directory not found: %s", args.test_dir)
        logger.error("Run 'python train.py' first to prepare the dataset.")
        sys.exit(1)

    from ml.evaluation.evaluate import run_full_evaluation

    results = run_full_evaluation(
        models_dir=args.models_dir,
        test_data_dir=args.test_dir,
        output_dir=args.output_dir,
    )

    print()
    print("=" * 60)
    print("       Evaluation Complete")
    print("=" * 60)
    print(f"Reports saved to: {args.output_dir}")


if __name__ == "__main__":
    main()
