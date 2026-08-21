'use client';

import { useState } from 'react';

interface ExplainableResultProps {
  explanations: string[];
}

export default function ExplainableResult({ explanations }: ExplainableResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanations || explanations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h3 className="font-semibold text-gray-800">Why this result?</h3>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-5 border-t border-gray-100">
          <ul className="space-y-3">
            {explanations.map((exp, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-sm text-gray-600 leading-relaxed">
                  {exp}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-gray-50 flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-500">Detected by AI</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-500">Based on your input</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
