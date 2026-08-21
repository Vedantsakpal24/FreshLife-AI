export function estimateShelfLife(fruit: string, freshness: string, temperature: number, humidity: number): string {
  const fallbackShelfLife: Record<string, Record<string, [number, number]>> = {
    'banana': {'fresh': [5, 7], 'semi_fresh': [2, 3], 'rotten': [0, 0]},
    'orange': {'fresh': [10, 14], 'semi_fresh': [3, 5], 'rotten': [0, 0]},
    'papaya': {'fresh': [4, 6], 'semi_fresh': [1, 2], 'rotten': [0, 0]},
    'pineapple': {'fresh': [3, 5], 'semi_fresh': [1, 2], 'rotten': [0, 0]},
    'tomato': {'fresh': [7, 10], 'semi_fresh': [2, 4], 'rotten': [0, 0]},
    'cucumber': {'fresh': [7, 10], 'semi_fresh': [2, 3], 'rotten': [0, 0]},
    'eggplant': {'fresh': [5, 7], 'semi_fresh': [1, 3], 'rotten': [0, 0]},
    'bittermelon': {'fresh': [4, 6], 'semi_fresh': [1, 2], 'rotten': [0, 0]}
  };
  
  const fruitKey = fruit.toLowerCase().replace(/ /g, '_');
  const freshKey = freshness.toLowerCase().replace(/ /g, '_');
  
  if (!fallbackShelfLife[fruitKey]) {
      return "Unknown / Needs Additional Model Support";
  }
      
  const baseLife = fallbackShelfLife[fruitKey][freshKey] || [1, 3];
  
  // Environmental factors
  let multiplier = 1.0;
  if (temperature > 25) {
      multiplier *= Math.pow(0.95, temperature - 25);
  }
  
  // Humidity logic (simple heuristic)
  if (humidity < 40) {
      multiplier *= 0.9; // too dry, might shrivel
  } else if (humidity > 85) {
      multiplier *= 0.9; // too humid, might mold fast
  }
      
  const minDays = Math.max(0, Math.round(baseLife[0] * multiplier));
  const maxDays = Math.max(minDays, Math.round(baseLife[1] * multiplier));
  
  if (minDays === 0 && maxDays === 0) {
      return "0 Days (Discard)";
  }
  return `${minDays}–${maxDays} Days`;
}
