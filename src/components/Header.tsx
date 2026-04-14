'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Check, Trash2, User, LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { isConfigured as isSupabaseConfigured } from '@/lib/supabase';

interface SearchResult {
  symbol: string;
  name: string;
}

function isUSMarketHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  
  const holidays = [
    { month: 0, day: 1, name: 'New Year\'s Day' },
    { month: 0, day: 20, name: 'MLK Day', isThirdMonday: true },
    { month: 1, day: 17, name: 'Presidents Day', isThirdMonday: true },
    { month: 2, day: 10, name: 'Good Friday' },
    { month: 4, day: 26, name: 'Memorial Day', isLastMonday: true },
    { month: 5, day: 19, name: 'Juneteenth' },
    { month: 6, day: 4, name: 'Independence Day' },
    { month: 8, day: 1, name: 'Labor Day', isFirstMonday: true },
    { month: 10, day: 27, name: 'Thanksgiving', isFourthThursday: true },
    { month: 11, day: 25, name: 'Christmas' },
  ];
  
  for (const holiday of holidays) {
    if (holiday.isThirdMonday) {
      const thirdMonday = getNthWeekdayOfMonth(year, holiday.month, 3, 1);
      if (thirdMonday && date.toDateString() === thirdMonday.toDateString()) return true;
    } else if (holiday.isLastMonday) {
      const lastMonday = getLastWeekdayOfMonth(year, holiday.month, 1);
      if (lastMonday && date.toDateString() === lastMonday.toDateString()) return true;
    } else if (holiday.isFirstMonday) {
      const firstMonday = getNthWeekdayOfMonth(year, holiday.month, 1, 1);
      if (firstMonday && date.toDateString() === firstMonday.toDateString()) return true;
    } else if (holiday.isFourthThursday) {
      const fourthThursday = getNthWeekdayOfMonth(year, holiday.month, 4, 4);
      if (fourthThursday && date.toDateString() === fourthThursday.toDateString()) return true;
    } else if (date.getMonth() === holiday.month && day === holiday.day) {
      return true;
    }
  }
  
  return false;
}

function getNthWeekdayOfMonth(year: number, month: number, nth: number, desiredDay: number): Date | null {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === desiredDay) {
      count++;
      if (count === nth) return date;
    }
  }
  return null;
}

function getLastWeekdayOfMonth(year: number, month: number, desiredDay: number): Date | null {
  let lastDate = new Date(year, month + 1, 0);
  while (lastDate.getDay() !== desiredDay) {
    lastDate.setDate(lastDate.getDate() - 1);
  }
  return lastDate;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState({ label: 'Loading...', color: 'text-[#6B7280]', bgColor: 'bg-[#6B7280]/10', dotColor: 'bg-[#6B7280]' });
  const [currentTime, setCurrentTime] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateMarketStatus = () => {
      // Use the browser's timezone to get local time
      const localTime = new Date();
      const hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      const dayOfWeek = localTime.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let status = { label: 'Market Closed', color: 'text-[#6B7280]', bgColor: 'bg-[#6B7280]/10', dotColor: 'bg-[#6B7280]' };
      
      if (!isWeekend) {
        // Pre-Market: 4am - 9:30am
        if (timeInMinutes >= 4 * 60 && timeInMinutes < 9.5 * 60) {
          status = { label: 'Pre-Market', color: 'text-[#06B6D4]', bgColor: 'bg-[#06B6D4]/10', dotColor: 'bg-[#06B6D4]' };
        }
        // Market Open: 9:30am - 4pm
        else if (timeInMinutes >= 9.5 * 60 && timeInMinutes < 16 * 60) {
          status = { label: 'Market Open', color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10', dotColor: 'bg-[#10B981]' };
        }
        // After Hours: 4pm - 8pm
        else if (timeInMinutes >= 16 * 60 && timeInMinutes < 20 * 60) {
          status = { label: 'After Hours', color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10', dotColor: 'bg-[#F59E0B]' };
        }
        // Market Closed: 8pm - 4am
        else if (timeInMinutes >= 20 * 60 || timeInMinutes < 4 * 60) {
          status = { label: 'Market Closed', color: 'text-[#6B7280]', bgColor: 'bg-[#6B7280]/10', dotColor: 'bg-[#6B7280]' };
        }
      }
      
      setMarketStatus(status);
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60000);
    
    // Clock update
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes}:${seconds} ${ampm}`);
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchStocks = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.slice(0, 6));
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setQuery('');
    setShowResults(false);
    router.push(`/stock/${symbol}`);
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/auth');
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <header className="h-16 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1F1F2E] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-[#9CA3AF] hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setShowResults(true)}
            className="w-64 lg:w-80 bg-[#0D0D12] border border-[#1F1F2E] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
          />
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-[#0D0D12] border border-[#1F1F2E] rounded-xl shadow-xl overflow-hidden z-50">
              {loading ? (
                <div className="p-4 text-center text-[#6B7280] text-sm">Searching...</div>
              ) : results.length > 0 ? (
                <ul>
                  {results.map((result, idx) => (
                    <li key={`${result.symbol}-${idx}`}>
                      <button
                        onClick={() => handleSelect(result.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-[#12121A] transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{result.symbol}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            result.type === 'ETF' || result.type === 'ETP' ? 'bg-[#00BFFF]/20 text-[#00BFFF]' :
                            result.type === 'REIT' ? 'bg-[#10B981]/20 text-[#10B981]' :
                            'bg-[#6B7280]/20 text-[#6B7280]'
                          }`}>{result.type === 'ETP' ? 'ETF' : result.type}</span>
                          <span className="text-[#6B7280] text-sm">{result.name}</span>
                        </div>
                        <span className="text-xs text-[#6B7280]">{result.exchange}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query.length > 0 ? (
                <div className="p-4 text-center text-[#6B7280] text-sm">No results found</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-[#9CA3AF] font-mono tabular-nums">
          {currentTime}
        </div>
        <div className="w-px h-6 bg-[#1F1F2E]" />
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#9CA3AF] hover:text-white hover:bg-[#12121A] rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#00BFFF] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-[#0D0D12] border border-[#1F1F2E] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-[#1F1F2E]">
                <h3 className="text-white font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-[#00BFFF] hover:text-[#00A8E8] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#6B7280]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs mt-1">We'll notify you about trades, dividends, and more</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-[#1F1F2E]/50 last:border-0 hover:bg-[#12121A]/50 transition-colors ${!notification.read ? 'bg-[#00BFFF]/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg ${
                          notification.type === 'purchase' ? 'bg-[#10B981]/20' :
                          notification.type === 'sale' ? 'bg-[#F59E0B]/20' :
                          notification.type === 'dividend' ? 'bg-[#00BFFF]/20' :
                          notification.type === 'ex_dividend' ? 'bg-[#8B5CF6]/20' :
                          notification.type === 'earnings' ? 'bg-[#EC4899]/20' :
                          'bg-[#6B7280]/20'
                        }`}>
                          {notification.type === 'purchase' && <TrendingUp className="w-4 h-4 text-[#10B981]" />}
                          {notification.type === 'sale' && <TrendingDown className="w-4 h-4 text-[#F59E0B]" />}
                          {notification.type === 'dividend' && <DollarSign className="w-4 h-4 text-[#00BFFF]" />}
                          {notification.type === 'ex_dividend' && <Calendar className="w-4 h-4 text-[#8B5CF6]" />}
                          {notification.type === 'earnings' && <AlertCircle className="w-4 h-4 text-[#EC4899]" />}
                          {['general', 'price_alert'].includes(notification.type) && <Bell className="w-4 h-4 text-[#6B7280]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                            {notification.ticker && (
                              <span className="text-xs bg-[#1F1F2E] text-[#9CA3AF] px-2 py-0.5 rounded">
                                {notification.ticker}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-[#6B7280]/70 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-[#6B7280] hover:text-white hover:bg-[#1F1F2E] rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => clearNotification(notification.id)}
                            className="p-1.5 text-[#6B7280] hover:text-red-400 hover:bg-[#1F1F2E] rounded-lg transition-colors"
                            title="Dismiss"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-[#1F1F2E] mx-2" />
        <div className={`flex items-center gap-2 px-3 py-1.5 ${marketStatus.bgColor} rounded-full`}>
          <span className={`w-2 h-2 ${marketStatus.dotColor} rounded-full animate-pulse`} />
          <span className={`text-xs ${marketStatus.color} font-medium`}>{marketStatus.label}</span>
        </div>
        <div className="w-px h-6 bg-[#1F1F2E] mx-2" />
        
        {isSupabaseConfigured ? (
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#12121A] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center text-white font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D0D12] border border-[#1F1F2E] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-[#1F1F2E]">
                      <p className="text-sm text-white truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#12121A] rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] text-white rounded-xl transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}