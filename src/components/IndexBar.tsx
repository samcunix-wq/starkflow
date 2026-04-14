'use client';

import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function IndexBar() {
  const [indices, setIndices] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchIndices() {
      try {
        const symbols = '^GSPC,^IXIC,^RUT,^DJI';
        const res = await fetch(`/api/stock?symbol=${symbols}&summary=true`);
        const data = await res.json();
        
        if (data.holdings) {
          setIndices(data.holdings);
        }
      } catch (err) {
        console.error('Failed to fetch indices:', err);
      }
    }
    fetchIndices();
  }, []);

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return '0.00';
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num.toFixed(2);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-10 bg-[#0A0A0F] border-b border-[#1F1F2E] flex items-center px-6 overflow-x-auto">
      {indices.map((index, idx) => (
        <div key={index?.symbol || `index-${idx}`} className="flex items-center gap-3 pr-6 border-r border-[#1F1F2E] last:border-r-0">
          <div>
            <span className="text-xs font-medium text-[#9CA3AF]">{index?.name || 'Loading...'}</span>
          </div>
          <div className="text-sm font-semibold text-white font-mono">
            {formatNumber(index?.currentPrice || 0)}
          </div>
          <div className={`text-xs font-mono flex items-center gap-1 ${(index?.changePercent || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {(index?.changePercent || 0) >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {(index?.changePercent || 0) >= 0 ? '+' : ''}{(index?.changePercent || 0).toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
}