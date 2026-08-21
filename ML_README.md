# Machine Learning Architecture

FreshLife AI uses a multi-stage machine learning pipeline to analyze produce images and predict shelf life.

## 1. Produce Classifier
- **Architecture**: EfficientNet-B0 (pretrained on ImageNet)
- **Task**: 8-class classification (Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, Tomato)
- **Input**: 224x224 RGB image
- **Output**: Softmax probabilities for each produce type

## 2. Freshness Classifier
- **Architecture**: EfficientNet-B0 (pretrained on ImageNet)
- **Task**: 3-class classification (Fresh, Semi-Fresh, Rotten)
- **Input**: 224x224 RGB image
- **Output**: Softmax probabilities for freshness condition

## 3. Shelf-Life Predictor
- **Architecture**: XGBoost Regressor (Two models: Min and Max days)
- **Task**: Regression based on vision model outputs
- **Features**: 
  - Produce probabilities (One-hot encoded)
  - Condition probabilities (One-hot encoded)
  - Produce Model Confidence
  - Freshness Model Confidence
- **Note**: The dataset does NOT contain temperature or humidity data. These environmental factors are applied as a post-prediction heuristic adjustment layer.

## 4. Environmental Heuristic Layer
Since the vision dataset has no environmental data, temperature and humidity adjustments are applied heuristically:
- **Storage**: Multipliers for room temperature (1.0x), refrigerator (1.8x), cool/dry (1.3x).
- **Temperature**: Exponential penalty for temperatures above 25°C.
- **Humidity**: Penalty for very high (>80%) or very low (<30%) humidity.

## Inference Pipeline (`ml/inference/predictor.py`)
1. Image is resized and normalized.
2. Produce classifier determines produce type and confidence.
3. Freshness classifier determines condition and confidence.
4. XGBoost model predicts base shelf-life range (min/max days).
5. Environmental heuristic layer adjusts the shelf-life range based on user inputs.
6. A final freshness score (0-100) is computed from the condition and its confidence.
