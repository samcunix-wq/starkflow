'use client';

import { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, Search, TrendingUp, TrendingDown, X, Loader2, Star } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dividendYield: number | null;
}

const STORAGE_KEY = 'starkflow_watchlist';

export default function WatchlistPage() {
  const { holdings } = usePortfolio();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addingSymbol, setAddingSymbol] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setWatchlist(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const fetchStockData = async (symbols: string[]) => {
    if (symbols.length === 0) return;
    
    try {
      const res = await fetch(`/api/stock?symbol=${symbols.join(',')}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const updated = data.map((d: any) => ({
          symbol: d.symbol,
          name: d.name || d.symbol,
          price: d.price || 0,
          change: d.change || 0,
          changePercent: d.changePercent || 0,
          dividendYield: d.dividendYield || null,
        }));
        
        const merged = watchlist.map(item => {
          const updatedItem = updated.find(u => u.symbol === item.symbol);
          return updatedItem || item;
        });
        
        setWatchlist(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
    }
  };

  useEffect(() => {
    if (watchlist.length > 0) {
      const symbols = watchlist.map(w => w.symbol);
      fetchStockData(symbols);
      const interval = setInterval(() => fetchStockData(symbols), 60000);
      return () => clearInterval(interval);
    }
  }, [watchlist.length]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const filtered = data.filter((r: any) => !watchlist.find(w => w.symbol === r.symbol));
      setSearchResults(filtered.slice(0, 8));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const addToWatchlist = (symbol: string, name: string) => {
    if (watchlist.find(w => w.symbol === symbol)) return;
    
    const newItem: WatchlistItem = {
      symbol,
      name,
      price: 0,
      change: 0,
      changePercent: 0,
      dividendYield: null,
    };
    
    const updated = [...watchlist, newItem];
    setWatchlist(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSearchQuery('');
    setSearchResults([]);
    fetchStockData([symbol]);
  };

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(w => w.symbol !== symbol);
    setWatchlist(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#00BFFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
          <p className="text-[#6B7280]">Stocks you're keeping an eye on</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className="card p-12 text-center">
          <Eye className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h2>
          <p className="text-[#6B7280] mb-6">
            Add stocks you want to track without adding them to your portfolio
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white font-medium transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Stock
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F2E]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Stock</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#6B7280]">Price</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#6B7280]">Change</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#6B7280]">Dividend</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <tr key={item.symbol} className="border-b border-[#1F1F2E] last:border-0 hover:bg-[#12121A] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00BFFF]/20 to-[#006699]/20 flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#00BFFF]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{item.symbol}</p>
                          <p className="text-sm text-[#6B7280]">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white font-mono">${item.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-mono">{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white font-mono">
                        {item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeFromWatchlist(item.symbol)}
                        className="p-2 text-[#6B7280] hover:text-red-400 hover:bg-[#12121A] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add to Watchlist</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a stock..."
                className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-[#0D0D12] border border-[#1F1F2E] rounded-xl overflow-hidden z-10 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => addToWatchlist(result.symbol, result.name)}
                      className="w-full px-4 py-3 text-left hover:bg-[#12121A] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-semibold">{result.symbol}</span>
                        <span className="text-[#6B7280] text-sm ml-2">{result.name}</span>
                      </div>
                      <span className="text-xs text-[#6B7280] bg-[#1F1F2E] px-2 py-1 rounded">{result.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
