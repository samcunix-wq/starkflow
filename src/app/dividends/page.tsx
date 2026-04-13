'use client';

import { DollarSign, Calendar } from 'lucide-react';

export default function DividendsPage() {
  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dividend Calendar</h1>
        <p className="text-[#6B7280]">Track upcoming dividend payments</p>
      </div>

      <div className="card p-8 text-center">
        <DollarSign className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Dividend Tracking Coming Soon</h2>
        <p className="text-[#6B7280]">
          Add your dividend-paying stocks to track payment dates, ex-dividend dates, and projected income.
        </p>
      </div>
    </div>
  );
}
