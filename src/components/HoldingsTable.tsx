'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { Holding } from '@/data/mockData';

interface HoldingsTableProps {
  holdings: Holding[];
  showAll?: boolean;
}

export default function HoldingsTable({ holdings, showAll = false }: HoldingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const displayHoldings = showAll ? holdings : holdings.slice(0, 5);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Holdings</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1F1F2E]">
              <th className="text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider pb-3">Ticker</th>
              <th className="text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider pb-3">Shares</th>
              <th className="text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider pb-3">Price</th>
              <th className="text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider pb-3">Change</th>
              <th className="text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider pb-3">Value</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {displayHoldings.map((holding) => {
              const isExpanded = expandedId === holding.id;
              const isPositive = holding.change >= 0;

              return (
                <>
                  <tr
                    key={holding.id}
                    onClick={() => setExpandedId(isExpanded ? null : holding.id)}
                    className="border-b border-[#1F1F2E]/50 last:border-0 cursor-pointer hover:bg-[#12121A]/50 transition-colors"
                  >
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-white">{holding.ticker}</p>
                        <p className="text-xs text-[#6B7280]">{holding.name}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-[#9CA3AF] font-mono">{holding.shares}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-white font-mono">${holding.currentPrice.toFixed(2)}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-mono text-sm">
                          {isPositive ? '+' : ''}{holding.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-white font-mono font-semibold">
                        ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#12121A]/30">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">P/E Ratio</p>
                              <p className="text-sm text-white font-mono">{holding.peRatio}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Dividend Yield</p>
                              <p className="text-sm text-white font-mono">{holding.dividendYield.toFixed(2)}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Ex-Div Date</p>
                              <p className="text-sm text-white font-mono">{holding.exDivDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Next Earnings</p>
                              <p className="text-sm text-white font-mono">{holding.nextEarningsDate}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
