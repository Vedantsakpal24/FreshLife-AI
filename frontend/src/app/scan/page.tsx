'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import EnvironmentInput from '@/components/EnvironmentInput';
import AnalysisProgress from '@/components/AnalysisProgress';
import { analyzeProduce } from '@/lib/api';
import { AnalysisState } from '@/lib/types';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [envValues, setEnvValues] = useState({
    temperature: 25,
    humidity: 60,
    storage: 'room_temperature'
  });
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    step: '',
    progress: 0
  });
  
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setActiveTab('upload');
    }
  }, [searchParams]);

  const handleCapture = (file: File) => {
    setImageFile(file);
    setError('');
  };

  const handleRetake = () => {
    setImageFile(null);
    setAnalysisState({ status: 'idle', step: '', progress: 0 });
    setError('');
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    try {
      setAnalysisState({ status: 'uploading', step: 'Uploading image...', progress: 10 });
      setError('');
      
      const steps = [
        { status: 'analyzing', step: 'Identifying produce...', progress: 30, delay: 500 },
        { status: 'analyzing', step: 'Checking freshness...', progress: 60, delay: 1500 },
        { status: 'analyzing', step: 'Estimating shelf life...', progress: 90, delay: 2500 },
      ];
      
      let stepTimeouts: NodeJS.Timeout[] = [];
      steps.forEach(s => {
        const timeout = setTimeout(() => {
          setAnalysisState({ status: s.status as any, step: s.step, progress: s.progress });
        }, s.delay);
        stepTimeouts.push(timeout);
      });

      const result = await analyzeProduce(
        imageFile, 
        envValues.temperature, 
        envValues.humidity, 
        envValues.storage
      );
      
      stepTimeouts.forEach(clearTimeout);
      
      const scanId = result._id || (result as any).id;
      if (scanId) {
        setAnalysisState({ status: 'complete', step: 'Analysis complete! Loading results...', progress: 100 });
        router.push(`/result?id=${scanId}`);
      } else {
        setError('Invalid response received from server.');
        setAnalysisState({ status: 'idle', step: '', progress: 0 });
      }
    } catch (err: any) {
      console.error('Scan Error:', err);
      setError(err.message || 'An error occurred during analysis');
      setAnalysisState({ status: 'error', step: '', progress: 0 });
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Scan Produce</h1>
      </div>
      
      {!imageFile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 flex">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'camera' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Upload Image
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {!imageFile ? (
          activeTab === 'camera' ? (
            <CameraCapture onCapture={handleCapture} />
          ) : (
            <ImageUpload onImageSelect={handleCapture} />
          )
        ) : (
          <ImagePreview 
            file={imageFile} 
            onRetake={handleRetake} 
            onAnalyze={handleAnalyze}
            isAnalyzing={['uploading', 'analyzing'].includes(analysisState.status)}
          />
        )}

        {imageFile && analysisState.status === 'idle' && (
          <EnvironmentInput 
            values={envValues} 
            onChange={setEnvValues}
            disabled={['uploading', 'analyzing'].includes(analysisState.status)}
          />
        )}

        {['uploading', 'analyzing', 'complete'].includes(analysisState.status) && (
          <AnalysisProgress state={analysisState} />
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500">Loading scanner...</p>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
