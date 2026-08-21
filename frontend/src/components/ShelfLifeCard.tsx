interface ShelfLifeCardProps {
  shelfLife: string;
  condition: string;
}

export default function ShelfLifeCard({ shelfLife, condition }: ShelfLifeCardProps) {
  const isUnknown = shelfLife.toLowerCase().includes('unknown') || shelfLife.toLowerCase().includes('model');
  const isExpired = shelfLife.includes('0 Days');
  
  let daysMatch = shelfLife.match(/(\d+)/g);
  let maxDays = 99;
  if (daysMatch && daysMatch.length > 0) {
    maxDays = parseInt(daysMatch[daysMatch.length - 1], 10);
  }

  const getUrgencyClass = () => {
    if (isUnknown) return 'bg-gray-50 border-gray-200 text-gray-700';
    if (isExpired || maxDays <= 2) return 'bg-red-50 border-red-100 text-red-900';
    if (maxDays <= 5) return 'bg-orange-50 border-orange-100 text-orange-900';
    return 'bg-green-50 border-green-100 text-green-900';
  };

  const getIconClass = () => {
    if (isUnknown) return 'bg-gray-200 text-gray-500';
    if (isExpired || maxDays <= 2) return 'bg-red-100 text-red-500';
    if (maxDays <= 5) return 'bg-orange-100 text-orange-500';
    return 'bg-green-100 text-green-500';
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm ${getUrgencyClass()}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">Estimated Remaining</p>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {isExpired ? 'EXPIRED' : (isUnknown ? 'UNKNOWN' : shelfLife.toUpperCase())}
          </div>
          <p className="text-sm font-medium opacity-80 mt-2">
            Storage: <span className="capitalize">{condition.replace('_', ' ')}</span>
          </p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ml-2 ${getIconClass()}`}>
          ⏳
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-black/5">
        <p className="text-xs opacity-70 flex items-start gap-1.5">
          <span className="text-[10px]">ℹ️</span>
          <span>
            {isUnknown 
              ? "More freshness training data is required for reliable shelf-life estimation for this item." 
              : "This is an AI-generated estimate based on visual appearance and environmental inputs. Always use your best judgment."}
          </span>
        </p>
      </div>
    </div>
  );
}
