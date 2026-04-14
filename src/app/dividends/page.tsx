'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, Plus, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface DividendGoal {
  targetAmount: number;
  currentAnnualIncome: number;
  monthsToGoal?: number;
}

interface DividendPayment {
  date: string;
  paymentDate: string;
  amount: number;
  ticker: string;
  frequency: string;
}

export default function DividendsPage() {
  const { holdings } = usePortfolio();
  const INDEX_TICKERS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^TNX'];
  const portfolioHoldings = useMemo(() => 
    holdings.filter(h => !INDEX_TICKERS.includes(h.ticker) && !h.ticker.startsWith('^')),
    [holdings]
  );
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalAmount, setGoalAmount] = useState(10000);

  const dividendHoldings = useMemo(() => {
    return portfolioHoldings.filter(h => (h.dividendYield || 0) > 0);
  }, [portfolioHoldings]);

  const metrics = useMemo(() => {
    let annualIncome = 0;
    let totalValue = 0;
    let totalCost = 0;

    portfolioHoldings.forEach(h => {
      const annual = (h.dividendYield || 0) * h.shares;
      annualIncome += annual;
      totalValue += h.totalValue;
      totalCost += h.shares * h.avgCost;
    });

    const currentYield = totalValue > 0 ? (annualIncome / totalValue) * 100 : 0;
    const avgYieldOnCost = totalCost > 0 ? (annualIncome / totalCost) * 100 : 0;

    return {
      annualIncome,
      currentYield,
      avgYieldOnCost,
      totalValue,
      totalCost,
    };
  }, [portfolioHoldings]);

  const goalProgress = useMemo(() => {
    const progress = (metrics.annualIncome / goalAmount) * 100;
    return { progress: Math.min(progress, 100) };
  }, [metrics.annualIncome, goalAmount]);

  const now = new Date();

  const upcomingDividends = useMemo(() => {
    const payments: DividendPayment[] = [];
    
    dividendHoldings.forEach(h => {
      const frequency = 'quarterly';
      const payoutsPerYear = 4;
      const payoutAmount = (h.dividendYield || 0) * h.shares / payoutsPerYear;
      
      const displayDate = h.exDivDate;
      
      if (displayDate && displayDate !== '-' && displayDate !== 'TBD') {
        const date = new Date(displayDate);
        
        if (date > now && date <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
          payments.push({
            date: displayDate,
            paymentDate: displayDate,
            amount: payoutAmount,
            ticker: h.ticker,
            frequency,
          });
        }
      }
      
      if (displayDate && displayDate !== '-' && displayDate !== 'TBD') {
        for (let i = 1; i < payoutsPerYear && payments.length < 10; i++) {
          const nextDate = new Date(displayDate);
          nextDate.setMonth(nextDate.getMonth() + (i * 3));
          
          if (nextDate > now && nextDate <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
            payments.push({
              date: nextDate.toISOString().split('T')[0],
              paymentDate: nextDate.toISOString().split('T')[0],
              amount: payoutAmount,
              ticker: h.ticker,
              frequency,
            });
          }
        }
      }
    });
    
    return payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dividendHoldings, now]);

  const projectedIncome = useMemo(() => {
    const next90Days = upcomingDividends.reduce((sum, p) => sum + p.amount, 0);
    const annualized = next90Days > 0 ? (next90Days / 90) * 365 : 0;
    return annualized;
  }, [upcomingDividends]);

  const incomeProjections = useMemo(() => {
    const next30Days = upcomingDividends
      .filter(p => new Date(p.date).getTime() <= now.getTime() + 30 * 24 * 60 * 60 * 1000)
      .reduce((sum, p) => sum + p.amount, 0);
    const next90Days = upcomingDividends.reduce((sum, p) => sum + p.amount, 0);
    
    const avgPayout = upcomingDividends.length > 0 ? next90Days / upcomingDividends.length : 0;
    const payoutCount90 = upcomingDividends.length;
    const payoutCount180 = Math.min(payoutCount90 * 2, 10);
    const next6Months = avgPayout > 0 ? avgPayout * payoutCount180 : (next90Days / 90) * 180;
    
    return { next30Days, next90Days, next6Months };
  }, [upcomingDividends]);

  const aiNote = useMemo(() => {
    if (goalProgress.progress >= 100) {
      return "Congratulations! You've reached your dividend goal!";
    }
    if (metrics.annualIncome <= 0) {
      return "Start building your dividend portfolio to track progress toward your goal.";
    }
    const remaining = goalAmount - metrics.annualIncome;
    return `$${remaining.toLocaleString()} left to reach your goal of $${goalAmount.toLocaleString()}/year`;
  }, [goalProgress, metrics.annualIncome, goalAmount]);

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dividends & Income</h1>
          <p className="text-[#6B7280]">Track your passive income from dividend investments</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="card p-5 border border-[#10B981]/30 bg-gradient-to-br from-[#10B981]/5 to-transparent">
          <p className="text-xs text-[#6B7280] mb-2">Annual Dividend Income</p>
          <p className="text-2xl font-bold text-[#10B981] font-mono">
            ${metrics.annualIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[#6B7280] mb-2">Current Yield</p>
          <p className="text-2xl font-bold text-white font-mono">
            {metrics.currentYield.toFixed(2)}%
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[#6B7280] mb-2">Yield on Cost</p>
          <p className="text-2xl font-bold text-white font-mono">
            {metrics.avgYieldOnCost.toFixed(2)}%
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[#6B7280] mb-2">Annualized (90 days)</p>
          <p className="text-2xl font-bold text-white font-mono">
            ${projectedIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[#6B7280] mb-2">Goal Progress</p>
          <p className="text-2xl font-bold text-[#00BFFF] font-mono">
            {goalProgress.progress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Goal Tracker */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#00BFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">${goalAmount.toLocaleString()} / Year Dividend Goal</h3>
              <p className="text-sm text-[#6B7280]">{metrics.annualIncome >= goalAmount ? 'Goal achieved!' : `${goalProgress.progress.toFixed(1)}% complete`}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2 bg-[#12121A] border border-[#1F1F2E] rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
          >
            Set Goal
          </button>
        </div>
        
        <div className="mb-6">
          <div className="h-4 bg-[#12121A] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00BFFF] to-[#10B981] transition-all duration-500"
              style={{ width: `${goalProgress.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-[#12121A] rounded-xl">
          <Info className="w-5 h-5 text-[#00BFFF]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="text-[#00BFFF] font-medium">Grok says: </span>
            {aiNote}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6">Dividend Holdings</h3>
        
        {dividendHoldings.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
            <p className="text-[#6B7280]">No dividend-paying holdings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F2E]">
                  <th className="text-left text-xs text-[#6B7280] font-medium py-3 px-4">Ticker</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Shares</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Yield</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Yield on Cost</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Annual</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Ex-Date</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Payment</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Freq</th>
                  <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {dividendHoldings.map((holding) => {
                  const annualIncome = (holding.dividendYield || 0) * holding.shares;
                  const yieldOnCost = holding.avgCost > 0 ? ((holding.dividendYield || 0) * holding.shares / (holding.shares * holding.avgCost)) * 100 : 0;
                  const isExpanded = expandedRow === holding.ticker;

                  return (
                    <React.Fragment key={holding.ticker}>
                      <tr 
                        key={holding.ticker} 
                        className="border-b border-[#1F1F2E] hover:bg-[#12121A] transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : holding.ticker)}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-white">{holding.ticker}</p>
                            <p className="text-xs text-[#6B7280]">{holding.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 text-white font-mono">{holding.shares}</td>
                        <td className="text-right py-4 px-4 text-[#10B981] font-mono">{holding.dividendYield?.toFixed(2) || 0}%</td>
                        <td className="text-right py-4 px-4 text-white font-mono">{yieldOnCost.toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 text-white font-mono">${annualIncome.toFixed(0)}</td>
                        <td className="text-right py-4 px-4 text-white font-mono">{holding.exDivDate || 'N/A'}</td>
                        <td className="text-right py-4 px-4 text-white font-mono">-</td>
                        <td className="text-right py-4 px-4 text-[#6B7280] font-mono text-xs">Q</td>
                        <td className="text-right py-4 px-4">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#6B7280] inline" /> : <ChevronDown className="w-5 h-5 text-[#6B7280] inline" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${holding.ticker}-expanded`}>
                          <td colSpan={10} className="bg-[#12121A] p-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-[#6B7280] mb-1">Current Price</p>
                                <p className="text-white font-mono">${holding.currentPrice.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#6B7280] mb-1">Dividend Yield</p>
                                <p className="text-white font-mono">{(holding.dividendYield || 0).toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#6B7280] mb-1">Cost Basis</p>
                                <p className="text-white font-mono">${(holding.shares * holding.avgCost).toFixed(0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#6B7280] mb-1">Total Return</p>
                                <p className={`font-mono ${holding.totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                  {holding.totalGain >= 0 ? '+' : ''}${holding.totalGain.toFixed(0)}
                                </p>
                              </div>
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
        )}
      </div>

      {/* Upcoming Dividends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-[#00BFFF]" />
            <h3 className="text-lg font-semibold text-white">Upcoming Dividends (90 days)</h3>
          </div>
          
          {upcomingDividends.length === 0 ? (
            <p className="text-[#6B7280] text-center py-8">No upcoming dividends in the next 90 days</p>
          ) : (
            <div className="space-y-3">
              {upcomingDividends.slice(0, 10).map((div, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#12121A] rounded-xl">
                  <div>
                    <p className="font-semibold text-white">{div.ticker}</p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(div.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <span className="text-[#10B981] ml-2">({div.frequency})</span>
                    </p>
                  </div>
                  <p className="text-[#10B981] font-mono">+${div.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <h3 className="text-lg font-semibold text-white">Income Projections</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#12121A] rounded-xl">
              <p className="text-[#6B7280]">Next 30 Days</p>
              <p className="text-xl font-bold text-white font-mono">${incomeProjections.next30Days.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#12121A] rounded-xl">
              <p className="text-[#6B7280]">Next 90 Days</p>
              <p className="text-xl font-bold text-white font-mono">${incomeProjections.next90Days.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#12121A] rounded-xl">
              <p className="text-[#6B7280]">Next 6 Months</p>
              <p className="text-xl font-bold text-white font-mono">${incomeProjections.next6Months.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/30 rounded-xl">
              <p className="text-[#6B7280]">Annualized</p>
              <p className="text-xl font-bold text-[#10B981] font-mono">${projectedIncome.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Set Dividend Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-[#6B7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Annual Goal Amount ($)</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white font-mono text-xl"
                />
              </div>
              
              <div className="p-4 bg-[#12121A] rounded-xl">
                <p className="text-sm text-[#6B7280] mb-2">Current Progress</p>
                <p className="text-2xl font-bold text-[#00BFFF] font-mono">
                  ${metrics.annualIncome.toLocaleString()} / ${goalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-[#6B7280]">({goalProgress.progress.toFixed(1)}% of goal)</p>
              </div>
              
              <button
                onClick={() => setShowGoalModal(false)}
                className="w-full py-3 bg-[#00BFFF] hover:bg-[#00A8E8] text-white font-medium rounded-xl"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}