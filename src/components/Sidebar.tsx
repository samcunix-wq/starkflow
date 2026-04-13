'use client';

import { 
  LayoutDashboard, 
  PieChart, 
  Bot, 
  Users, 
  Newspaper, 
  Settings,
  Zap,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  LineChart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/simulator', label: 'Simulator', icon: LineChart },
  { href: '/dividends', label: 'Dividends', icon: DollarSign },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/advisor', label: 'AI Advisor', icon: Bot },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/news', label: 'News', icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('there');

  useEffect(() => {
    const stored = localStorage.getItem('user_display_name');
    if (stored) {
      setDisplayName(stored);
    } else if (user?.email) {
      const name = user.email.split('@')[0];
      setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0A0A0F] border-r border-[#1F1F2E] flex flex-col z-50 hidden lg:flex">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">StarkFlow</h1>
            <p className="text-xs text-[#6B7280]">AI Portfolio Advisor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00BFFF]/10 text-[#00BFFF] border-l-2 border-[#00BFFF]'
                      : 'text-[#9CA3AF] hover:bg-[#12121A] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#1F1F2E]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#9CA3AF] hover:bg-[#12121A] hover:text-white transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        
        <div className="flex items-center gap-3 px-4 py-3 mt-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center text-white font-semibold">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-[#6B7280]">
              {user ? 'Signed in' : 'Guest mode'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
