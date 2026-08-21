#!/usr/bin/env python3
"""
FreshLife AI - Single Image Prediction CLI

Usage:
    python predict.py --image "test.jpg" --temperature 25 --humidity 70 --storage room_temperature
"""
import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import argparse
import json
import logging

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="FreshLife AI - Predict from image")
    parser.add_argument("--image", type=str, required=True, help="Path to produce image")
    parser.add_argument("--temperature", type=float, default=25.0, help="Temperature in °C")
    parser.add_argument("--humidity", type=float, default=60.0, help="Humidity in %%")
    parser.add_argument(
        "--storage",
        type=str,
        default="room_temperature",
        choices=["room_temperature", "refrigerator", "cool_dry", "other"],
        help="Storage condition",
    )
    parser.add_argument(
        "--models-dir",
        type=str,
        default=os.path.join(PROJECT_ROOT, "models", "v1"),
        help="Path to model directory",
    )
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    # Validate image exists
    if not os.path.exists(args.image):
        logger.error("Image not found: %s", args.image)
        sys.exit(1)

    # Load predictor
    from ml.inference.predictor import FreshLifePredictor

    if not FreshLifePredictor.models_available(args.models_dir):
        logger.error("Models not found at %s. Run 'python train.py' first.", args.models_dir)
        sys.exit(1)

    predictor = FreshLifePredictor(model_dir=args.models_dir)

    # Read image
    with open(args.image, "rb") as f:
        image_bytes = f.read()

    # Predict
    result = predictor.predict(
        image_bytes=image_bytes,
        temperature_c=args.temperature,
        humidity_percent=args.humidity,
        storage_condition=args.storage,
    )

    result_dict = result.to_dict()

    if args.json:
        print(json.dumps(result_dict, indent=2))
        return

    # Pretty print
    print()
    print("=" * 50)
    print("  FreshLife AI - Prediction Result")
    print("=" * 50)
    print()

    if result_dict.get("error"):
        print(f"  ❌ Error: {result_dict['error']}")
        return

    produce = result_dict.get("produce", "unknown")
    category = result_dict.get("category", "unknown")
    produce_conf = result_dict.get("produce_confidence", 0)
    condition = result_dict.get("condition", "unknown")
    condition_conf = result_dict.get("condition_confidence", 0)
    freshness = result_dict.get("freshness_score", 0)
    shelf_min = result_dict.get("shelf_life_min_days", 0)
    shelf_max = result_dict.get("shelf_life_max_days", 0)
    recommendation = result_dict.get("recommendation", "")

    emoji_map = {
        "banana": "🍌", "orange": "🍊", "papaya": "🥭", "pineapple": "🍍",
        "tomato": "🍅", "cucumber": "🥒", "eggplant": "🍆", "bittermelon": "🥬",
    }
    emoji = emoji_map.get(produce, "🌿")

    print(f"  {emoji} {produce.title()}")
    print(f"     Category: {category.title()}")
    print(f"     Confidence: {produce_conf:.0%}")
    print()
    print(f"  Condition: {condition.replace('_', ' ').title()}")
    print(f"     Confidence: {condition_conf:.0%}")
    print()
    print(f"  Freshness Score: {freshness}/100")
    print()
    print(f"  🌡️  Temperature: {args.temperature}°C")
    print(f"  💧 Humidity: {args.humidity}%")
    print(f"  📦 Storage: {args.storage.replace('_', ' ').title()}")
    print()
    print(f"  ⏳ Estimated Shelf Life: {shelf_min}–{shelf_max} days")
    print()
    print(f"  💡 {recommendation}")
    print()

    if result_dict.get("explanations"):
        print("  Why this result?")
        for explanation in result_dict["explanations"]:
            print(f"    ✓ {explanation}")
        print()

    print("  ⚠️  This is an AI-based estimate. Actual shelf life may vary.")
    print()


if __name__ == "__main__":
    main()
