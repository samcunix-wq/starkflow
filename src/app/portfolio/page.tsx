'use client';

import { useState, useMemo, useEffect } from 'react';
import { Download, Search, Plus, X, Loader2, Check, TrendingUp, Pencil } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { isConfigured, supabase } from '@/lib/supabase';
import HoldingsTable from '@/components/HoldingsTable';
import AllocationChart from '@/components/AllocationChart';

const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#00BFFF',
  'Communication Services': '#00D4FF',
  'Consumer Cyclical': '#0099CC',
  'Consumer Defensive': '#00FFB0',
  'Healthcare': '#FF6B6B',
  'Financial Services': '#FFD93D',
  'Industrials': '#6BCB77',
  'Energy': '#FF8C42',
  'Utilities': '#A66CFF',
  'Real Estate': '#FF6B9D',
  'Basic Materials': '#4ECDC4',
  'Other': '#6B7280',
};

export default function PortfolioPage() {
  const { holdings, setHoldings, isLoading, purchasingPower, setPurchasingPower, realizedPL } = usePortfolio();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ symbol: '', shares: '', avgCost: '', reason: '' });
  const [addingPosition, setAddingPosition] = useState(false);
  const [sp500Data, setSp500Data] = useState<{price: number; change: number; changePercent: number; ytdChange: number} | null>(null);
  const [showPPModal, setShowPPModal] = useState(false);
  const [ppInput, setPpInput] = useState('');
  const [ppLoading, setPpLoading] = useState(false);

  useEffect(() => {
    async function fetchSP500() {
      try {
        const res = await fetch('/api/stock?symbol=^GSPC');
        const data = await res.json();
        if (data.price) {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const yearStartPrice = data.price - data.change;
          const ytdChange = ((data.price - yearStartPrice) / yearStartPrice) * 100;
          setSp500Data({
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            ytdChange
          });
        }
      } catch (err) {
        console.error('Failed to fetch S&P 500:', err);
      }
    }
    fetchSP500();
  }, []);

  const INDEX_TICKERS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^TNX'];
  const portfolioHoldings = useMemo(() => 
    holdings.filter(h => !INDEX_TICKERS.includes(h.ticker) && !h.ticker.startsWith('^')),
    [holdings]
  );

  const filteredHoldings = useMemo(() => {
    if (!searchQuery) return portfolioHoldings;
    return portfolioHoldings.filter(
      h => h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
           h.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [portfolioHoldings, searchQuery]);

  const holdingsValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalCost = portfolioHoldings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
  const totalGain = holdingsValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const totalValue = holdingsValue + purchasingPower;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const portfolioYTDPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const allocationData = useMemo(() => {
    if (portfolioHoldings.length === 0) return [];
    
    const sectorMap = new Map<string, number>();
    portfolioHoldings.forEach(h => {
      const sector = h.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.totalValue);
    });

    const allocations: any[] = [];
    sectorMap.forEach((value, sector) => {
      allocations.push({
        sector,
        value,
        percentage: Math.round((value / holdingsValue) * 100),
        color: SECTOR_COLORS[sector] || '#6B7280',
      });
    });

    allocations.sort((a, b) => b.percentage - a.percentage);
    return allocations.slice(0, 6);
  }, [portfolioHoldings, holdingsValue]);

  const handleAddPosition = async () => {
    if (!addForm.symbol || !addForm.shares || !addForm.avgCost) return;
    
    setAddingPosition(true);
    
    try {
      const ticker = addForm.symbol.toUpperCase();
      const shares = parseFloat(addForm.shares);
      const avgCost = parseFloat(addForm.avgCost);
      const costBasis = shares * avgCost;
      
      if (costBasis > purchasingPower) {
        alert('Insufficient purchasing power');
        setAddingPosition(false);
        return;
      }

      const res = await fetch(`/api/stock?symbol=${ticker}`);
      const data = await res.json();
      
      const newHolding = {
        id: Date.now().toString(),
        ticker,
        name: data.name || ticker,
        shares,
        avgCost,
        currentPrice: data.price || avgCost,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        totalValue: shares * (data.price || avgCost),
        totalGain: (data.price - avgCost) * shares,
        totalGainPercent: ((data.price - avgCost) / avgCost) * 100,
        peRatio: data.peRatio || 0,
        dividendYield: data.dividendYield || 0,
        exDivDate: '',
        nextEarningsDate: '',
        sector: data.sector || 'Other',
      };

      const existingIndex = holdings.findIndex(h => h.ticker === ticker);
      let updatedHoldings;
      
      if (existingIndex >= 0) {
        updatedHoldings = [...holdings];
        const existing = updatedHoldings[existingIndex];
        const totalShares = existing.shares + shares;
        const totalCostBasis = (existing.shares * existing.avgCost) + (shares * avgCost);
        updatedHoldings[existingIndex] = {
          ...existing,
          shares: totalShares,
          avgCost: totalCostBasis / totalShares,
          currentPrice: newHolding.currentPrice,
          totalValue: totalShares * newHolding.currentPrice,
          totalGain: (newHolding.currentPrice - (totalCostBasis / totalShares)) * totalShares,
          totalGainPercent: ((newHolding.currentPrice - (totalCostBasis / totalShares)) / (totalCostBasis / totalShares)) * 100,
        };
      } else {
        updatedHoldings = [...holdings, newHolding];
      }

      setHoldings(updatedHoldings);
      setPurchasingPower(purchasingPower - costBasis);
      
      addNotification({
        type: 'purchase',
        title: `Bought ${shares} ${ticker}`,
        message: `$${costBasis.toLocaleString()} at $${avgCost}/share`,
        ticker,
      });

      setAddForm({ symbol: '', shares: '', avgCost: '', reason: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add position:', err);
    }
    
    setAddingPosition(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00BFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-[#6B7280]">Track and analyze your investments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAddForm({ symbol: '', shares: '', avgCost: '', reason: '' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] rounded-xl text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Total Portfolio Value</p>
          <p className="text-lg font-bold text-white font-mono">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-[#6B7280]">Purchasing Power</p>
            <button
              onClick={() => {
                setPpInput(purchasingPower.toString());
                setShowPPModal(true);
              }}
              className="text-[#6B7280] hover:text-white transition-colors p-1"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          <p className="text-lg font-bold text-[#10B981] font-mono">
            ${purchasingPower.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Total Gain/Loss</p>
          <p className={`text-lg font-bold font-mono ${totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className={`text-xs ${totalGainPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            ({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%)
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">vs S&P 500 (Total)</p>
          <p className={`text-lg font-bold font-mono ${(totalGainPercent - (sp500Data?.changePercent || 0)) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {(totalGainPercent - (sp500Data?.changePercent || 0)) >= 0 ? '+' : ''}{(totalGainPercent - (sp500Data?.changePercent || 0)).toFixed(1)}%
          </p>
          <p className="text-xs text-[#6B7280]">S&P: {(sp500Data?.changePercent || 0) >= 0 ? '+' : ''}{(sp500Data?.changePercent || 0).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Invested Value</p>
          <p className="text-lg font-bold text-white font-mono">
            ${holdingsValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Total Cost</p>
          <p className="text-lg font-bold text-white font-mono">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Realized P/L</p>
          <p className={`text-lg font-bold font-mono ${realizedPL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {realizedPL >= 0 ? '+' : ''}${Math.abs(realizedPL).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[#6B7280] mb-1">Positions</p>
          <p className="text-lg font-bold text-white font-mono">{portfolioHoldings.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">All Holdings</h3>
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
            </div>
            <HoldingsTable holdings={filteredHoldings} showAll />
          </div>
        </div>
        <div className="lg:col-span-1">
          <AllocationChart data={allocationData} />
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Position</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Stock Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL"
                  value={addForm.symbol}
                  onChange={(e) => setAddForm({ ...addForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Number of Shares</label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={addForm.shares}
                  onChange={(e) => setAddForm({ ...addForm, shares: e.target.value })}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Average Cost per Share ($)</label>
                <input
                  type="number"
                  placeholder="e.g., 150.00"
                  value={addForm.avgCost}
                  onChange={(e) => setAddForm({ ...addForm, avgCost: e.target.value })}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Reason (optional - JARVIS will remember)</label>
                <input
                  type="text"
                  placeholder="e.g., For dividend income, growth play, etc."
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              <button
                onClick={handleAddPosition}
                disabled={addingPosition || !addForm.symbol || !addForm.shares || !addForm.avgCost}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#6B7280] rounded-xl text-white font-medium transition-colors"
              >
                {addingPosition ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {addingPosition ? 'Adding...' : 'Add Position'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPPModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit Purchasing Power</h3>
              <button
                onClick={() => setShowPPModal(false)}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Current Balance</label>
                <p className="text-2xl font-bold text-white">
                  ${purchasingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">New Balance</label>
                <input
                  type="number"
                  value={ppInput}
                  onChange={(e) => setPpInput(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="Enter new balance"
                  autoFocus
                />
              </div>
              
              <button
                onClick={async () => {
                  const newAmount = parseFloat(ppInput);
                  if (isNaN(newAmount) || newAmount < 0) return;
                  
                  setPpLoading(true);
                  
                  if (isConfigured && supabase && user) {
                    await supabase
                      .from('purchasing_power')
                      .update({ amount: newAmount })
                      .eq('user_id', user.id);
                  }
                  
                  setPurchasingPower(newAmount);
                  localStorage.setItem('starkflow_purchasing_power', JSON.stringify(newAmount));
                  window.dispatchEvent(new CustomEvent('portfolio-updated'));
                  
                  setPpLoading(false);
                  setShowPPModal(false);
                }}
                disabled={ppLoading || !ppInput}
                className="w-full py-3 px-6 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {ppLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
