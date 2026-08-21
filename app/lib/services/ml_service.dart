import 'dart:convert';
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
  final String source;
  final String? message;

  PredictionResult({
    required this.fruit,
    required this.freshness,
    required this.confidence,
    required this.source,
    this.message,
  });
}

class MLService {
  static final MLService _instance = MLService._internal();
  factory MLService() => _instance;
  MLService._internal();

  OrtSession? _bestSession;
  OrtSession? _mobilenetSession;
  List<String> _imagenetClasses = [];

  static const List<String> bestClasses = [
    'fresh_banana', 'fresh_bittermelon', 'fresh_cucumber', 'fresh_eggplant', 
    'fresh_orange', 'fresh_papaya', 'fresh_pineapple', 'fresh_tomato', 
    'rotten_banana', 'rotten_bittermelon', 'rotten_cucumber', 'rotten_eggplant', 
    'rotten_orange', 'rotten_papaya', 'rotten_pineapple', 'rotten_tomato', 
    'semi_fresh_banana', 'semi_fresh_bittermelon', 'semi_fresh_cucumber', 
    'semi_fresh_eggplant', 'semi_fresh_orange', 'semi_fresh_papaya', 
    'semi_fresh_pineapple', 'semi_fresh_tomato'
  ];

  Future<void> init() async {
    OrtEnv.instance.init();
    
    // Load best.onnx
    final bestRaw = await rootBundle.load('assets/models/best.onnx');
    _bestSession = OrtSession.fromBuffer(bestRaw.buffer.asUint8List(), OrtSessionOptions());

    // Load mobilenet.onnx
    final mobilenetRaw = await rootBundle.load('assets/models/mobilenet.onnx');
    _mobilenetSession = OrtSession.fromBuffer(mobilenetRaw.buffer.asUint8List(), OrtSessionOptions());

    // Load imagenet classes
    final classesStr = await rootBundle.loadString('assets/models/imagenet_classes.json');
    List<dynamic> jsonList = json.decode(classesStr);
    _imagenetClasses = jsonList.map((e) => e.toString()).toList();
  }

  Future<PredictionResult> predict(File imageFile) async {
    if (_bestSession == null || _mobilenetSession == null) {
      throw Exception("Models not initialized");
    }

    // Read and decode image
    final bytes = await imageFile.readAsBytes();
    img.Image? decodedImage = img.decodeImage(bytes);
    if (decodedImage == null) throw Exception("Failed to decode image");

    // Resize image to 224x224
    img.Image resizedImage = img.copyResize(decodedImage, width: 224, height: 224);

    // Prepare tensors
    final yoloTensor = _imageToFloat32List(resizedImage, mean: [0, 0, 0], std: [1, 1, 1]);
    final mobilenetTensor = _imageToFloat32List(resizedImage, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225]);

    // Run YOLO best.onnx
    final yoloShape = [1, 3, 224, 224];
    final yoloOrtTensor = OrtValueTensor.createTensorWithDataList(yoloTensor, yoloShape);
    
    final yoloRunOptions = OrtRunOptions();
    final yoloInputs = {'images': yoloOrtTensor}; // Or input name based on export
    
    // Note: To properly support ONNX input names, we assume the first input name.
    // In ultralytics export, it's typically "images" or "input".
    final yoloInputName = _bestSession!.inputNames[0];
    final yoloOutputs = _bestSession!.run(yoloRunOptions, {yoloInputName: yoloOrtTensor});
    
    final yoloOutputValue = yoloOutputs[0]!.value as List<List<double>>;
    final yoloLogits = yoloOutputValue[0];
    final yoloProbs = _softmax(yoloLogits);
    
    double maxYoloProb = -1;
    int maxYoloIdx = -1;
    for (int i = 0; i < yoloProbs.length; i++) {
      if (yoloProbs[i] > maxYoloProb) {
        maxYoloProb = yoloProbs[i];
        maxYoloIdx = i;
      }
    }

    yoloOutputs.forEach((element) => element?.release());
    yoloOrtTensor.release();
    yoloRunOptions.release();

    if (maxYoloProb >= 0.50) {
      final className = bestClasses[maxYoloIdx];
      final parts = className.split("_");
      final freshnessRaw = parts.sublist(0, parts.length - 1).join("_");
      final fruitRaw = parts.last;

      return PredictionResult(
        fruit: fruitRaw.replaceAll("_", " "),
        freshness: _capitalizeParts(freshnessRaw.replaceAll("_", " ")),
        confidence: maxYoloProb,
        source: "best.pt",
      );
    }

    // Run MobileNet Fallback
    final mobilenetOrtTensor = OrtValueTensor.createTensorWithDataList(mobilenetTensor, yoloShape);
    final mobilenetRunOptions = OrtRunOptions();
    final mobilenetInputName = _mobilenetSession!.inputNames[0];
    final mobilenetOutputs = _mobilenetSession!.run(mobilenetRunOptions, {mobilenetInputName: mobilenetOrtTensor});

    final mobilenetOutputValue = mobilenetOutputs[0]!.value as List<List<double>>;
    final mobilenetLogits = mobilenetOutputValue[0];
    final mobilenetProbs = _softmax(mobilenetLogits);

    double maxMbProb = -1;
    int maxMbIdx = -1;
    for (int i = 0; i < mobilenetProbs.length; i++) {
      if (mobilenetProbs[i] > maxMbProb) {
        maxMbProb = mobilenetProbs[i];
        maxMbIdx = i;
      }
    }

    mobilenetOutputs.forEach((element) => element?.release());
    mobilenetOrtTensor.release();
    mobilenetRunOptions.release();

    if (maxMbProb < 0.15) {
      return PredictionResult(
        fruit: "Unable to confidently identify this fruit or vegetable",
        freshness: "Unknown",
        confidence: maxMbProb,
        source: "general_vision_model",
        message: "More freshness training data is required for reliable shelf-life estimation.",
      );
    }

    return PredictionResult(
      fruit: _imagenetClasses[maxMbIdx].replaceAll("_", " "),
      freshness: "Unknown",
      confidence: maxMbProb,
      source: "general_vision_model",
      message: "More freshness training data is required for reliable shelf-life estimation.",
    );
  }

  Float32List _imageToFloat32List(img.Image image, {required List<double> mean, required List<double> std}) {
    var convertedBytes = Float32List(1 * 3 * 224 * 224);
    var buffer = Float32List.view(convertedBytes.buffer);
    int pixelIndex = 0;

    for (var i = 0; i < 224; i++) {
      for (var j = 0; j < 224; j++) {
        var pixel = image.getPixel(j, i);
        // Normalize: (pixel / 255.0 - mean) / std
        buffer[pixelIndex] = ((pixel.r / 255.0) - mean[0]) / std[0];
        buffer[224 * 224 + pixelIndex] = ((pixel.g / 255.0) - mean[1]) / std[1];
        buffer[2 * 224 * 224 + pixelIndex] = ((pixel.b / 255.0) - mean[2]) / std[2];
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
