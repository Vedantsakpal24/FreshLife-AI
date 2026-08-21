import 'dart:io';
import 'package:flutter/material.dart';
import '../services/ml_service.dart';
import '../services/shelf_life.dart';

class ResultScreen extends StatefulWidget {
  final File imageFile;
  final PredictionResult result;

  const ResultScreen({super.key, required this.imageFile, required this.result});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  double _tempC = 20.0;
  double _humidity = 60.0;

  @override
  Widget build(BuildContext context) {
    int shelfLifeDays = ShelfLifeService.estimateShelfLife(
        widget.result.fruit, widget.result.freshness, _tempC, _humidity);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analysis Result'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(widget.imageFile, height: 250, fit: BoxFit.cover),
            ),
            const SizedBox(height: 24),
            
            // Detection Result
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text(
                      widget.result.fruit.toUpperCase(),
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.result.freshness,
                      style: TextStyle(
                        fontSize: 20, 
                        color: widget.result.freshness == 'Fresh' ? Colors.green 
                             : widget.result.freshness == 'Rotten' ? Colors.red 
                             : Colors.orange
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Confidence: ${(widget.result.confidence * 100).toStringAsFixed(1)}%'),
                    if (widget.result.message != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(8),
                        color: Colors.amber.shade100,
                        child: Text(widget.result.message!, style: const TextStyle(color: Colors.black87)),
                      )
                    ]
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Environment Adjustments
            if (widget.result.freshness != 'Unknown' && widget.result.freshness != 'Rotten') ...[
              const Text('Environment Settings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.thermostat),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Temperature: ${_tempC.round()}°C'),
                        Slider(
                          value: _tempC,
                          min: 0,
                          max: 40,
                          onChanged: (val) => setState(() => _tempC = val),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.water_drop),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Humidity: ${_humidity.round()}%'),
                        Slider(
                          value: _humidity,
                          min: 20,
                          max: 100,
                          onChanged: (val) => setState(() => _humidity = val),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Shelf Life Result
              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Text('Estimated Shelf Life', style: TextStyle(fontSize: 16)),
                      const SizedBox(height: 8),
                      Text(
                        '$shelfLifeDays Days',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                    ],
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
