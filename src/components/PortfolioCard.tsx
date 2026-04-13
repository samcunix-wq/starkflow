'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  isCurrency?: boolean;
  isMain?: boolean;
}

export default function PortfolioCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  isCurrency = true,
  isMain = false 
}: PortfolioCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === undefined;

  return (
    <div className={`card p-6 ${isMain ? 'col-span-2' : ''}`}>
      <p className="text-sm text-[#6B7280] mb-2">{title}</p>
      <p className="text-2xl font-bold text-white font-mono tracking-tight">
        {isCurrency ? '$' : ''}{value}
      </p>
      
      {!isNeutral && change !== undefined && changePercent !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-mono">
            {isPositive ? '+' : ''}{isCurrency ? `$${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
}
