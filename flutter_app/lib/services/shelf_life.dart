class ShelfLifeService {
  static const Map<String, int> baseShelfLife = {
    'Banana': 5,
    'Bittermelon': 4,
    'Cucumber': 7,
    'Eggplant': 5,
    'Orange': 14,
    'Papaya': 5,
    'Pineapple': 3,
    'Tomato': 7
  };

  static const Map<String, double> conditionModifiers = {
    'Fresh': 1.0,
    'Semi Fresh': 0.6,
    'Rotten': 0.0
  };

  static int estimateShelfLife(String fruit, String freshness, double tempC, double humidityPercent) {
    if (freshness == 'Unknown') return 0;

    double baseDays = (baseShelfLife[fruit] ?? 5).toDouble();
    double conditionMod = conditionModifiers[freshness] ?? 0.0;

    if (conditionMod == 0.0) return 0;

    double tempMod = 1.0;
    if (tempC > 25) {
      tempMod = 0.5;
    } else if (tempC > 20) {
      tempMod = 0.8;
    } else if (tempC < 10) {
      tempMod = 1.2;
    }

    double humidityMod = 1.0;
    if (humidityPercent > 90) {
      humidityMod = 0.8;
    } else if (humidityPercent < 60) {
      humidityMod = 0.7;
    }

    int finalEstimate = (baseDays * conditionMod * tempMod * humidityMod).round();
    return finalEstimate < 1 ? 1 : finalEstimate;
  }
}
