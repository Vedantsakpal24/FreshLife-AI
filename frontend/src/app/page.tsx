import Link from 'next/link';
import { SUPPORTED_PRODUCE, PRODUCE_EMOJIS } from '@/lib/constants';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
          FreshLife <span className="text-green-500">AI</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed text-balance">
          Scan a fruit or vegetable. Get freshness and estimated shelf life instantly.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
        <Link 
          href="/scan" 
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25 active:scale-95"
        >
          <span>📷</span>
          <span>Scan Produce</span>
        </Link>
        <Link 
          href="/scan?upload=true" 
          className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-2xl text-lg font-bold hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
        >
          <span>📁</span>
          <span>Upload Image</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl mx-auto pt-12 border-t border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">1</div>
          <h3 className="font-semibold text-gray-900">Scan</h3>
          <p className="text-sm text-gray-500">Take a photo of your produce</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">2</div>
          <h3 className="font-semibold text-gray-900">Add conditions</h3>
          <p className="text-sm text-gray-500">Enter temp and storage details</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">3</div>
          <h3 className="font-semibold text-gray-900">Get results</h3>
          <p className="text-sm text-gray-500">See freshness & shelf life</p>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto pt-8">
        <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Supported Produce</p>
        <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_PRODUCE.map(produce => (
            <div key={produce} className="bg-white border border-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2 shadow-sm">
              <span className="text-lg">{PRODUCE_EMOJIS[produce]}</span>
              <span className="capitalize">{produce}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
