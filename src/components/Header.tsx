'use client';

import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1F1F2E] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-[#9CA3AF] hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search stocks, news..."
            className="w-64 lg:w-80 bg-[#0D0D12] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-[#9CA3AF] hover:text-white hover:bg-[#12121A] rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#00BFFF] rounded-full" />
        </button>
        <div className="w-px h-6 bg-[#1F1F2E] mx-2" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 rounded-full">
          <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          <span className="text-xs text-[#10B981] font-medium">Market Open</span>
        </div>
      </div>
    </header>
  );
}
