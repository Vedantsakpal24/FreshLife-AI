export const FRESHNESS_THRESHOLDS = {
  VERY_FRESH: { min: 90, max: 100, label: 'Very Fresh', color: '#22c55e' },
  FRESH: { min: 75, max: 89, label: 'Fresh', color: '#84cc16' },
  CONSUME_SOON: { min: 50, max: 74, label: 'Consume Soon', color: '#eab308' },
  OVERRIPE: { min: 25, max: 49, label: 'Overripe', color: '#f97316' },
  LIKELY_SPOILED: { min: 0, max: 24, label: 'Likely Spoiled', color: '#ef4444' },
};

export const SUPPORTED_PRODUCE = ['banana', 'bittermelon', 'cucumber', 'eggplant', 'orange', 'papaya', 'pineapple', 'tomato'];

export const STORAGE_CONDITIONS = [
  { value: 'room_temperature', label: 'Room Temperature', icon: '🏠' },
  { value: 'refrigerator', label: 'Refrigerator', icon: '❄️' },
  { value: 'cool_dry', label: 'Cool/Dry Place', icon: '🌿' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const PRODUCE_EMOJIS: Record<string, string> = {
  banana: '🍌', orange: '🍊', papaya: '🥭', pineapple: '🍍',
  tomato: '🍅', cucumber: '🥒', eggplant: '🍆', bittermelon: '🥬',
};

export const ML_SERVER_URL = process.env.ML_SERVER_URL || process.env.NEXT_PUBLIC_ML_SERVER_URL || 'https://freshlife-ai.onrender.com';
export const NEXT_PUBLIC_ML_SERVER_URL = process.env.NEXT_PUBLIC_ML_SERVER_URL || 'https://freshlife-ai.onrender.com';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
