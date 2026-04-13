'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, LineChart } from 'lucide-react';

export default function SimulatorPage() {
  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Simulator</h1>
        <p className="text-[#6B7280]">Test investment strategies with historical data</p>
      </div>

      <div className="card p-8 text-center">
        <LineChart className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Simulator Coming Soon</h2>
        <p className="text-[#6B7280]">
          Test investment strategies with historical data, compare scenarios, and see how your portfolio would have performed over time.
        </p>
      </div>
    </div>
  );
}
