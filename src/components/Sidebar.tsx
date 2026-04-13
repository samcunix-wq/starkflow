'use client';

import { 
  LayoutDashboard, 
  PieChart, 
  Bot, 
  Users, 
  Newspaper, 
  Settings,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/advisor', label: 'AI Advisor', icon: Bot },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/news', label: 'News', icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0A0A0F] border-r border-[#1F1F2E] flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center animate-pulse-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">StarkFlow</h1>
            <p className="text-xs text-[#6B7280]">Premium Finance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#9CA3AF] hover:bg-[#12121A] hover:text-white transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        
        <div className="flex items-center gap-3 px-4 py-3 mt-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center text-white font-semibold">
            SC
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Shawn C.</p>
            <p className="text-xs text-[#6B7280]">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
