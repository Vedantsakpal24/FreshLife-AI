'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShelfLifeCard from '@/components/ShelfLifeCard';
import { getScan } from '@/lib/api';
import { PRODUCE_EMOJIS } from '@/lib/constants';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScan = async () => {
      if (!id) {
        setError('No result ID provided in the URL');
        setLoading(false);
        return;
      }
      try {
        setError('');
        const data = await getScan(id);
        if (!data) {
          setError('Result not found or has expired.');
        } else {
          setScan(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load scan result');
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading result...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{error || 'Result not found'}</p>
        <Link href="/scan" className="text-green-500 hover:underline">Scan another item</Link>
      </div>
    );
  }

  const emoji = PRODUCE_EMOJIS[scan.fruit?.toLowerCase()] || '❓';

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/history" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-sm text-gray-400">{new Date(scan.createdAt).toLocaleString()}</span>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full max-w-md mx-auto aspect-[4/3] bg-gray-50">
        <img src={scan.imageUrl} alt="Scanned produce" className="absolute top-0 left-0 w-full h-full object-contain" />
        {scan.detections?.map((det: any, idx: number) => {
          if (!det.box) return null;
          const [x1, y1, x2, y2] = det.box;
          const left = `${x1 * 100}%`;
          const top = `${y1 * 100}%`;
          const width = `${(x2 - x1) * 100}%`;
          const height = `${(y2 - y1) * 100}%`;
          return (
            <div
              key={idx}
              className="absolute border-2 border-green-500 pointer-events-none"
              style={{ left, top, width, height }}
            >
              <div className="absolute -top-6 left-[-2px] bg-green-500 text-white text-xs font-bold px-2 py-0.5 whitespace-nowrap">
                {det.produce.toUpperCase()} ({Math.round(det.confidence * 100)}%)
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
          {emoji}
        </div>
        <div>
          <div className="flex flex-col gap-1 mb-1">
            <h1 className="text-3xl font-black text-gray-900 capitalize">{scan.fruit}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                {scan.prediction_source === 'best.pt' ? 'Supported Class' : 'General Vision'}
              </span>
            </div>
          </div>
          <p className="text-gray-500 flex flex-col gap-1 mt-2 text-sm">
            <span>Confidence: {Math.round(scan.confidence * 100)}%</span>
            <span className="text-xs text-gray-400">Source: {scan.prediction_source}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">
            {scan.freshness === 'Fresh' ? '🟢' : scan.freshness === 'Semi Fresh' ? '🟡' : scan.freshness === 'Rotten' ? '🔴' : '⚪'}
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Freshness</div>
          <div className="text-2xl font-black text-gray-800">{scan.freshness}</div>
        </div>
        <ShelfLifeCard 
          shelfLife={scan.shelf_life} 
          condition={scan.storage_condition || 'room_temperature'} 
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Environment</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="font-semibold">{scan.temperature_c}°C</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-2xl mb-1">💧</div>
            <div className="font-semibold">{scan.humidity_percent}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center justify-center">
            <div className="font-semibold capitalize text-sm">{(scan.storage_condition || 'room_temperature').replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {scan.message && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span>💡</span> Note
          </h3>
          <p className="text-blue-800 leading-relaxed">{scan.message}</p>
        </div>
      )}

      <div className="pt-6">
        <Link 
          href="/scan" 
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-600 transition-colors shadow-sm"
        >
          <span>📷</span> Scan Another Item
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading result...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
