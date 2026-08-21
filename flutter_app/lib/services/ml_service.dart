import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;
import 'package:image/image.dart' as img;
import 'package:onnxruntime/onnxruntime.dart';

class PredictionResult {
  final String fruit;
  final String freshness;
  final double confidence;

  PredictionResult({
    required this.fruit,
    required this.freshness,
    required this.confidence,
  });
}

class MLService {
  static final MLService _instance = MLService._internal();
  factory MLService() => _instance;
  MLService._internal();

  OrtSession? _bestSession;

  static const List<String> bestClasses = [
    'fresh_banana', 'fresh_bittermelon', 'fresh_cucumber', 'fresh_eggplant', 
    'fresh_orange', 'fresh_papaya', 'fresh_pineapple', 'fresh_tomato', 
    'rotten_banana', 'rotten_bittermelon', 'rotten_cucumber', 'rotten_eggplant', 
    'rotten_orange', 'rotten_papaya', 'rotten_pineapple', 'rotten_tomato', 
    'semi_fresh_banana', 'semi_fresh_bittermelon', 'semi_fresh_cucumber', 
    'semi_fresh_eggplant', 'semi_fresh_orange', 'semi_fresh_papaya', 
    'semi_fresh_pineapple', 'semi_fresh_tomato'
  ];

  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      OrtEnv.instance.init();
      final bestRaw = await rootBundle.load('assets/models/best.onnx');
      _bestSession = OrtSession.fromBuffer(bestRaw.buffer.asUint8List(), OrtSessionOptions());
      _isInitialized = true;
    } catch (e) {
      print("Error loading ONNX model: $e");
      rethrow;
    }
  }

  Future<PredictionResult> predict(File imageFile) async {
    if (!_isInitialized) {
      await init();
    }
    if (_bestSession == null) {
      throw Exception("Model could not be initialized");
    }

    // Read and decode image
    final bytes = await imageFile.readAsBytes();
    img.Image? decodedImage = img.decodeImage(bytes);
    if (decodedImage == null) throw Exception("Failed to decode image");

    // Resize image exactly to 224x224 as required by the model
    img.Image resizedImage = img.copyResize(decodedImage, width: 224, height: 224);

    // Prepare float32 tensor [1, 3, 224, 224] (divide by 255.0 to normalize)
    final tensorData = _imageToFloat32List(resizedImage);
    final shape = [1, 3, 224, 224];
    final ortTensor = OrtValueTensor.createTensorWithDataList(tensorData, shape);
    
    final runOptions = OrtRunOptions();
    
    // The model expects input named 'images'
    final inputs = {'images': ortTensor}; 
    final outputs = _bestSession!.run(runOptions, inputs);
    
    final outputValue = outputs[0]!.value as List<List<double>>;
    final logits = outputValue[0];
    final probs = _softmax(logits);
    
    double maxProb = -1;
    int maxIdx = -1;
    for (int i = 0; i < probs.length; i++) {
      if (probs[i] > maxProb) {
        maxProb = probs[i];
        maxIdx = i;
      }
    }

    // Cleanup ONNX resources
    for (var element in outputs) {
      element?.release();
    }
    ortTensor.release();
    runOptions.release();

    final className = bestClasses[maxIdx];
    final parts = className.split("_");
    final freshnessRaw = parts.sublist(0, parts.length - 1).join("_");
    final fruitRaw = parts.last;

    return PredictionResult(
      fruit: _capitalizeParts(fruitRaw.replaceAll("_", " ")),
      freshness: _capitalizeParts(freshnessRaw.replaceAll("_", " ")),
      confidence: maxProb,
    );
  }

  Float32List _imageToFloat32List(img.Image image) {
    var convertedBytes = Float32List(1 * 3 * 224 * 224);
    var buffer = Float32List.view(convertedBytes.buffer);
    int pixelIndex = 0;

    for (var i = 0; i < 224; i++) {
      for (var j = 0; j < 224; j++) {
        var pixel = image.getPixel(j, i);
        // Normalize: pixel / 255.0
        buffer[pixelIndex] = pixel.r / 255.0;
        buffer[224 * 224 + pixelIndex] = pixel.g / 255.0;
        buffer[2 * 224 * 224 + pixelIndex] = pixel.b / 255.0;
        pixelIndex++;
      }
    }
    return convertedBytes;
  }

  List<double> _softmax(List<double> logits) {
    double maxLogit = logits.reduce(max);
    List<double> exps = logits.map((e) => exp(e - maxLogit)).toList();
    double sumExps = exps.reduce((a, b) => a + b);
    return exps.map((e) => e / sumExps).toList();
  }

  String _capitalizeParts(String input) {
    if (input.isEmpty) return input;
    return input.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }
}
