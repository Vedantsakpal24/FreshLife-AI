import 'package:flutter/material.dart';
import 'screens/home.dart';
import 'services/ml_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FreshLifeApp());
}

class FreshLifeApp extends StatelessWidget {
  const FreshLifeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FreshLife AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
