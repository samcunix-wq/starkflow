'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, X, Loader2, Check } from 'lucide-react';
import { Holding } from '@/data/mockData';
import Link from 'next/link';

interface SellModalProps {
  holding: Holding;
  onClose: () => void;
  onConfirm: (sharesSold: number, price: number) => void;
}

function SellModal({ holding, onClose, onConfirm }: SellModalProps) {
  const [sharesSold, setSharesSold] = useState('');
  const [price, setPrice] = useState(holding.currentPrice.toString());
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    const shares = parseFloat(sharesSold);
    const sellPrice = parseFloat(price);
    if (shares > 0 && shares <= holding.shares && sellPrice > 0) {
      setLoading(true);
      setTimeout(() => {
        onConfirm(shares, sellPrice);
        setLoading(false);
      }, 500);
    }
  };

  const isValid = () => {
    const shares = parseFloat(sharesSold);
    const sellPrice = parseFloat(price);
    return shares > 0 && shares <= holding.shares && sellPrice > 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Sell {holding.ticker}</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-[#12121A] rounded-lg">
          <p className="text-sm text-[#6B7280]">Available Shares</p>
          <p className="text-lg font-semibold text-white">{holding.shares} shares</p>
          <p className="text-sm text-[#6B7280] mt-1">Current Price: ${holding.currentPrice.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#6B7280] mb-2 block">Shares to Sell</label>
            <input
              type="number"
              max={holding.shares}
              placeholder={`Max: ${holding.shares}`}
              value={sharesSold}
              onChange={(e) => setSharesSold(e.target.value)}
              className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
            />
          </div>
          <div>
            <label className="text-sm text-[#6B7280] mb-2 block">Sell Price per Share ($)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
            />
          </div>
          
          {sharesSold && price && (
            <div className="p-3 bg-[#12121A] rounded-lg">
              <p className="text-sm text-[#6B7280]">Total Sale Value</p>
              <p className="text-xl font-bold text-white">
                ${(parseFloat(sharesSold) * parseFloat(price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          <button
            onClick={handleConfirm}
            disabled={loading || !isValid()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#6B7280] rounded-xl text-white font-medium transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {loading ? 'Processing...' : 'Confirm Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface HoldingsTableProps {
  holdings: Holding[];
  showAll?: boolean;
  onSell?: (ticker: string, sharesSold: number, price: number) => void;
  onBuy?: (ticker: string) => void;
}

const INDEX_TICKERS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^TNX'];

export default function HoldingsTable({ holdings, showAll = false, onSell, onBuy }: HoldingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sellingTicker, setSellingTicker] = useState<string | null>(null);
  const filteredHoldings = holdings.filter(h => !INDEX_TICKERS.includes(h.ticker) && !h.ticker.startsWith('^'));
  const displayHoldings = showAll ? filteredHoldings : filteredHoldings.slice(0, 5);

  const handleSell = (ticker: string, sharesSold: number, price: number) => {
    if (onSell) {
      onSell(ticker, sharesSold, price);
    }
    setSellingTicker(null);
  };

  const currentHolding = sellingTicker ? holdings.find(h => h.ticker === sellingTicker) : null;

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
                <React.Fragment key={holding.id}>
                  <tr
                    className="border-b border-[#1F1F2E]/50 last:border-0 cursor-pointer hover:bg-[#12121A]/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : holding.id)}
                  >
                    <td className="py-4">
                      <Link 
                        href={`/stock/${holding.ticker}`} 
                        className="hover:text-[#00BFFF] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <p className="font-semibold text-white">{holding.ticker}</p>
                          <p className="text-xs text-[#6B7280]">{holding.name}</p>
                        </div>
                      </Link>
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
                      <div className="p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#12121A]/30">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Net Return</p>
                              <p className={`text-sm font-mono ${holding.totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {holding.totalGain >= 0 ? '+' : ''}${holding.totalGain.toFixed(2)} ({holding.totalGainPercent.toFixed(2)}%)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Dividend Yield</p>
                              <p className="text-sm text-white font-mono">{holding.dividendYield.toFixed(2)}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Avg Cost</p>
                              <p className="text-sm text-white font-mono">${holding.avgCost.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Day Change</p>
                              <p className={`text-sm font-mono ${holding.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {holding.change >= 0 ? '+' : ''}${holding.change.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Ex-Div Date</p>
                              <p className="text-sm text-white font-mono">{holding.exDivDate && holding.exDivDate !== '-' ? holding.exDivDate : 'TBD'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#00BFFF]" />
                            <div>
                              <p className="text-xs text-[#6B7280]">Next Earnings</p>
                              <p className="text-sm text-white font-mono">{holding.nextEarningsDate && holding.nextEarningsDate !== '-' ? holding.nextEarningsDate : 'TBD'}</p>
                            </div>
                          </div>
                          {(onSell || onBuy) && (
                            <div className="flex items-center justify-end gap-3 mt-4">
                              {onBuy && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onBuy) onBuy(holding.ticker);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-lg transition-colors font-medium"
                                >
                                  Buy More
                                </button>
                              )}
                              {onSell && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSellingTicker(holding.ticker);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg transition-colors font-medium"
                                >
                                  Sell
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      </tr>
                    )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {currentHolding && (
        <SellModal
          holding={currentHolding}
          onClose={() => setSellingTicker(null)}
          onConfirm={(sharesSold, price) => handleSell(currentHolding.ticker, sharesSold, price)}
        />
      )}
    </div>
  );
}
