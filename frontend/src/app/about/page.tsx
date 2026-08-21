import { SUPPORTED_PRODUCE, PRODUCE_EMOJIS } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About FreshLife AI</h1>
        <p className="text-xl text-gray-600 leading-relaxed text-balance">
          Using artificial intelligence to reduce food waste by estimating the freshness and shelf life of your produce.
        </p>
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Image Analysis</h3>
              <p className="text-gray-600">Our deep learning model (EfficientNet) analyzes the visual appearance of the produce, looking for signs of ripening, bruising, or spoilage.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Environmental Integration</h3>
              <p className="text-gray-600">We combine the visual analysis with your environmental inputs (temperature, humidity, storage method) using an XGBoost model to understand how quickly the item will degrade.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Estimation</h3>
              <p className="text-gray-600">You receive a freshness score (0-100) and an estimated shelf life range based on the combined data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Produce</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUPPORTED_PRODUCE.map(produce => (
            <div key={produce} className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <div className="text-3xl mb-2">{PRODUCE_EMOJIS[produce]}</div>
              <div className="font-medium capitalize text-gray-700">{produce}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
        <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span>⚠️</span> Limitations & Disclaimer
        </h2>
        <ul className="space-y-3 text-amber-800 list-disc list-inside marker:text-amber-400">
          <li><strong>AI Estimate Only:</strong> This tool provides estimates based on visual and environmental data. It is not a food safety certification.</li>
          <li><strong>Always Use Judgment:</strong> If an item smells bad, feels unusually soft/slimy, or shows signs of mold, discard it regardless of the app's prediction.</li>
          <li><strong>Image Quality Matters:</strong> Results heavily depend on lighting and image clarity. Poor photos may yield inaccurate results.</li>
          <li><strong>Limited Scope:</strong> Currently only supports the specific produce items listed above.</li>
        </ul>
      </section>
    </div>
  );
}
