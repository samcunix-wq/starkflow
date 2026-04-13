'use client';

import { Eye } from 'lucide-react';

export default function WatchlistPage() {
  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
        <p className="text-[#6B7280]">Stocks you're keeping an eye on</p>
      </div>

      <div className="card p-8 text-center">
        <Eye className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Watchlist Coming Soon</h2>
        <p className="text-[#6B7280]">
          Track stocks you're interested in without adding them to your portfolio.
        </p>
      </div>
    </div>
  );
}
