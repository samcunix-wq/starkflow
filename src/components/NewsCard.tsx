'use client';

import { Newspaper as NewsIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsItem } from '@/data/mockData';

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

  return (
    <div className="card p-5 hover:cursor-pointer">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <NewsIcon className="w-4 h-4 text-[#00BFFF]" />
          <span className="text-xs text-[#6B7280]">{item.source}</span>
          <span className="text-xs text-[#6B7280]">•</span>
          <span className="text-xs text-[#6B7280]">{item.timestamp}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getSentimentClass()}`}>
          {getSentimentIcon()}
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">{item.title}</h4>
      <p className="text-xs text-[#9CA3AF] line-clamp-2 mb-3">{item.summary}</p>
      
      {item.ticker && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#00BFFF]/10 rounded-lg">
          <span className="text-xs text-[#00BFFF] font-semibold">{item.ticker}</span>
        </div>
      )}
    </div>
  );
}
