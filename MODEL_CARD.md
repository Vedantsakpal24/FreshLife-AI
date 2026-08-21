# Model Card: FreshLife AI Vision Pipeline

## Model Details
- **Architecture**: EfficientNet-B0 (PyTorch/Timm)
- **Parameters**: ~5.3M (per model)
- **Input**: 224x224 RGB Image
- **Output**: 
  - Produce Model: 8-class Softmax
  - Freshness Model: 3-class Softmax
- **Training Environment**: CPU-optimized (Gradient Accumulation, Mixed Augmentation)

## Intended Use
- **Primary Use Case**: Identifying produce type and freshness condition from standard smartphone photos.
- **Out of Scope**: Medical/Food Safety certification. The model provides an AI estimate, not a guarantee that food is safe to eat.

## Evaluation Data
- **Test Set**: 15% stratified split from the 14,160 image dataset.
- **Leakage Prevention**: The split explicitly groups augmented images with their sources. Near-duplicates and exact MD5 duplicates were flagged during the audit phase.

## Limitations
1. **Background Context**: The model was trained on dataset images and may be sensitive to complex backgrounds or varied lighting.
2. **Camera Angles**: Extreme close-ups or unusual angles may reduce accuracy.
3. **Produce Scope**: Limited to 8 supported produce types. Uploading non-produce images will yield low confidence scores and trigger a rejection.

## Environmental Adjustment (Heuristic Layer)
The original dataset **does not** contain temperature or humidity data. To meet the user requirement of factoring in environmental conditions:
1. The XGBoost model predicts the shelf-life range strictly based on the visual condition.
2. A deterministic Heuristic Adjustment Layer (documented in `models/v1/shelf_life/env_adjustment_config.json`) applies multipliers for storage type (e.g. 1.8x for refrigerator) and exponential penalties/bonuses for temperature deviations.
3. This ensures the system behaves logically without falsely claiming the CNN learned environmental effects from an image.
