import { runInference } from './onnxInference';
import { estimateShelfLife } from './shelfLife';

export async function compressImage(file: File, maxDimension = 224, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg') || 'produce.jpg', {
                type: 'image/jpeg',
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function analyzeProduce(imageFile: File, temperature: number, humidity: number, storage: string): Promise<any> {
  // Compress and resize for ONNX inference 
  // (though prepareImageTensor in onnxInference handles resize too, compression helps data url size)
  const optimizedFile = await compressImage(imageFile, 400);

  // 1. Run completely offline ONNX inference!
  const inferenceData = await runInference(optimizedFile);
  
  // 2. Estimate Shelf Life
  const shelfLife = estimateShelfLife(inferenceData.fruit, inferenceData.freshness, temperature, humidity);

  const mlData = {
    success: true,
    fruit: inferenceData.fruit,
    freshness: inferenceData.freshness,
    confidence: inferenceData.confidence,
    prediction_source: inferenceData.prediction_source,
    message: inferenceData.message,
    shelf_life: shelfLife,
    temperature_c: temperature,
    humidity_percent: humidity,
    storage_condition: storage
  };

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(optimizedFile);
    reader.onload = () => {
      const scanId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const finalResult = {
        ...mlData,
        id: scanId,
        _id: scanId,
        imageUrl: reader.result as string,
        createdAt: new Date().toISOString()
      };

      try {
        const existingScans = JSON.parse(localStorage.getItem('freshlife_scans') || '[]');
        existingScans.unshift(finalResult);
        localStorage.setItem('freshlife_scans', JSON.stringify(existingScans));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }

      resolve(finalResult);
    };
    reader.onerror = () => {
      resolve({ ...mlData, id: Date.now().toString(), _id: Date.now().toString() });
    };
  });
}

export async function getScans(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('freshlife_scans') || '[]');
  } catch (e) {
    return [];
  }
}

export async function getScan(id: string): Promise<any | null> {
  const scans = await getScans();
  return scans.find((s: any) => s.id === id || s._id === id) || null;
}
