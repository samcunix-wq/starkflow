'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface CalendarEvent {
  date: string;
  ticker: string;
  type: 'exDividend' | 'earnings';
}

export default function CalendarPage() {
  const { holdings } = usePortfolio();
  const INDEX_TICKERS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^TNX'];
  const portfolioHoldings = useMemo(() => 
    holdings.filter(h => !INDEX_TICKERS.includes(h.ticker) && !h.ticker.startsWith('^')),
    [holdings]
  );
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const events: CalendarEvent[] = useMemo(() => {
    const eventList: CalendarEvent[] = [];
    portfolioHoldings.forEach(holding => {
      if (holding.exDivDate && holding.exDivDate !== '-') {
        eventList.push({
          date: holding.exDivDate,
          ticker: holding.ticker,
          type: 'exDividend'
        });
      }
      if (holding.nextEarningsDate && holding.nextEarningsDate !== '-') {
        eventList.push({
          date: holding.nextEarningsDate,
          ticker: holding.ticker,
          type: 'earnings'
        });
      }
    });
    return eventList;
  }, [portfolioHoldings]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  const selectedDateEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : [];

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Earnings & Dividend Calendar</h1>
          <p className="text-[#6B7280]">Track upcoming earnings and dividend dates for your portfolio</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-[#1F1F2E] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#9CA3AF]" />
              </button>
              <h2 className="text-xl font-semibold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-[#1F1F2E] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-[#6B7280] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map(i => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              
              {days.map(day => {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = getEventsForDay(day);
                const hasExDiv = dayEvents.some(e => e.type === 'exDividend');
                const hasEarnings = dayEvents.some(e => e.type === 'earnings');
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dayEvents.length > 0 ? dateStr : null)}
                    className={`aspect-square relative flex flex-col items-center justify-center rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-[#00BFFF]/20 border border-[#00BFFF]' 
                        : isToday
                        ? 'bg-[#1F1F2E] border border-[#6B7280]'
                        : dayEvents.length > 0
                        ? 'hover:bg-[#1F1F2E]'
                        : ''
                    }`}
                  >
                    <span className={`text-sm ${dayEvents.length > 0 ? 'text-white' : 'text-[#6B7280]'}`}>
                      {day}
                    </span>
                    <div className="flex gap-1 mt-1">
                      {hasExDiv && (
                        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      )}
                      {hasEarnings && (
                        <div className="w-2 h-2 rounded-full bg-[#00BFFF]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1F1F2E]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-sm text-[#6B7280]">Ex-Dividend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00BFFF]" />
                <span className="text-sm text-[#6B7280]">Earnings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Upcoming Events'}
            </h3>
            
            {selectedDate && selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      event.type === 'exDividend' 
                        ? 'border-[#10B981]/30 bg-[#10B981]/5' 
                        : 'border-[#00BFFF]/30 bg-[#00BFFF]/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{event.ticker}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.type === 'exDividend' 
                          ? 'bg-[#10B981]/20 text-[#10B981]' 
                          : 'bg-[#00BFFF]/20 text-[#00BFFF]'
                      }`}>
                        {event.type === 'exDividend' ? 'Ex-Div' : 'Earnings'}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {event.type === 'exDividend' 
                        ? 'Dividend eligibility date' 
                        : 'Quarterly earnings report'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">
                  {selectedDate 
                    ? 'No events on this date' 
                    : 'Click on a date with dots to see events'}
                </p>
              </div>
            )}

            {!selectedDate && events.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events
                  .filter(e => e.date >= new Date().toISOString().split('T')[0])
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((event, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDate(event.date)}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-[#1F1F2E] transition-colors ${
                        event.type === 'exDividend' 
                          ? 'border-[#10B981]/30' 
                          : 'border-[#00BFFF]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{event.ticker}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.type === 'exDividend' 
                            ? 'bg-[#10B981]/20 text-[#10B981]' 
                            : 'bg-[#00BFFF]/20 text-[#00BFFF]'
                        }`}>
                          {event.type === 'exDividend' ? 'Ex-Div' : 'Earnings'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}