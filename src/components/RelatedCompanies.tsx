'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface RelatedStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  industry: string;
}

interface RelatedCompaniesProps {
  symbol: string;
}

export default function RelatedCompanies({ symbol }: RelatedCompaniesProps) {
  const [relatedData, setRelatedData] = useState<RelatedStock[]>([]);
  const [sector, setSector] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedStocks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stock/related?symbol=${symbol}&limit=6`);
        const data = await res.json();
        
        if (data.related && Array.isArray(data.related)) {
          setRelatedData(data.related);
          setSector(data.sector);
        }
      } catch (err) {
        console.error('Failed to fetch related stocks:', err);
        setRelatedData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedStocks();
  }, [symbol]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#00BFFF] animate-spin" />
        </div>
      </div>
    );
  }

  if (relatedData.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Related Companies
          {sector && (
            <span className="text-sm font-normal text-[#6B7280]">in {sector}</span>
          )}
        </h3>
        <Link 
          href={`/stock/${symbol}`}
          className="text-sm text-[#00BFFF] hover:text-[#00A8E8] flex items-center gap-1"
        >
          View {symbol} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {relatedData.map((company) => {
          const isPositive = company.changePercent >= 0;
          return (
            <Link
              key={company.ticker}
              href={`/stock/${company.ticker}`}
              className="p-4 bg-[#12121A] hover:bg-[#1F1F2E] rounded-xl transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white group-hover:text-[#00BFFF] transition-colors">
                  {company.ticker}
                </span>
                <ArrowRight className="w-4 h-4 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-[#6B7280] mb-2 truncate">
                {company.name}
              </p>
              <div>
                <p className="text-sm font-mono text-white">
                  ${company.price?.toFixed(2)}
                </p>
                <div className={`flex items-center gap-1 text-xs font-mono ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{company.changePercent?.toFixed(2)}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <p className="text-xs text-[#6B7280] mt-4">
        Companies in the same sector as {symbol}
      </p>
    </div>
  );
}
