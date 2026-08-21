'use client';

import { AnalysisState } from '@/lib/types';

interface AnalysisProgressProps {
  state: AnalysisState;
}

const STEPS = [
  { id: 'uploading', label: 'Uploading image...' },
  { id: 'identifying', label: 'Identifying produce...' },
  { id: 'analyzing', label: 'Checking freshness...' },
  { id: 'estimating', label: 'Estimating shelf life...' },
];

export default function AnalysisProgress({ state }: AnalysisProgressProps) {
  if (state.status === 'idle' || state.status === 'error') return null;

  // Derive active index based on step string or status
  let activeIndex = 0;
  if (state.status === 'complete') activeIndex = STEPS.length;
  else if (state.step.includes('Identifying')) activeIndex = 1;
  else if (state.step.includes('Checking') || state.step.includes('freshness')) activeIndex = 2;
  else if (state.step.includes('Estimating') || state.step.includes('shelf')) activeIndex = 3;

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <h3 className="font-semibold text-gray-800 text-lg mb-4">Analysis in Progress</h3>
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex || state.status === 'complete';
          const isActive = index === activeIndex && state.status !== 'complete';
          const isPending = index > activeIndex && state.status !== 'complete';

          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                ${isCompleted ? 'bg-green-100 text-green-500' : 
                  isActive ? 'bg-blue-100 text-blue-500' : 
                  'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : isActive ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
              <span className={`text-sm font-medium ${isCompleted ? 'text-gray-800' : isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-green-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(10, state.progress)}%` }}
        />
      </div>
    </div>
  );
}
