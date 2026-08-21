class ShelfLifeService {
  static const Map<String, int> baseShelfLife = {
    'banana': 5,
    'bittermelon': 4,
    'cucumber': 7,
    'eggplant': 5,
    'orange': 14,
    'papaya': 5,
    'pineapple': 3,
    'tomato': 7
  };

  static const Map<String, double> conditionModifiers = {
    'Fresh': 1.0,
    'Semi Fresh': 0.6,
    'Rotten': 0.0
  };

  static int estimateShelfLife(String fruit, String freshness, double tempC, double humidityPercent) {
    if (freshness == 'Unknown') {
      return 0; // Not determinable
    }

    String normalizedFruit = fruit.toLowerCase();
    double baseDays = (baseShelfLife[normalizedFruit] ?? 5).toDouble();
    double conditionMod = conditionModifiers[freshness] ?? 0.0;

    if (conditionMod == 0.0) return 0; // Rotten

    // Temperature Logic (Ideal ~15C)
    double tempMod = 1.0;
    if (tempC > 25) {
      tempMod = 0.5;
    } else if (tempC > 20) {
      tempMod = 0.8;
    } else if (tempC < 10) {
      tempMod = 1.2;
    }

    // Humidity Logic (Ideal ~85%)
    double humidityMod = 1.0;
    if (humidityPercent > 90) {
      humidityMod = 0.8; // Too humid, rot faster
    } else if (humidityPercent < 60) {
      humidityMod = 0.7; // Too dry, shrivel faster
    }

    double rawEstimate = baseDays * conditionMod * tempMod * humidityMod;
    int finalEstimate = rawEstimate.round();

    return finalEstimate < 1 ? 1 : finalEstimate;
  }
}
