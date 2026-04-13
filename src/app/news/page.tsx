'use client';

import { useState } from 'react';
import { Newspaper, TrendingUp, Search, Filter, ExternalLink, Globe } from 'lucide-react';
import { newsItems, trendingStocks, holdings } from '@/data/mockData';
import NewsCard from '@/components/NewsCard';

type NewsCategory = 'all' | 'portfolio' | 'market' | 'crypto';

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'portfolio', label: 'My Portfolio' },
    { id: 'market', label: 'Market' },
    { id: 'crypto', label: 'Crypto' },
  ] as const;

  const filteredNews = newsItems.filter((item) => {
    if (searchQuery) {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory === 'portfolio') {
      return holdings.some((h) => h.ticker === item.ticker);
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
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#00BFFF] text-white'
                : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00BFFF]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Market Status</p>
              <p className="text-lg font-semibold text-[#10B981]">Open</p>
            </div>
          </div>
          <p className="text-xs text-[#6B7280]">Closes in 4h 32m</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">S&P 500</p>
              <p className="text-lg font-semibold text-white">5,234.18</p>
            </div>
          </div>
          <p className="text-xs text-[#10B981]">+0.82% today</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">NASDAQ</p>
              <p className="text-lg font-semibold text-white">16,342.56</p>
            </div>
          </div>
          <p className="text-xs text-[#10B981]">+1.24% today</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#EF4444] rotate-180" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">DOW</p>
              <p className="text-lg font-semibold text-white">38,567.23</p>
            </div>
          </div>
          <p className="text-xs text-[#EF4444]">-0.14% today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Latest News</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[#00BFFF]" />
              <h3 className="text-lg font-semibold text-white">Trending on X</h3>
            </div>
            <div className="space-y-3">
              {trendingStocks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-[#12121A] rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-white">{stock.ticker}</p>
                    <p className="text-xs text-[#6B7280]">{stock.mentions.toLocaleString()} mentions</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#6B7280]" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Watchlist</h3>
            <div className="space-y-3">
              {holdings.slice(0, 5).map((holding) => (
                <div key={holding.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{holding.ticker}</p>
                    <p className="text-xs text-[#6B7280]">${holding.currentPrice.toFixed(2)}</p>
                  </div>
                  <div className={`text-xs font-mono ${holding.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
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
