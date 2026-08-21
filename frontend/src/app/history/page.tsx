'use client';

import { useEffect, useState } from 'react';
import ScanHistoryList from '@/components/ScanHistoryList';
import { getScans } from '@/lib/api';
import { ProduceScan } from '@/lib/types';

export default function HistoryPage() {
  const [scans, setScans] = useState<ProduceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const data = await getScans();
        setScans(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan History</h1>
        <p className="text-gray-500">Your previous produce analyses.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl">
          {error}
        </div>
      ) : (
        <ScanHistoryList scans={scans} />
      )}
    </div>
  );
}
