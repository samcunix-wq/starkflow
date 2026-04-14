'use client';

import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Search, ExternalLink, Clock, Loader2, Filter } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function NewsPage() {
  const { holdings } = usePortfolio();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'market' | 'portfolio' | 'stocks'>('all');

  const portfolioSymbols = holdings.map(h => h.ticker).slice(0, 5);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        let symbols = 'general';
        if (category === 'portfolio' && portfolioSymbols.length > 0) {
          symbols = portfolioSymbols.join(',');
        }
        
        const res = await fetch(`/api/stock-news?symbol=${symbols}&category=${category}`);
        const data = await res.json();
        
        if (data.news && data.news.length > 0) {
          setNews(data.news.slice(0, 20));
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      }
      setLoading(false);
    }

    fetchNews();
  }, [category, portfolioSymbols]);

  useEffect(() => {
    async function fetchMarketIndices() {
      try {
        const symbols = ['^GSPC', '^IXIC', '^DJI'];
        const res = await fetch(`/api/stock?symbol=${symbols.join(',')}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setMarketIndices(data.map((d: any) => ({
            symbol: d.symbol,
            name: d.name || d.symbol,
            price: d.price,
            change: d.change,
            changePercent: d.changePercent,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch indices:', err);
      }
    }

    fetchMarketIndices();
    const interval = setInterval(fetchMarketIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-[#10B981]';
      case 'negative': return 'text-[#EF4444]';
      default: return 'text-[#6B7280]';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market News</h1>
        <p className="text-[#6B7280]">Latest financial news and market updates</p>
      </div>

      {marketIndices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {marketIndices.map((index) => (
            <div key={index.symbol} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280]">{index.name}</p>
                  <p className="text-xl font-bold text-white font-mono">${index.price.toLocaleString()}</p>
                </div>
                <div className={`text-right ${index.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  <div className="flex items-center gap-1">
                    {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-mono">{index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%</span>
                  </div>
                  <p className="text-sm font-mono">{index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF]"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'market', 'portfolio'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-[#00BFFF] text-white'
                  : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#00BFFF] animate-spin" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="card p-12 text-center">
          <Newspaper className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No News Found</h2>
          <p className="text-[#6B7280]">Try adjusting your search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item, idx) => (
            <a
              key={idx}
              href={item.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 hover:bg-[#12121A] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  item.sentiment === 'positive' ? 'bg-[#10B981]/10' :
                  item.sentiment === 'negative' ? 'bg-[#EF4444]/10' :
                  'bg-[#6B7280]/10'
                }`}>
                  {item.sentiment === 'positive' ? (
                    <TrendingUp className={`w-5 h-5 text-[#10B981]`} />
                  ) : item.sentiment === 'negative' ? (
                    <TrendingDown className={`w-5 h-5 text-[#EF4444]`} />
                  ) : (
                    <Newspaper className={`w-5 h-5 text-[#6B7280]`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-2 group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                    {item.summary || item.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span>{item.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(item.published)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#6B7280] group-hover:text-[#00BFFF] transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
