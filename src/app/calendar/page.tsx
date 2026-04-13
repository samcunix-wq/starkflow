'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market Calendar</h1>
        <p className="text-[#6B7280]">Earnings, dividends, and market holidays</p>
      </div>

      <div className="card p-8 text-center">
        <CalendarIcon className="w-16 h-16 text-[#00BFFF] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Calendar Coming Soon</h2>
        <p className="text-[#6B7280]">
          Stay informed about earnings season, dividend dates, and market holidays.
        </p>
      </div>
    </div>
  );
}
