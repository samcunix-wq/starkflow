'use client';

import { useState, useEffect, useMemo } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Search, Globe, ExternalLink, Clock, Loader2, Eye } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useWatchlist } from '@/context/WatchlistContext';

interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  summary?: string;
  symbol?: string;
}

export default function NewsPage() {
  const { holdings } = usePortfolio();
  const { watchlists } = useWatchlist();
  const [activeCategory, setActiveCategory] = useState<'all' | 'portfolio' | 'market' | 'watchlist'>('all');
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketStatus, setMarketStatus] = useState({ status: 'Closed', color: 'text-[#6B7280]', message: 'Market closed' });
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [indices, setIndices] = useState<IndexData[]>([
    { symbol: '^GSPC', name: 'S&P 500', price: 0, change: 0, changePercent: 0 },
    { symbol: '^IXIC', name: 'NASDAQ', price: 0, change: 0, changePercent: 0 },
    { symbol: '^DJI', name: 'DOW', price: 0, change: 0, changePercent: 0 },
    { symbol: '^RUT', name: 'Russell 2000', price: 0, change: 0, changePercent: 0 },
  ]);
  const [portfolioNews, setPortfolioNews] = useState<NewsItem[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [watchlistNews, setWatchlistNews] = useState<NewsItem[]>([]);
  const [allNewsCombined, setAllNewsCombined] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const allWatchlistSymbols = useMemo(() => {
    return watchlists.flatMap(w => w.items.map(i => i.symbol));
  }, [watchlists]);

  const selectedWatchlist = useMemo(() => {
    return watchlists.find(w => w.id === selectedWatchlistId);
  }, [watchlists, selectedWatchlistId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    let statusObj = { status: 'Closed', color: 'text-[#6B7280]', message: 'Market closed' };

    if (day !== 0 && day !== 6) {
      const marketOpen = 9 * 60 + 30;
      const marketClose = 16 * 60;
      const preMarketStart = 4 * 60;
      const afterHoursEnd = 20 * 60;

      if (currentTime >= marketOpen && currentTime < marketClose) {
        const minutesLeft = marketClose - currentTime;
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;
        statusObj = { status: 'Market Open', color: 'text-[#10B981]', message: `Closes in ${hoursLeft}h ${minsLeft}m` };
      } else if (currentTime >= preMarketStart && currentTime < marketOpen) {
        statusObj = { status: 'Pre-Market', color: 'text-[#F59E0B]', message: 'Trading begins at 9:30 AM' };
      } else if (currentTime >= marketClose && currentTime < afterHoursEnd) {
        statusObj = { status: 'After Hours', color: 'text-[#F59E0B]', message: 'Market closed at 4:00 PM' };
      } else if (currentTime >= afterHoursEnd || currentTime < preMarketStart) {
        statusObj = { status: 'Closed', color: 'text-[#6B7280]', message: 'Pre-market opens at 4:00 AM' };
      }
    }

    setMarketStatus(statusObj);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    async function fetchIndices() {
      try {
        const symbols = '^GSPC,^IXIC,^RUT,^DJI';
        const res = await fetch(`/api/stock?symbol=${symbols}&summary=true`);
        const data = await res.json();
        
        if (data.holdings) {
          const indexMap: Record<string, IndexData> = {
            '^GSPC': { symbol: '^GSPC', name: 'S&P 500', price: 0, change: 0, changePercent: 0 },
            '^IXIC': { symbol: '^IXIC', name: 'NASDAQ', price: 0, change: 0, changePercent: 0 },
            '^DJI': { symbol: '^DJI', name: 'DOW', price: 0, change: 0, changePercent: 0 },
            '^RUT': { symbol: '^RUT', name: 'Russell 2000', price: 0, change: 0, changePercent: 0 },
          };
          
          data.holdings.forEach((h: any) => {
            if (indexMap[h.ticker]) {
              indexMap[h.ticker] = {
                ...indexMap[h.ticker],
                price: h.currentPrice,
                change: h.change,
                changePercent: h.changePercent,
              };
            }
          });
          
          setIndices([indexMap['^GSPC'], indexMap['^IXIC'], indexMap['^DJI'], indexMap['^RUT']]);
        }
      } catch (err) {
        console.error('Failed to fetch indices:', err);
      } finally {
        setIndicesLoading(false);
      }
    }
    fetchIndices();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    async function fetchNews() {
      setNewsLoading(true);
      try {
        const portfolioSymbols = holdings && holdings.length > 0 
          ? holdings.map((h: any) => h.ticker).join(',') 
          : 'AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,JPM';
        
        const watchlistSymbols = allWatchlistSymbols.length > 0 
          ? allWatchlistSymbols.join(',') 
          : 'AAPL,MSFT';
        
        const [portfolioRes, marketRes, watchlistRes] = await Promise.all([
          fetch(`/api/stock-news?symbol=${portfolioSymbols}&category=portfolio`),
          fetch(`/api/stock-news?symbol=general&category=market`),
          fetch(`/api/stock-news?symbol=${watchlistSymbols}&category=portfolio`),
        ]);
        
        const [portfolioData, marketData, watchlistData] = await Promise.all([
          portfolioRes.json(),
          marketRes.json(),
          watchlistRes.json(),
        ]);
        
        if (portfolioData.news) {
          setPortfolioNews(portfolioData.news);
        }
        if (marketData.news) {
          setMarketNews(marketData.news);
        }
        if (watchlistData.news) {
          setWatchlistNews(watchlistData.news);
        }
        
        const combined = [
          ...(portfolioData.news || []),
          ...(watchlistData.news || []),
          ...(marketData.news || [])
        ];
        setAllNewsCombined(combined);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, [mounted, holdings, allWatchlistSymbols]);

  useEffect(() => {
    if (!mounted || activeCategory !== 'watchlist') return;
    
    async function fetchWatchlistNews() {
      setNewsLoading(true);
      try {
        const symbols = selectedWatchlist?.items.map((item: any) => item.symbol).join(',') || 'AAPL,MSFT';
        const res = await fetch(`/api/stock-news?symbol=${symbols}&category=portfolio`);
        const data = await res.json();
        
        if (data.news) {
          setWatchlistNews(data.news);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist news:', err);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchWatchlistNews();
  }, [mounted, activeCategory, selectedWatchlist]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num.toFixed(2);
  };

  const currentNews = useMemo(() => {
    if (activeCategory === 'portfolio') return portfolioNews;
    if (activeCategory === 'market') return marketNews;
    if (activeCategory === 'watchlist') return watchlistNews;
    return allNewsCombined;
  }, [activeCategory, portfolioNews, marketNews, watchlistNews, allNewsCombined]);
  
  const filteredNews = currentNews.filter((item) => {
    if (searchQuery) {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">News & Data</h1>
          <p className="text-[#6B7280]">Stay updated with market news and trends</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All News' },
          { id: 'portfolio', label: 'My Portfolio' },
          { id: 'market', label: 'Market News' },
          { id: 'watchlist', label: 'Watchlist News' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id 
                ? 'bg-[#00BFFF] text-white' 
                : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
        {activeCategory === 'watchlist' && (
          <select
            value={selectedWatchlistId}
            onChange={(e) => setSelectedWatchlistId(e.target.value)}
            className="px-4 py-2 bg-[#12121A] text-white rounded-xl text-sm font-medium outline-none focus:border-[#00BFFF] border border-[#1F1F2E]"
          >
            {watchlists.map(list => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-[#00BFFF]"
              />
            </div>

            {newsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#00BFFF] animate-spin" />
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-16">
                <Newspaper className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280]">No news found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#12121A] rounded-xl hover:bg-[#1F1F2E] transition-colors">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.symbol && (
                            <span className="text-xs font-medium text-[#00BFFF] bg-[#00BFFF]/10 px-2 py-0.5 rounded">
                              {item.symbol}
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-medium mb-1 hover:text-[#00BFFF] transition-colors">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-sm text-[#6B7280] mb-2 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                          <span>{item.source}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.published}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-[#6B7280] shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Market Status</h3>
              <div className={`flex items-center gap-2 ${marketStatus.color}`}>
                <div className="w-2 h-2 rounded-full bg-current" />
                <span className="text-sm font-medium">{marketStatus.status}</span>
              </div>
            </div>
            <p className="text-sm text-[#6B7280]">{marketStatus.message}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Indices</h3>
            <div className="space-y-3">
              {indices.map((index) => (
                <div key={index.symbol} className="flex items-center justify-between">
                  <span className="text-[#9CA3AF]">{index.name}</span>
                  <div className="text-right">
                    <span className="text-white font-mono">{indicesLoading ? '-' : formatNumber(index.price)}</span>
                    <span className={`ml-2 text-sm font-mono ${index.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {indicesLoading ? '' : `${index.change >= 0 ? '+' : ''}${index.changePercent?.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}