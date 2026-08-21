'use client';

import { useEffect, useState } from 'react';

interface ImagePreviewProps {
  file: File;
  onRetake: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function ImagePreview({ file, onRetake, onAnalyze, isAnalyzing }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-gray-100 border border-gray-200">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Produce preview" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Analyze Produce</span>
            </>
          )}
        </button>
        
        <button
          onClick={onRetake}
          disabled={isAnalyzing}
          className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Retake / Change Image
        </button>
      </div>
    </div>
  );
}
