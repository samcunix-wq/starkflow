'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Filter, Search } from 'lucide-react';
import { portfolioSummary, holdings, assetAllocation } from '@/data/mockData';
import HoldingsTable from '@/components/HoldingsTable';
import AllocationChart from '@/components/AllocationChart';

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHoldings = holdings.filter(
    (h) =>
      h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGain = holdings.reduce((acc, h) => acc + h.totalGain, 0);
  const totalInvested = portfolioSummary.totalValue - totalGain;

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-[#6B7280]">Track and analyze your investments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-[#6B7280] mb-2">Total Invested</p>
          <p className="text-2xl font-bold text-white font-mono">
            ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-[#6B7280] mb-2">Total Gain/Loss</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold font-mono ${totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className={`text-sm font-mono ${totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              ({((totalGain / totalInvested) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm text-[#6B7280] mb-2">Positions</p>
          <p className="text-2xl font-bold text-white font-mono">{holdings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">All Holdings</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search holdings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-[#12121A] border border-[#1F1F2E] rounded-xl text-[#9CA3AF] hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
            <HoldingsTable holdings={filteredHoldings} showAll />
          </div>
        </div>
        <div className="lg:col-span-1">
          <AllocationChart data={assetAllocation} />
        </div>
      </div>
    </div>
  );
}
