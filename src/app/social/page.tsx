'use client';

import { Users, TrendingUp, MessageSquare, Crown, Search, Filter } from 'lucide-react';
import { socialUsers, trendingStocks, holdings } from '@/data/mockData';
import SocialCardDefault, { TrendingCard } from '@/components/SocialCard';

export default function SocialPage() {
  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-[#6B7280]">Follow top performers and discuss trades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Top Trader</p>
              <p className="text-lg font-semibold text-white">{socialUsers[0].name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm text-[#10B981]">{socialUsers[0].accuracy}% accuracy</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00BFFF]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Total Members</p>
              <p className="text-lg font-semibold text-white">124,532</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm text-[#10B981]">+2,341 this week</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#00BFFF]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Discussions Today</p>
              <p className="text-lg font-semibold text-white">8,942</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm text-[#10B981]">+12% engagement</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Top Traders</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-48 bg-[#12121A] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-[#12121A] border border-[#1F1F2E] rounded-xl text-[#9CA3AF] hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialUsers.map((user) => (
                <SocialCardDefault key={user.id} user={user} />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Trending Stocks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingStocks.map((stock) => (
                <TrendingCard key={stock.ticker} stock={stock} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Community Sentiment</h3>
            <div className="space-y-4">
              {holdings.slice(0, 5).map((holding) => (
                <div key={holding.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{holding.ticker}</p>
                    <p className="text-xs text-[#6B7280]">{holding.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-2 bg-[#12121A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00BFFF] rounded-full"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {Math.floor(Math.random() * 3000 + 500)} owners
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Discussions</h3>
            <div className="space-y-4">
              {[
                { user: 'alexc', ticker: 'NVDA', title: 'Just added more NVDA at $885', replies: 24 },
                { user: 'sarahw', ticker: 'AAPL', title: 'AAPL looking strong for Q2', replies: 18 },
                { user: 'mikep', ticker: 'TSLA', title: 'TSLA support at $240', replies: 12 },
              ].map((discussion, idx) => (
                <div key={idx} className="p-3 bg-[#12121A] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#00BFFF] font-semibold">{discussion.ticker}</span>
                    <span className="text-xs text-[#6B7280]">•</span>
                    <span className="text-xs text-[#6B7280]">@{discussion.user}</span>
                  </div>
                  <p className="text-sm text-white mb-2">{discussion.title}</p>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <MessageSquare className="w-3 h-3" />
                    <span>{discussion.replies} replies</span>
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
