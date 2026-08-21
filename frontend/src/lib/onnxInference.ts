import * as ort from 'onnxruntime-web';

// Configure ORT to locate WASM files locally instead of CDN
ort.env.wasm.wasmPaths = '/wasm/';

let primarySession: ort.InferenceSession | null = null;
let fallbackSession: ort.InferenceSession | null = null;
let imagenetClasses: string[] | null = null;

const BEST_CLASSES = [
  'fresh_banana', 'fresh_bittermelon', 'fresh_cucumber', 'fresh_eggplant', 
  'fresh_orange', 'fresh_papaya', 'fresh_pineapple', 'fresh_tomato', 
  'rotten_banana', 'rotten_bittermelon', 'rotten_cucumber', 'rotten_eggplant', 
  'rotten_orange', 'rotten_papaya', 'rotten_pineapple', 'rotten_tomato', 
  'semi_fresh_banana', 'semi_fresh_bittermelon', 'semi_fresh_cucumber', 
  'semi_fresh_eggplant', 'semi_fresh_orange', 'semi_fresh_papaya', 
  'semi_fresh_pineapple', 'semi_fresh_tomato'
];

export async function initModels() {
  if (!primarySession) {
    try {
      primarySession = await ort.InferenceSession.create('/models/best.onnx', { executionProviders: ['wasm'] });
    } catch (e) {
      console.error("Failed to load best.onnx", e);
    }
  }
  if (!fallbackSession) {
    try {
      fallbackSession = await ort.InferenceSession.create('/models/mobilenet.onnx', { executionProviders: ['wasm'] });
      const res = await fetch('/models/imagenet_classes.json');
      imagenetClasses = await res.json();
    } catch (e) {
      console.error("Failed to load mobilenet.onnx", e);
    }
  }
}

async function prepareImageTensor(imageFile: File, size: number = 224, mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225]): Promise<ort.Tensor> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size).data;
      
      const floatData = new Float32Array(3 * size * size);
      for (let i = 0; i < size * size; i++) {
        const r = imgData[i * 4] / 255.0;
        const g = imgData[i * 4 + 1] / 255.0;
        const b = imgData[i * 4 + 2] / 255.0;
        
        floatData[i] = (r - mean[0]) / std[0];
        floatData[size * size + i] = (g - mean[1]) / std[1];
        floatData[2 * size * size + i] = (b - mean[2]) / std[2];
      }
      resolve(new ort.Tensor('float32', floatData, [1, 3, size, size]));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function softmax(arr: Float32Array): Float32Array {
  const max = Math.max(...Array.from(arr));
  const exps = arr.map(x => Math.exp(x - max));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sumExps);
}

export async function runInference(imageFile: File): Promise<{
  fruit: string,
  freshness: string,
  confidence: number,
  prediction_source: string,
  message?: string
}> {
  await initModels();
  
  if (!primarySession) throw new Error("Primary model not loaded.");
  
  // Predict with YOLO classification
  // YOLO doesn't use standard imagenet normalization usually, it uses division by 255 without mean/std.
  const yoloTensor = await prepareImageTensor(imageFile, 224, [0,0,0], [1,1,1]);
  const primaryFeeds: Record<string, ort.Tensor> = {};
  primaryFeeds[primarySession.inputNames[0]] = yoloTensor;
  const primaryOutput = await primarySession.run(primaryFeeds);
  const logits = primaryOutput[primarySession.outputNames[0]].data as Float32Array;
  
  const probs = softmax(logits);
  let maxProb = -1;
  let maxIdx = -1;
  for(let i=0; i<probs.length; i++) {
    if(probs[i] > maxProb) { maxProb = probs[i]; maxIdx = i; }
  }
  
  if (maxProb >= 0.50) {
    const className = BEST_CLASSES[maxIdx];
    const parts = className.split("_");
    const freshnessRaw = parts.slice(0, -1).join("_");
    const fruitRaw = parts[parts.length - 1];
    
    return {
      fruit: fruitRaw.replace("_", " "),
      freshness: freshnessRaw.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
      confidence: maxProb,
      prediction_source: "best.pt"
    };
  }
  
  // Fallback
  if (!fallbackSession || !imagenetClasses) {
    return {
      fruit: "Unable to confidently identify this fruit or vegetable",
      freshness: "Unknown",
      confidence: maxProb,
      prediction_source: "best.pt",
      message: "Fallback model unavailable."
    };
  }
  
  const fallbackTensor = await prepareImageTensor(imageFile, 224, [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]);
  const fallbackFeeds: Record<string, ort.Tensor> = {};
  fallbackFeeds[fallbackSession.inputNames[0]] = fallbackTensor;
  const fallbackOutput = await fallbackSession.run(fallbackFeeds);
  const fbLogits = fallbackOutput[fallbackSession.outputNames[0]].data as Float32Array;
  const fbProbs = softmax(fbLogits);
  
  let fbMax = -1;
  let fbIdx = -1;
  for(let i=0; i<fbProbs.length; i++) {
    if(fbProbs[i] > fbMax) { fbMax = fbProbs[i]; fbIdx = i; }
  }
  
  if (fbMax < 0.15) {
    return {
      fruit: "Unable to confidently identify this fruit or vegetable",
      freshness: "Unknown",
      confidence: fbMax,
      prediction_source: "general_vision_model",
      message: "More freshness training data is required for reliable shelf-life estimation."
    };
  }
  
  return {
    fruit: imagenetClasses[fbIdx].replace(/_/g, " "),
    freshness: "Unknown",
    confidence: fbMax,
    prediction_source: "general_vision_model",
    message: "More freshness training data is required for reliable shelf-life estimation."
  };
}
