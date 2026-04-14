'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Plus, Trash2, Edit2, X, Search, TrendingUp, TrendingDown, BarChart2, DollarSign, Calendar, Wallet } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { usePortfolio } from '@/context/PortfolioContext';
import Link from 'next/link';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dividendYield: number | null;
  dividendRate: number | null;
  exDivDate: string | null;
  nextEarningsDate: string | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

export default function WatchlistPage() {
  const { watchlists, createWatchlist, deleteWatchlist, renameWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { addHolding } = usePortfolio();
  const [selectedListId, setSelectedListId] = useState<string>('default');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmStock, setDeleteConfirmStock] = useState<string | null>(null);
  const [deleteConfirmList, setDeleteConfirmList] = useState<string | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<StockData | null>(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedForTrade, setSelectedForTrade] = useState<string | null>(null);
  const [tradeForm, setTradeForm] = useState({ shares: '', price: '' });

  const selectedList = watchlists.find(w => w.id === selectedListId);

  const selectedListItems = useMemo(() => {
    return selectedList?.items || [];
  }, [selectedList]);

  const holdings = useMemo(() => {
    return selectedList?.items || [];
  }, [selectedList]);

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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!expandedSymbol) {
      setExpandedData(null);
      return;
    }
    const fetchData = async () => {
      setLoadingExpanded(true);
      try {
        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(expandedSymbol)}`);
        const data = await res.json();
        setExpandedData(data);
      } catch {
        setExpandedData(null);
      }
      setLoadingExpanded(false);
    };
    fetchData();
  }, [expandedSymbol]);

  const handleCreateList = () => {
    if (newListName.trim()) {
      createWatchlist(newListName.trim());
      setNewListName('');
      setShowCreateModal(false);
    }
  };

  const handleAddStock = async (symbol: string, name: string) => {
    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      addToWatchlist(selectedListId, {
        symbol,
        name: data.name || name,
        price: data.price || 0,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        addedAt: new Date().toISOString(),
      });
    } catch {
      addToWatchlist(selectedListId, {
        symbol,
        name,
        price: 0,
        change: 0,
        changePercent: 0,
        addedAt: new Date().toISOString(),
      });
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowAddModal(false);
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      renameWatchlist(id, editingName.trim());
      setEditingListId(null);
      setEditingName('');
    }
  };

  const handleRemoveStock = (symbol: string) => {
    removeFromWatchlist(selectedListId, symbol);
    setDeleteConfirmStock(null);
  };

  const handleDeleteList = () => {
    if (deleteConfirmList) {
      deleteWatchlist(deleteConfirmList);
      const remaining = watchlists.filter(w => w.id !== deleteConfirmList);
      setSelectedListId(remaining[0]?.id || 'default');
      setDeleteConfirmList(null);
    }
  };

  const handleBuy = () => {
    const shares = parseInt(tradeForm.shares) || 0;
    const price = parseFloat(tradeForm.price) || expandedData?.price || 0;
    if (shares > 0 && price > 0 && expandedData) {
      addHolding({
        id: expandedData.symbol,
        ticker: expandedData.symbol,
        name: expandedData.name,
        shares,
        avgCost: price,
        currentPrice: expandedData.price,
        change: expandedData.change,
        changePercent: expandedData.changePercent,
        totalValue: shares * price,
        totalGain: 0,
        totalGainPercent: 0,
        peRatio: 0,
        dividendYield: expandedData.dividendYield || 0,
        dividendRate: expandedData.dividendRate || 0,
        exDivDate: expandedData.exDivDate || '-',
        dividendPaymentDate: '-',
        dividendFrequency: 'quarterly',
        nextEarningsDate: expandedData.nextEarningsDate || '-',
        sector: 'Other',
      });
      setShowBuyModal(false);
      setTradeForm({ shares: '', price: '' });
      setSelectedForTrade(null);
    }
  };

  return (
    <>
      <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
          <p className="text-[#6B7280]">Track stocks you're interested in</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] text-white font-medium rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New List
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {watchlists.map((list) => (
          <button
            key={list.id}
            onClick={() => setSelectedListId(list.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedListId === list.id
                ? 'bg-[#00BFFF] text-white'
                : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            {list.name} ({list.items.length})
          </button>
        ))}
      </div>

      <div className="flex-1">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{selectedList?.name}</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-3 py-2 bg-[#12121A] border border-[#1F1F2E] rounded-xl text-[#9CA3AF] hover:text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Stock
              </button>
            </div>

            {selectedListItems.length === 0 ? (
              <div className="text-center py-16">
                <Eye className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280] mb-2">No stocks in this watchlist</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="text-[#00BFFF] hover:underline"
                >
                  Add your first stock
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1F1F2E]">
                      <th className="text-left text-xs text-[#6B7280] font-medium py-3 px-4">Symbol</th>
                      <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Price</th>
                      <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">Change</th>
                      <th className="text-right text-xs text-[#6B7280] font-medium py-3 px-4">% Change</th>
                      <th className="w-8"></th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedListItems.map(item => {
                      const isExpanded = expandedSymbol === item.symbol;
                      const isPositive = (item.change || 0) >= 0;
                      return (
                        <React.Fragment key={item.symbol}>
                          <tr 
                            onClick={() => setExpandedSymbol(isExpanded ? null : item.symbol)}
                            className="border-b border-[#1F1F2E]/50 last:border-0 cursor-pointer hover:bg-[#12121A]/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <Link 
                                href={`/stock/${item.symbol}`}
                                className="hover:text-[#00BFFF] transition-colors"
                              >
                                <p className="font-semibold text-white">{item.symbol}</p>
                                <p className="text-xs text-[#6B7280]">{item.name}</p>
                              </Link>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-white font-mono">${(item.price || 0).toFixed(2)}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span className="font-mono text-sm">
                                  {isPositive ? '+' : ''}{(item.change || 0).toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className={`font-mono text-sm ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {isPositive ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="p-1">
                                {isExpanded ? (
                                  <TrendingUp className="w-4 h-4 text-[#00BFFF]" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-[#6B7280]" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmStock(item.symbol); }}
                                className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-[#12121A]/30">
                              <td colSpan={6} className="py-4 px-4">
                                {loadingExpanded ? (
                                  <p className="text-[#6B7280]">Loading...</p>
                                ) : expandedData ? (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                      <BarChart2 className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">Day Change</p>
                                        <p className={`text-sm font-mono ${(expandedData.change || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                          {(expandedData.change || 0) >= 0 ? '+' : ''}{expandedData.change?.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">Dividend Yield</p>
                                        <p className="text-sm text-white font-mono">{expandedData.dividendYield?.toFixed(2) || '0.00'}%</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">52W High</p>
                                        <p className="text-sm text-white font-mono">${(expandedData.fiftyTwoWeekHigh || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <TrendingDown className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">52W Low</p>
                                        <p className="text-sm text-white font-mono">${(expandedData.fiftyTwoWeekLow || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">Ex-Div Date</p>
                                        <p className="text-sm text-white font-mono">{expandedData.exDivDate || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-[#00BFFF]" />
                                      <div>
                                        <p className="text-xs text-[#6B7280]">Next Earnings</p>
                                        <p className="text-sm text-white font-mono">{expandedData.nextEarningsDate || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-4">
                                      <button
                                        onClick={() => { setSelectedForTrade(item.symbol); setShowBuyModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-lg transition-colors font-medium"
                                      >
                                        Buy
                                      </button>
                                      <button
                                        onClick={() => { setSelectedForTrade(item.symbol); setShowSellModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg transition-colors font-medium"
                                      >
                                        Sell
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[#6B7280]">Unable to load data</p>
                                )}
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
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create Watchlist</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6B7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  placeholder="e.g., Tech Stocks, Dividend Picks"
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                />
              </div>
              <button
                onClick={handleCreateList}
                className="w-full py-3 bg-[#00BFFF] hover:bg-[#00A8E8] text-white font-medium rounded-xl"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#6B7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ticker or company name..."
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-[#00BFFF]"
                  autoFocus
                />
              </div>
              {isSearching ? (
                <p className="text-center text-[#6B7280] py-4">Searching...</p>
              ) : searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {searchResults.map(stock => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleAddStock(stock.symbol, stock.name)}
                      className="w-full flex items-center justify-between p-3 bg-[#12121A] rounded-xl hover:bg-[#1F1F2E] transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-[#6B7280]">{stock.name}</p>
                      </div>
                      <Plus className="w-5 h-5 text-[#6B7280]" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 0 ? (
                <p className="text-center text-[#6B7280] py-4">No results found</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Remove from Watchlist?</h3>
              <p className="text-[#6B7280] mb-6">Are you sure you want to remove {deleteConfirmStock} from {selectedList?.name}?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmStock(null)}
                  className="flex-1 py-3 bg-[#12121A] text-[#9CA3AF] hover:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleRemoveStock(deleteConfirmStock)}
                  className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Watchlist?</h3>
              <p className="text-[#6B7280] mb-6">Are you sure you want to delete "{watchlists.find(w => w.id === deleteConfirmList)?.name}"? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmList(null)}
                  className="flex-1 py-3 bg-[#12121A] text-[#9CA3AF] hover:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteList}
                  className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBuyModal && expandedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Buy {expandedData.symbol}</h3>
              <button onClick={() => setShowBuyModal(false)} className="text-[#6B7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Shares</label>
                <input
                  type="number"
                  value={tradeForm.shares}
                  onChange={(e) => setTradeForm({ ...tradeForm, shares: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white font-mono text-xl"
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Price per share</label>
                <input
                  type="number"
                  value={tradeForm.price || expandedData.price.toFixed(2)}
                  onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white font-mono text-xl"
                />
              </div>
              <div className="p-4 bg-[#12121A] rounded-xl">
                <p className="text-sm text-[#6B7280]">Total Value</p>
                <p className="text-xl font-bold text-white font-mono">
                  ${((parseInt(tradeForm.shares) || 0) * (parseFloat(tradeForm.price) || expandedData.price)).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleBuy}
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-xl"
              >
                Confirm Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}