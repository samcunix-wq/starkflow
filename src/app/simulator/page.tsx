'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  Plus, Save, Trash2, Play, X, Info, 
  PieChart as PieChartIcon, BarChart3, LineChart, Search, PieChart
} from 'lucide-react';
import { useSimulator, SimulatorScenario, SimulatorResult } from '@/context/SimulatorContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend, ReferenceLine } from 'recharts';

interface ScenarioFormData {
  name: string;
  startDate: string;
  investmentAmount: string;
  monthlyContribution: string;
}

interface StockAllocation {
  id: string;
  symbol: string;
  name: string;
  allocation: string;
}

interface HistoricalData {
  symbol: string;
  name: string;
  currentPrice: number;
  startPrice: number;
  startDate: string;
  endDate: string;
  priceHistory: Array<{ date: string; price: number; close: number }>;
  dividends: Array<{ date: string; amount: number }>;
  splits: Array<{ date: string; ratio: string }>;
  summary: {
    totalDividends: number;
    dividendCount: number;
    totalReturn: number;
    priceReturn: number;
  };
  error?: string;
}

interface StockSimulationResult {
  symbol: string;
  name: string;
  shares: number;
  totalInvested: number;
  currentValue: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  priceHistory: Array<{ date: string; value: number }>;
}

interface PortfolioSimulationResult {
  stocks: StockSimulationResult[];
  totalValue: number;
  totalInvested: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  priceHistory: Array<{ date: string; value: number }>;
}

interface SearchResult {
  symbol: string;
  name: string;
}

const PRESET_DATES = [
  { label: '1 Year', years: 1 },
  { label: '2 Years', years: 2 },
  { label: '3 Years', years: 3 },
  { label: '5 Years', years: 5 },
  { label: '10 Years', years: 10 },
];

export default function SimulatorPage() {
  const { scenarios, results, addScenario, deleteScenario, saveResult } = useSimulator();
  const { holdings } = usePortfolio();
  
  const portfolioSummary = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
    const allTimePL = totalValue - totalCost;
    const allTimePLPercent = totalCost > 0 ? (allTimePL / totalCost) * 100 : 0;
    return { totalValue, allTimePL, allTimePLPercent };
  }, [holdings]);
  
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    startDate: '',
    investmentAmount: '',
    monthlyContribution: '',
  });
  
  const [stocks, setStocks] = useState<StockAllocation[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<PortfolioSimulationResult | null>(null);
  const [historicalDataMap, setHistoricalDataMap] = useState<Record<string, HistoricalData>>({});
  const [userHistoricalData, setUserHistoricalData] = useState<Record<string, HistoricalData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartPreset, setChartPreset] = useState('all');
  const [datePreset, setDatePreset] = useState<number | null>(3);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activeAddIndex, setActiveAddIndex] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.slice(0, 8));
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!formData.startDate) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 3);
      setFormData(prev => ({
        ...prev,
        startDate: date.toISOString().split('T')[0],
      }));
    }
  }, []);

  const addStock = (symbol: string, name: string) => {
    const newStock: StockAllocation = {
      id: `stock_${Date.now()}`,
      symbol,
      name,
      allocation: stocks.length === 0 ? '100' : '',
    };
    setStocks([...stocks, newStock]);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setActiveAddIndex(null);
  };

  const removeStock = (id: string) => {
    setStocks(stocks.filter(s => s.id !== id));
  };

  const updateStockAllocation = (id: string, allocation: string) => {
    setStocks(stocks.map(s => s.id === id ? { ...s, allocation } : s));
  };

  const calculateResults = async () => {
    if (stocks.length === 0 || !formData.startDate || !formData.investmentAmount) {
      setError('Please add at least one stock and fill in all fields');
      return;
    }

    const totalAllocation = stocks.reduce((sum, s) => sum + (parseFloat(s.allocation) || 0), 0);
    if (totalAllocation !== 100 && stocks.length > 1) {
      setError(`Total allocation must equal 100% (currently ${totalAllocation}%)`);
      return;
    }

    setError(null);
    setIsLoading(true);
    setPreviewResult(null);

    try {
      const historicalData: Record<string, HistoricalData> = {};
      
      for (const stock of stocks) {
        const res = await fetch(`/api/simulator/history?symbol=${stock.symbol}&startDate=${formData.startDate}`);
        const data: HistoricalData = await res.json();
        if (!data.error) {
          historicalData[stock.symbol] = data;
        }
      }

      setHistoricalDataMap(historicalData);

      let userHistoricalData: Record<string, HistoricalData> = {};
      if (holdings.length > 0) {
        for (const holding of holdings) {
          try {
            const res = await fetch(`/api/simulator/history?symbol=${holding.ticker}&startDate=${formData.startDate}`);
            const data: HistoricalData = await res.json();
            if (!data.error) {
              userHistoricalData[holding.ticker] = data;
            }
          } catch {
            // Skip stocks that fail
          }
        }
        setUserHistoricalData(userHistoricalData);
      }

      const investment = parseFloat(formData.investmentAmount);
      const monthly = parseFloat(formData.monthlyContribution) || 0;
      const years = (new Date().getTime() - new Date(formData.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

      const stockResults: StockSimulationResult[] = [];

      for (const stock of stocks) {
        const data = historicalData[stock.symbol];
        if (!data) continue;

        const allocation = stocks.length === 1 ? 100 : (parseFloat(stock.allocation) || 0);
        const stockInvestment = investment * (allocation / 100);
        const monthlyInvestment = monthly * (allocation / 100);

        const startPrice = data.startPrice;
        if (startPrice === 0) continue;

        let shares = stockInvestment / startPrice;
        let totalInvested = stockInvestment;
        let cumulativeDividends = 0;
        const valueHistory: Array<{ date: string; value: number }> = [];

        data.priceHistory.forEach((point, idx) => {
          if (monthlyInvestment > 0 && idx > 0 && idx % 21 === 0) {
            const newShares = monthlyInvestment / point.price;
            shares += newShares;
            totalInvested += monthlyInvestment;
          }

          valueHistory.push({
            date: point.date,
            value: shares * point.price,
          });
        });

        data.dividends.forEach(div => {
          cumulativeDividends += div.amount * shares;
        });

        const currentValue = shares * data.currentPrice;
        const totalReturn = currentValue + cumulativeDividends - totalInvested;
        const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
        const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturnPercent / 100, 1 / years) - 1) * 100 : totalReturnPercent;

        stockResults.push({
          symbol: stock.symbol,
          name: stock.name,
          shares,
          totalInvested,
          currentValue,
          totalDividends: cumulativeDividends,
          totalReturn,
          totalReturnPercent,
          annualizedReturn,
          priceHistory: valueHistory,
        });
      }

      const combinedHistory: Array<{ date: string; [key: string]: number | string }> = [];
      if (stockResults.length > 0 && stockResults[0].priceHistory.length > 0) {
        for (let i = 0; i < stockResults[0].priceHistory.length; i++) {
          const point: { date: string; [key: string]: number | string } = {
            date: stockResults[0].priceHistory[i].date,
          };
          let total = 0;
          stockResults.forEach(sr => {
            if (sr.priceHistory[i]) {
              point[sr.symbol] = sr.priceHistory[i].value;
              total += sr.priceHistory[i].value;
            }
          });
          point.total = total;
          combinedHistory.push(point);
        }
      }

      const totalValue = stockResults.reduce((sum, r) => sum + r.currentValue, 0);
      const totalDividends = stockResults.reduce((sum, r) => sum + r.totalDividends, 0);
      const totalInvestedAll = stockResults.reduce((sum, r) => sum + r.totalInvested, 0);
      const totalReturn = totalValue + totalDividends - totalInvestedAll;
      const totalReturnPercent = totalInvestedAll > 0 ? (totalReturn / totalInvestedAll) * 100 : 0;
      const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturnPercent / 100, 1 / years) - 1) * 100 : totalReturnPercent;

      const result: PortfolioSimulationResult = {
        stocks: stockResults,
        totalValue,
        totalInvested: totalInvestedAll,
        totalDividends,
        totalReturn,
        totalReturnPercent,
        annualizedReturn,
        priceHistory: combinedHistory.map(p => ({ date: p.date as string, value: p.total as number })),
      };

      setPreviewResult(result);
    } catch (err) {
      setError('Failed to run simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const saveScenario = () => {
    if (!scenarioName.trim() || !previewResult) return;

    const stockSymbols = stocks.map(s => s.symbol).join(',');
    
    const id = addScenario({
      name: scenarioName,
      symbol: stockSymbols,
      startDate: formData.startDate,
      investmentAmount: parseFloat(formData.investmentAmount),
      monthlyContribution: parseFloat(formData.monthlyContribution) || undefined,
    });

    const result: SimulatorResult = {
      scenarioId: id,
      currentValue: previewResult.totalValue,
      totalInvested: previewResult.totalInvested,
      totalDividends: previewResult.totalDividends,
      totalReturn: previewResult.totalReturn,
      totalReturnPercent: previewResult.totalReturnPercent,
      annualizedReturn: previewResult.annualizedReturn,
      priceHistory: previewResult.priceHistory,
      dividendHistory: [],
    };

    saveResult(result);
    setShowSaveModal(false);
    setScenarioName('');
    setActiveScenarioId(id);
  };

  const loadScenario = (scenario: SimulatorScenario) => {
    const symbols = scenario.symbol.split(',');
    const loadedStocks: StockAllocation[] = symbols.map((symbol, idx) => ({
      id: `stock_${idx}`,
      symbol: symbol.trim(),
      name: symbol.trim(),
      allocation: symbols.length === 1 ? '100' : (100 / symbols.length).toFixed(0),
    }));

    setStocks(loadedStocks);
    setFormData({
      name: scenario.name,
      startDate: scenario.startDate,
      investmentAmount: scenario.investmentAmount.toString(),
      monthlyContribution: scenario.monthlyContribution?.toString() || '',
    });
    setActiveScenarioId(scenario.id);
    calculateResults();
  };

  const chartData = useMemo(() => {
    if (!previewResult?.priceHistory?.length) return [];

    const data = previewResult.priceHistory;
    const endDate = new Date(data[data.length - 1]?.date || Date.now());
    
    let filteredData = data;
    
    switch (chartPreset) {
      case '1mo': {
        const cutoff = new Date(endDate);
        cutoff.setMonth(cutoff.getMonth() - 1);
        filteredData = data.filter(d => new Date(d.date) >= cutoff);
        break;
      }
      case '3mo': {
        const cutoff = new Date(endDate);
        cutoff.setMonth(cutoff.getMonth() - 3);
        filteredData = data.filter(d => new Date(d.date) >= cutoff);
        break;
      }
      case '6mo': {
        const cutoff = new Date(endDate);
        cutoff.setMonth(cutoff.getMonth() - 6);
        filteredData = data.filter(d => new Date(d.date) >= cutoff);
        break;
      }
      case '1y': {
        const cutoff = new Date(endDate);
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        filteredData = data.filter(d => new Date(d.date) >= cutoff);
        break;
      }
    }

    let maxPoints = 100;
    switch (chartPreset) {
      case '1mo':
        maxPoints = 22;
        break;
      case '3mo':
        maxPoints = 66;
        break;
      case '6mo':
        maxPoints = 132;
        break;
      case '1y':
        maxPoints = 252;
        break;
      default:
        maxPoints = filteredData.length;
    }

    const step = Math.max(1, Math.floor(filteredData.length / maxPoints));
    return filteredData.filter((_, idx) => idx % step === 0);
  }, [previewResult, chartPreset]);

  const portfolioChartData = useMemo(() => {
    if (!compareMode) return chartData;
    
    const data = chartData;
    if (!data.length || !holdings.length) return data;

    const histDataKeys = Object.keys(userHistoricalData);
    if (histDataKeys.length === 0) return data;

    const getPriceForDate = (priceHistory: any[], targetDate: string): number => {
      if (!priceHistory?.length) return 0;
      const target = new Date(targetDate).getTime();
      let closest = priceHistory[0];
      let minDiff = Infinity;
      
      for (const p of priceHistory) {
        const pDate = new Date(p.date).getTime();
        const diff = Math.abs(pDate - target);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
        if (pDate > target) break;
      }
      
      return closest?.close || closest?.price || 0;
    };

    return data.map((point) => {
      let portfolioValue = 0;
      
      for (const holding of holdings) {
        const hist = userHistoricalData[holding.ticker];
        if (!hist?.priceHistory?.length) {
          portfolioValue += holding.shares * holding.currentPrice;
          continue;
        }
        
        const price = getPriceForDate(hist.priceHistory, point.date);
        portfolioValue += holding.shares * price;
      }

      return { ...point, portfolio: portfolioValue };
    });
  }, [chartData, compareMode, holdings, userHistoricalData]);

  const userPortfolioTotalValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.totalValue, 0);
  }, [holdings]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const isPositive = (previewResult?.totalReturn || 0) >= 0;
  const showCompare = (previewResult || scenarios.length > 0) && holdings.length > 0;

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Simulator</h1>
          <p className="text-[#6B7280] mt-1">Explore hypothetical investment scenarios with real market data</p>
        </div>
        {showCompare && (
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              compareMode 
                ? 'bg-[#00BFFF] text-white' 
                : 'bg-[#1F1F2E] text-white hover:bg-[#2A2A3E]'
            }`}
          >
            <PieChart className="w-4 h-4" />
            {compareMode ? 'Hide Comparison' : 'Compare to Portfolio'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#00BFFF]" />
              Create Scenario
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Scenario Name (optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Diversified Portfolio"
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#4B5563]"
                />
              </div>

              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Stocks</label>
                <div className="space-y-2">
                  {stocks.map((stock, index) => (
                    <div key={stock.id} className="flex items-center gap-2">
                      <div className="flex-1 bg-[#12121A] rounded-xl px-3 py-2 text-white text-sm">
                        <span className="font-semibold">{stock.symbol}</span>
                        {stocks.length > 1 && (
                          <input
                            type="number"
                            value={stock.allocation}
                            onChange={(e) => updateStockAllocation(stock.id, e.target.value)}
                            placeholder="%"
                            className="w-16 bg-transparent text-right text-[#9CA3AF] outline-none ml-2"
                          />
                        )}
                        {stocks.length > 1 && <span className="text-[#6B7280] ml-1">%</span>}
                      </div>
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div ref={searchRef} className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSearchDropdown(true);
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        placeholder="Add stock..."
                        className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-white placeholder-[#4B5563] text-sm"
                      />
                    </div>
                    {showSearchDropdown && (searchResults.length > 0 || isSearching) && (
                      <div className="absolute z-50 w-full mt-1 bg-[#12121A] border border-[#1F1F2E] rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-3 text-center text-[#6B7280] text-sm">Searching...</div>
                        ) : (
                          searchResults.map((stock) => (
                            <button
                              key={stock.symbol}
                              onClick={() => addStock(stock.symbol, stock.name)}
                              className="w-full flex items-center p-3 hover:bg-[#1F1F2E] transition-colors text-left"
                            >
                              <div>
                                <p className="font-semibold text-white text-sm">{stock.symbol}</p>
                                <p className="text-xs text-[#6B7280]">{stock.name}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {stocks.length > 1 && (
                  <p className="text-xs text-[#6B7280] mt-2">
                    Total: {stocks.reduce((sum, s) => sum + (parseFloat(s.allocation) || 0), 0)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Investment Period</label>
                <div className="flex gap-2">
                  {PRESET_DATES.map((preset, index) => (
                    <button
                      key={preset.years}
                      onClick={() => {
                        const date = new Date();
                        date.setFullYear(date.getFullYear() - preset.years);
                        setFormData(prev => ({ ...prev, startDate: date.toISOString().split('T')[0] }));
                        setDatePreset(preset.years);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        datePreset === preset.years
                          ? 'bg-[#00BFFF] text-white'
                          : 'bg-[#12121A] text-[#9CA3AF] hover:bg-[#1F1F2E]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Total Investment *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                    placeholder="10000"
                    min="1"
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#4B5563]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Monthly Contribution (optional)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    placeholder="500"
                    min="0"
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#4B5563]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444] text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={calculateResults}
                disabled={isLoading || stocks.length === 0 || !formData.startDate || !formData.investmentAmount}
                className="w-full py-3 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>

              {previewResult && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Scenario
                </button>
              )}
            </div>
          </div>

          {scenarios.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00BFFF]" />
                Saved Scenarios
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {scenarios.map((scenario) => {
                  const result = results[scenario.id];
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <div
                      key={scenario.id}
                      className={`p-4 rounded-xl transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-[#00BFFF]/10 border border-[#00BFFF]/30' 
                          : 'bg-[#12121A] hover:bg-[#1F1F2E]'
                      }`}
                      onClick={() => loadScenario(scenario)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{scenario.name || scenario.symbol}</p>
                          <p className="text-sm text-[#6B7280]">
                            {scenario.symbol} • {formatCurrency(scenario.investmentAmount)}
                          </p>
                        </div>
                        {result && (
                          <span className={`text-sm font-medium ${result.totalReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {result.totalReturn >= 0 ? '+' : ''}{result.totalReturnPercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {new Date(scenario.startDate).toLocaleDateString()} - Now
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScenario(scenario.id);
                        }}
                        className="mt-2 text-xs text-[#EF4444] hover:text-[#DC2626] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {previewResult ? (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      {stocks.map(s => s.symbol).join(', ')}
                    </h2>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {new Date(formData.startDate).toLocaleDateString()} - {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[{ id: '1mo', label: '1M' }, { id: '3mo', label: '3M' }, { id: '6mo', label: '6M' }, { id: '1y', label: '1Y' }, { id: 'all', label: 'All' }].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setChartPreset(preset.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          chartPreset === preset.id
                            ? 'bg-[#00BFFF] text-white'
                            : 'bg-[#12121A] text-[#9CA3AF] hover:bg-[#1F1F2E]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={compareMode ? portfolioChartData : chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F1F2E" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis 
                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#12121A', 
                          border: '1px solid #1F1F2E',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                        formatter={(value, name) => {
                          const label = name === 'portfolio' ? 'Your Portfolio' : 'Simulated';
                          return [formatCurrency(value as number), label];
                        }}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00BFFF" 
                        fill="#00BFFF"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      {compareMode && (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey="portfolio" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={false}
                            name="Your Portfolio"
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => value === 'value' ? 'Simulated' : value}
                          />
                        </>
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-sm text-[#9CA3AF] mb-1">Current Value</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {formatCurrency(previewResult.totalValue)}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-[#9CA3AF] mb-1">Total Return</p>
                  <p className={`text-xl font-bold font-mono ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(previewResult.totalReturn)}
                    <span className="text-sm ml-1">({previewResult.totalReturnPercent.toFixed(1)}%)</span>
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-[#9CA3AF] mb-1">Annualized Return</p>
                  <p className={`text-xl font-bold font-mono ${(previewResult.annualizedReturn || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {(previewResult.annualizedReturn || 0) >= 0 ? '+' : ''}{previewResult.annualizedReturn.toFixed(2)}%
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-[#9CA3AF] mb-1">Dividends Earned</p>
                  <p className="text-xl font-bold text-[#10B981] font-mono">
                    {formatCurrency(previewResult.totalDividends)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#00BFFF]" />
                    Investment Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Total Invested</span>
                      <span className="text-white font-mono">{formatCurrency(previewResult.totalInvested)}</span>
                    </div>
                    <div className="h-px bg-[#1F1F2E] my-2" />
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Stock Appreciation</span>
                      <span className={`font-mono ${(previewResult.totalValue - previewResult.totalInvested + previewResult.totalDividends) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {(previewResult.totalValue - previewResult.totalInvested + previewResult.totalDividends) >= 0 ? '+' : ''}
                        {formatCurrency(previewResult.totalValue - previewResult.totalInvested + previewResult.totalDividends)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Dividends Received</span>
                      <span className="text-[#10B981] font-mono">+{formatCurrency(previewResult.totalDividends)}</span>
                    </div>
                    <div className="h-px bg-[#1F1F2E] my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="text-white font-medium">Total Value</span>
                      <span className="text-white font-bold font-mono">{formatCurrency(previewResult.totalValue + previewResult.totalDividends)}</span>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#00BFFF]" />
                    Per-Stock Breakdown
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {previewResult.stocks.map((stock) => (
                      <div key={stock.symbol} className="flex justify-between items-center p-3 bg-[#12121A] rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{stock.symbol}</p>
                          <p className="text-xs text-[#6B7280]">{formatCurrency(stock.totalInvested)} invested</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-white">{formatCurrency(stock.currentValue)}</p>
                          <p className={`text-xs font-mono ${stock.totalReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {stock.totalReturn >= 0 ? '+' : ''}{stock.totalReturnPercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {compareMode && holdings.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-[#00BFFF]" />
                    vs. Your Actual Portfolio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[#12121A] rounded-xl">
                      <p className="text-sm text-[#9CA3AF] mb-1">Your Portfolio Value</p>
                      <p className="text-2xl font-bold text-white font-mono">{formatCurrency(portfolioSummary.totalValue || 0)}</p>
                      <p className={`text-sm mt-1 ${(portfolioSummary?.allTimePL || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {(portfolioSummary?.allTimePL || 0) >= 0 ? '+' : ''}{formatCurrency(portfolioSummary?.allTimePL || 0)} 
                        ({(portfolioSummary?.allTimePLPercent || 0).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="p-4 bg-[#12121A] rounded-xl">
                      <p className="text-sm text-[#9CA3AF] mb-1">Simulated Portfolio Value</p>
                      <p className="text-2xl font-bold text-white font-mono">{formatCurrency(previewResult.totalValue + previewResult.totalDividends)}</p>
                      <p className={`text-sm mt-1 ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(previewResult.totalReturn)} 
                        ({previewResult.totalReturnPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-[#12121A] rounded-xl">
                    <p className="text-sm text-[#9CA3AF] mb-2">
                      If you had invested {formatCurrency(previewResult.totalInvested)} in {stocks.map(s => s.symbol).join(', ')}...
                    </p>
                    <p className="text-white">
                      Your simulated return would be{' '}
                      <span className={`font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {formatCurrency(previewResult.totalReturn)}
                      </span>
                      {' '}compared to your actual portfolio return of{' '}
                      <span className={`font-bold ${(portfolioSummary?.allTimePL || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {formatCurrency(portfolioSummary?.allTimePL || 0)}
                      </span>.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <LineChart className="w-16 h-16 text-[#1F1F2E] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Simulation Running</h3>
              <p className="text-[#6B7280] max-w-md mx-auto">
                Add stocks and configure your scenario to see how an investment would have performed over time.
              </p>
            </div>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Save Scenario</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-[#6B7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder={stocks.map(s => s.symbol).join(', ')}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white placeholder-[#4B5563]"
                />
              </div>
              <button
                onClick={saveScenario}
                disabled={!scenarioName.trim()}
                className="w-full py-3 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors"
              >
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
