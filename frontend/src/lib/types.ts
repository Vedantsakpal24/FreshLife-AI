export interface Detection {
  class_name: string;
  produce: string;
  condition: string;
  confidence: number;
  box?: [number, number, number, number];
}

export interface ProduceScan {
  _id?: string;
  id?: string; // Add id for local storage fallback
  userId: string;
  imageUrl: string;
  produce: string;
  category: string; // 'fruit' | 'vegetable'
  produceConfidence: number;
  condition: string; // 'fresh' | 'semi_fresh' | 'rotten'
  conditionConfidence: number;
  freshnessScore: number; // 0-100
  shelfLifeMin: number;
  shelfLifeMax: number;
  shelfLifeConfidence: number;
  temperatureC: number;
  humidityPercent: number;
  storageCondition: string;
  recommendation: string;
  explanations: string[];
  detections?: Detection[];
  createdAt: string;
}

export interface PredictionResponse {
  success: boolean;
  produce?: string;
  category?: string;
  produce_confidence?: number;
  condition?: string;
  condition_confidence?: number;
  freshness_score?: number;
  temperature_c?: number;
  humidity_percent?: number;
  storage_condition?: string;
  shelf_life_min_days?: number;
  shelf_life_max_days?: number;
  shelf_life_confidence?: number;
  recommendation?: string;
  explanations?: string[];
  detections?: Detection[];
  error?: string;
  warning?: string;
}

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  step: string;
  progress: number;
}
