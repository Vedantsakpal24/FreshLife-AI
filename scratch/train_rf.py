import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Define dictionaries for categorical mappings
FRUITS = {
    'banana': 0, 'orange': 1, 'papaya': 2, 'pineapple': 3,
    'tomato': 4, 'cucumber': 5, 'eggplant': 6, 'bittermelon': 7, 'unknown': 8
}
STORAGE = {
    'room_temperature': 0,
    'refrigerator': 1,
    'cool_dry': 2
}

# Generate synthetic data based on our heuristics
data = []
for fruit, f_id in FRUITS.items():
    for storage, s_id in STORAGE.items():
        for temp in range(0, 45, 5):
            for humidity in range(20, 101, 10):
                for freshness in range(0, 101, 10):
                    # Replicate heuristic logic for ground truth
                    base_life = [1, 3]
                    if fruit == 'banana': base_life = [5, 7] if freshness > 79 else ([2, 3] if freshness > 39 else [0, 0])
                    elif fruit == 'orange': base_life = [10, 14] if freshness > 79 else ([3, 5] if freshness > 39 else [0, 0])
                    elif fruit == 'papaya': base_life = [4, 6] if freshness > 79 else ([1, 2] if freshness > 39 else [0, 0])
                    elif fruit == 'pineapple': base_life = [3, 5] if freshness > 79 else ([1, 2] if freshness > 39 else [0, 0])
                    elif fruit == 'tomato': base_life = [7, 10] if freshness > 79 else ([2, 4] if freshness > 39 else [0, 0])
                    elif fruit == 'cucumber': base_life = [7, 10] if freshness > 79 else ([2, 3] if freshness > 39 else [0, 0])
                    elif fruit == 'eggplant': base_life = [5, 7] if freshness > 79 else ([1, 3] if freshness > 39 else [0, 0])
                    elif fruit == 'bittermelon': base_life = [4, 6] if freshness > 79 else ([1, 2] if freshness > 39 else [0, 0])
                    
                    multiplier = 1.0
                    if storage == 'refrigerator': multiplier *= 1.8
                    elif storage == 'cool_dry': multiplier *= 1.2
                    
                    if temp > 25:
                        multiplier *= pow(0.95, temp - 25)
                        
                    life = max(0, round(((base_life[0] + base_life[1]) / 2) * multiplier))
                    
                    # Add some random noise for realism
                    noise = np.random.uniform(-0.5, 0.5)
                    life = max(0, life + noise)
                    
                    data.append([f_id, freshness, temp, humidity, s_id, life])

df = pd.DataFrame(data, columns=['fruit_id', 'freshness_score', 'temperature', 'humidity', 'storage_id', 'shelf_life'])

X = df[['fruit_id', 'freshness_score', 'temperature', 'humidity', 'storage_id']].values.astype(np.float32)
y = df['shelf_life'].values.astype(np.float32)

# Train Random Forest
print("Training Random Forest Regressor...")
rf = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
rf.fit(X, y)
print(f"R^2 Score: {rf.score(X, y):.4f}")

# Convert to ONNX
print("Exporting to ONNX...")
initial_type = [('float_input', FloatTensorType([None, 5]))]
onnx_model = convert_sklearn(rf, initial_types=initial_type)

with open("shelflife_rf.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("Model exported to shelflife_rf.onnx successfully!")
