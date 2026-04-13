'use client';

import { User, MessageSquare, TrendingUp, Hash, Crown } from 'lucide-react';
import { SocialUser, TrendingStock } from '@/data/mockData';

interface SocialCardProps {
  user: SocialUser;
}

export default function SocialCard({ user }: SocialCardProps) {
  return (
    <div className="card p-4 hover:cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center text-white font-semibold text-sm">
          {user.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            {user.rank <= 3 && <Crown className="w-3 h-3 text-[#FFD700]" />}
          </div>
          <p className="text-xs text-[#6B7280]">{user.username}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280]">Rank</p>
          <p className="text-lg font-bold text-[#00BFFF] font-mono">#{user.rank}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#12121A] rounded-lg p-2">
          <p className="text-xs text-[#6B7280]">Accuracy</p>
          <p className="text-sm font-semibold text-[#10B981] font-mono">{user.accuracy}%</p>
        </div>
        <div className="bg-[#12121A] rounded-lg p-2">
          <p className="text-xs text-[#6B7280]">Followers</p>
          <p className="text-sm font-semibold text-white font-mono">{(user.followers / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-[#12121A] rounded-lg p-2">
          <p className="text-xs text-[#6B7280]">Following</p>
          <p className="text-sm font-semibold text-white font-mono">{user.following}</p>
        </div>
      </div>
    </div>
  );
}

interface TrendingCardProps {
  stock: TrendingStock;
}

export function TrendingCard({ stock }: TrendingCardProps) {
  const isPositive = stock.change >= 0;
  const sentimentColor = stock.sentiment >= 70 ? '#10B981' : stock.sentiment >= 50 ? '#FFD700' : '#EF4444';

  return (
    <div className="card p-4 hover:cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#00BFFF]" />
          <span className="text-sm font-bold text-white">{stock.ticker}</span>
        </div>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${sentimentColor}20` }}
        >
          <span className="text-xs font-bold" style={{ color: sentimentColor }}>{stock.sentiment}</span>
        </div>
      </div>
      <p className="text-xs text-[#6B7280] mb-2">{stock.name}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white font-mono">${stock.price.toFixed(2)}</span>
        <span className={`text-xs font-mono ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-[#6B7280]">
        <MessageSquare className="w-3 h-3" />
        <span>{stock.mentions.toLocaleString()} mentions</span>
      </div>
    </div>
  );
}
