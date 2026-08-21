# Training Guide

## Complete Pipeline
You can run the entire data preparation, training, and evaluation pipeline with a single command:
```bash
python train.py
```

### Pipeline Steps:
1. **Audit**: Scans dataset for corruption, duplicates, and class distribution.
2. **Clean**: Quarantines corrupted files.
3. **Split**: Performs augmentation-aware 70/15/15 split to prevent data leakage.
4. **Train Produce**: Trains EfficientNet-B0 to identify 8 produce classes.
5. **Train Freshness**: Trains EfficientNet-B0 to classify 3 freshness conditions.
6. **Train Shelf-Life**: Trains XGBoost to map produce+condition to a shelf-life range.
7. **Evaluate**: Runs full test-set evaluation and generates reports.

## Hardware Optimization (CPU)
Since this environment is CPU-only:
- **Architecture**: EfficientNet-B0 is used instead of larger models (B2/B4) to ensure tractable training times.
- **Batch Size & Accumulation**: Small batch sizes (32) with gradient accumulation (4 steps) simulate a batch size of 128 without blowing up memory.
- **Workers**: `num_workers=0` in DataLoaders prevents multiprocessing overhead on Windows.
- **XGBoost**: Uses `tree_method="hist"` for CPU optimization.

## Resuming / Skipping
You can skip steps that have already completed using CLI flags:
```bash
python train.py --skip-audit --skip-split
```
To run only the evaluation phase:
```bash
python train.py --eval-only
```
