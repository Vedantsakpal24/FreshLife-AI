'use client';

import { STORAGE_CONDITIONS } from '@/lib/constants';

interface EnvValues {
  temperature: number;
  humidity: number;
  storage: string;
}

interface EnvironmentInputProps {
  values: EnvValues;
  onChange: (values: EnvValues) => void;
  disabled?: boolean;
}

export default function EnvironmentInput({ values, onChange, disabled }: EnvironmentInputProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <h3 className="font-semibold text-gray-800 text-lg">Storage Conditions</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            🌡️ Temperature (°C)
          </label>
          <input
            type="number"
            value={values.temperature}
            onChange={(e) => onChange({ ...values, temperature: Number(e.target.value) })}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:opacity-50"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            💧 Humidity (%)
          </label>
          <input
            type="number"
            value={values.humidity}
            onChange={(e) => onChange({ ...values, humidity: Number(e.target.value) })}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Storage Location</label>
        <div className="grid grid-cols-2 gap-2">
          {STORAGE_CONDITIONS.map((cond) => (
            <button
              key={cond.value}
              onClick={() => onChange({ ...values, storage: cond.value })}
              disabled={disabled}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${values.storage === cond.value 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } disabled:opacity-50`}
            >
              <span>{cond.icon}</span>
              <span>{cond.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
