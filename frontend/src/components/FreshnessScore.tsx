'use client';

import { useEffect, useState } from 'react';
import { FRESHNESS_THRESHOLDS } from '@/lib/constants';

interface FreshnessScoreProps {
  score: number;
}

export default function FreshnessScore({ score }: FreshnessScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getThreshold = (s: number) => {
    const thresholds = Object.values(FRESHNESS_THRESHOLDS);
    for (const t of thresholds) {
      if (s >= t.min && s <= t.max) return t;
    }
    return FRESHNESS_THRESHOLDS.LIKELY_SPOILED;
  };

  const threshold = getThreshold(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="relative flex items-center justify-center">
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={threshold.color}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800 tracking-tighter">
            {Math.round(animatedScore)}<span className="text-2xl text-gray-400">%</span>
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold" style={{ color: threshold.color }}>
          {threshold.label}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Freshness Score</p>
      </div>
    </div>
  );
}
