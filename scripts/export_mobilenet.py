import torch
import torchvision.models as models
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("Loading MobileNetV3...")
weights = models.MobileNet_V3_Small_Weights.DEFAULT
model = models.mobilenet_v3_small(weights=weights)
model.eval()

# Dummy input
dummy_input = torch.randn(1, 3, 224, 224)

onnx_path = "models/mobilenet.onnx"
print(f"Exporting to {onnx_path}...")
torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    export_params=True,
    opset_version=14,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)

categories = weights.meta["categories"]
classes_path = "models/imagenet_classes.json"
print(f"Saving ImageNet classes to {classes_path}...")
with open(classes_path, "w") as f:
    json.dump(categories, f)

print("Done!")
