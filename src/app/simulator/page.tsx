'use client';

import { useState, useEffect } from 'react';
import { LineChart as ChartIcon, TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Play, X, Search, Loader2 } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface Scenario {
  id: string;
  symbol: string;
  startDate: string;
  investmentAmount: number;
  monthlyContribution: number;
  currentValue: number;
  totalInvested: number;
  gain: number;
  gainPercent: number;
}

export default function SimulatorPage() {
  const { holdings, purchasingPower } = usePortfolio();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    startDate: '',
    investmentAmount: '',
    monthlyContribution: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const runSimulation = async () => {
    if (!formData.symbol || !formData.investmentAmount) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/simulator/history?symbol=${formData.symbol}&range=1y`
      );
      const data = await res.json();
      
      if (data.prices && data.prices.length > 0) {
        const startPrice = data.prices[0].price;
        const endPrice = data.prices[data.prices.length - 1].price;
        const investment = parseFloat(formData.investmentAmount);
        const shares = investment / startPrice;
        const currentValue = shares * endPrice;
        const totalInvested = investment + (parseFloat(formData.monthlyContribution || '0') * 12);
        const gain = currentValue - totalInvested;
        const gainPercent = (gain / totalInvested) * 100;
        
        const newScenario: Scenario = {
          id: Date.now().toString(),
          symbol: formData.symbol.toUpperCase(),
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          investmentAmount: investment,
          monthlyContribution: parseFloat(formData.monthlyContribution || '0'),
          currentValue,
          totalInvested,
          gain,
          gainPercent,
        };
        
        setScenarios([...scenarios, newScenario]);
        setShowForm(false);
        setFormData({ symbol: '', startDate: '', investmentAmount: '', monthlyContribution: '' });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
    
    setLoading(false);
  };

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Simulator</h1>
          <p className="text-[#6B7280]">Test investment strategies with historical data</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="card p-12 text-center">
          <ChartIcon className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Simulations Yet</h2>
          <p className="text-[#6B7280] mb-6">
            Create your first investment scenario to see how it would have performed
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white font-medium transition-colors mx-auto"
          >
            <Play className="w-4 h-4" />
            Run Your First Simulation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00BFFF]/20 to-[#006699]/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#00BFFF]">{scenario.symbol.substring(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{scenario.symbol}</h3>
                    <p className="text-xs text-[#6B7280]">1 Year Return</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteScenario(scenario.id)}
                  className="p-2 text-[#6B7280] hover:text-red-400 hover:bg-[#12121A] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">Invested</span>
                  <span className="text-sm text-white font-mono">${scenario.totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">Current Value</span>
                  <span className="text-sm text-white font-mono">${scenario.currentValue.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-[#1F1F2E]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6B7280]">Return</span>
                    <span className={`text-lg font-bold font-mono ${scenario.gain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {scenario.gain >= 0 ? '+' : ''}{scenario.gainPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">New Simulation</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm text-[#6B7280] mb-2 block">Stock Symbol</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => {
                      setFormData({ ...formData, symbol: e.target.value.toUpperCase() });
                      handleSearch(e.target.value);
                    }}
                    placeholder="e.g., AAPL"
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-[#0D0D12] border border-[#1F1F2E] rounded-xl overflow-hidden z-10">
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => {
                          setFormData({ ...formData, symbol: result.symbol });
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#12121A] transition-colors"
                      >
                        <span className="text-white font-medium">{result.symbol}</span>
                        <span className="text-[#6B7280] text-sm ml-2">{result.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Initial Investment ($)</label>
                <input
                  type="number"
                  value={formData.investmentAmount}
                  onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                  placeholder="e.g., 10000"
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Monthly Contribution ($)</label>
                <input
                  type="number"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="e.g., 500"
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>
              
              <button
                onClick={runSimulation}
                disabled={loading || !formData.symbol || !formData.investmentAmount}
                className="w-full py-3 px-6 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
