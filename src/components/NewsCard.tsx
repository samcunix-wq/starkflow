'use client';

import { Newspaper as NewsIcon, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { NewsItem } from '@/data/mockData';

const SOURCE_URLS: Record<string, string> = {
  'Reuters': 'https://www.reuters.com',
  'Bloomberg': 'https://www.bloomberg.com',
  'CNBC': 'https://www.cnbc.com',
  'WSJ': 'https://www.wsj.com',
  'MarketWatch': 'https://www.marketwatch.com',
  'TechCrunch': 'https://techcrunch.com',
  'The Verge': 'https://www.theverge.com',
  'Forbes': 'https://www.forbes.com',
  'Yahoo Finance': 'https://finance.yahoo.com',
  'Seeking Alpha': 'https://seekingalpha.com',
  'Barron\'s': 'https://www.barrons.com',
  'Financial Times': 'https://www.ft.com',
  'MacRumors': 'https://macrumors.com',
  'Electrek': 'https://electrek.co',
  'Variety': 'https://variety.com',
  'Hollywood Reporter': 'https://hollywoodreporter.com',
  'Nature': 'https://www.nature.com',
  'IGN': 'https://www.ign.com',
  'VentureBeat': 'https://venturebeat.com',
  'AdAge': 'https://adage.com',
  'GreenBiz': 'https://www.greenbiz.com',
  'American Banker': 'https://www.americanbanker.com',
  'Healthcare Dive': 'https://www.healthcaredive.com',
  'BioPharma Dive': 'https://www.biopharmadive.com',
  'Supply Chain Dive': 'https://www.supplychaindive.com',
  'CoinDesk': 'https://www.coindesk.com',
};

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const getSentimentIcon = () => {
    switch (item.sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-[#10B981]" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-[#EF4444]" />;
      default:
        return <Minus className="w-4 h-4 text-[#6B7280]" />;
    }
  };

  const getSentimentClass = () => {
    switch (item.sentiment) {
      case 'positive':
        return 'bg-[#10B981]/10 text-[#10B981]';
      case 'negative':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      default:
        return 'bg-[#6B7280]/10 text-[#6B7280]';
    }
  };

  const getLink = () => {
    if (item.link && item.link !== '#') {
      return item.link;
    }
    return SOURCE_URLS[item.source] || 'https://news.google.com';
  };

  return (
    <a 
      href={getLink()}
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:no-underline"
    >
      <div className="card p-5 hover:bg-[#12121A] transition-all group hover:cursor-pointer h-full">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <NewsIcon className="w-4 h-4 text-[#00BFFF]" />
            <span className="text-xs text-[#6B7280]">{item.source}</span>
            <span className="text-xs text-[#6B7280]">•</span>
            <span className="text-xs text-[#6B7280]">{item.timestamp}</span>
          </div>
          <div className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-[#6B7280]" />
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getSentimentClass()}`}>
              {getSentimentIcon()}
            </div>
          </div>
        </div>
        
        <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#00BFFF] transition-colors">{item.title}</h4>
        <p className="text-xs text-[#9CA3AF] line-clamp-2 mb-3">{item.summary}</p>
        
        {item.ticker && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#00BFFF]/10 rounded-lg">
            <span className="text-xs text-[#00BFFF] font-semibold">{item.ticker}</span>
          </div>
        )}
      </div>
    </a>
  );
}
