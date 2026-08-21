import Link from 'next/link';
import { ProduceScan } from '@/lib/types';
import { PRODUCE_EMOJIS, FRESHNESS_THRESHOLDS } from '@/lib/constants';

interface ScanHistoryListProps {
  scans: ProduceScan[];
}

export default function ScanHistoryList({ scans }: ScanHistoryListProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No scans yet</h3>
        <p className="text-gray-500 mb-6">Scan your first fruit or vegetable to see it here.</p>
        <Link 
          href="/scan" 
          className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
        >
          Start Scanning
        </Link>
      </div>
    );
  }

  const getFreshnessColor = (score: number) => {
    const thresholds = Object.values(FRESHNESS_THRESHOLDS);
    for (const t of thresholds) {
      if (score >= t.min && score <= t.max) return t.color;
    }
    return FRESHNESS_THRESHOLDS.LIKELY_SPOILED.color;
  };

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <Link 
          key={scan._id} 
          href={`/result?id=${scan._id || scan.id}`}
          className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
              {PRODUCE_EMOJIS[scan.produce.toLowerCase()] || '🥬'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-gray-900 capitalize truncate">
                  {scan.produce}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {new Date(scan.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: getFreshnessColor(scan.freshnessScore) }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(scan.freshnessScore)}%
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-200"></div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  ⏳ {scan.shelfLifeMin === scan.shelfLifeMax 
                    ? scan.shelfLifeMin 
                    : `${scan.shelfLifeMin}-${scan.shelfLifeMax}`} days
                </div>
              </div>
            </div>
            
            <div className="text-gray-400 group-hover:text-green-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
