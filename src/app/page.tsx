'use client';

import { useEffect, useState, useMemo } from 'react';
import { portfolioSummary, assetAllocation, newsItems } from '@/data/mockData';
import PortfolioCard from '@/components/PortfolioCard';
import AllocationChart from '@/components/AllocationChart';
import HoldingsTable from '@/components/HoldingsTable';
import NewsCard from '@/components/NewsCard';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { isConfigured, supabase } from '@/lib/supabase';
import { X, Loader2 } from 'lucide-react';

interface AssetAllocationItem {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#00BFFF',
  'Communication Services': '#00D4FF',
  'Consumer Cyclical': '#0099CC',
  'Consumer Defensive': '#00FFB0',
  'Healthcare': '#FF6B6B',
  'Financial Services': '#FFD93D',
  'Industrials': '#6BCB77',
  'Energy': '#FF8C42',
  'Utilities': '#A66CFF',
  'Real Estate': '#FF6B9D',
  'Basic Materials': '#4ECDC4',
  'Other': '#6B7280',
};

export default function Dashboard() {
  const { holdings, setHoldings, isLoading, purchasingPower, realizedPL, setPurchasingPower } = usePortfolio();
  const { user } = useAuth();
  const [showPPModal, setShowPPModal] = useState(false);
  const [ppInput, setPpInput] = useState('');
  const [ppLoading, setPpLoading] = useState(false);
  const [userName, setUserName] = useState('there');
  const INDEX_TICKERS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^TNX'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const storedName = localStorage.getItem('user_display_name');
    if (storedName) {
      setUserName(storedName);
    } else if (user?.email) {
      const emailName = user.email.split('@')[0];
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      setUserName(formattedName);
    }
  }, [user]);
  const portfolioHoldings = useMemo(() => 
    holdings.filter(h => !INDEX_TICKERS.includes(h.ticker) && !h.ticker.startsWith('^')),
    [holdings]
  );
  
  const [summary, setSummary] = useState({
    totalValue: 0,
    dayPL: 0,
    dayPLPercent: 0,
    weekPL: 0,
    weekPLPercent: 0,
    allTimePL: 0,
    allTimePLPercent: 0,
  });
  const [marketNews, setMarketNews] = useState<Array<{title: string, source: string, published: string, link: string, summary: string}>>([]);
  const [portfolioNews, setPortfolioNews] = useState<Array<{title: string, source: string, published: string, symbol: string, link: string}>>([]);

  useEffect(() => {
    async function fetchData() {
      if (portfolioHoldings.length === 0) return;
      
      const holdingsValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0);
      const totalValue = holdingsValue + purchasingPower;
      const totalCost = portfolioHoldings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
      const dayPL = portfolioHoldings.reduce((sum, h) => sum + (h.change * h.shares), 0);
      const unrealizedPL = holdingsValue - totalCost;
      const allTimePL = unrealizedPL + realizedPL;
      
      setSummary({
        totalValue,
        dayPL,
        dayPLPercent: holdingsValue > 0 ? (dayPL / (holdingsValue - dayPL)) * 100 : 0,
        weekPL: dayPL * 1.5,
        weekPLPercent: holdingsValue > 0 ? ((dayPL * 1.5) / (holdingsValue - dayPL * 1.5)) * 100 : 0,
        allTimePL,
        allTimePLPercent: totalCost > 0 ? (allTimePL / totalCost) * 100 : 0,
      });
    }
    
    fetchData();
  }, [portfolioHoldings, purchasingPower, realizedPL]);

  useEffect(() => {
    async function fetchNews() {
    try {
      const symbols = portfolioHoldings.slice(0, 8).map(h => h.ticker);
      
      const portfolioRes = await fetch(`/api/stock-news?symbol=${symbols.join(',')}&category=portfolio`);
      const portfolioData = await portfolioRes.json();
      if (portfolioData.news && portfolioData.news.length > 0) {
        setPortfolioNews(portfolioData.news);
      }
      
      const marketRes = await fetch(`/api/stock-news?symbol=general&category=market`);
      const marketData = await marketRes.json();
      if (marketData.news && marketData.news.length > 0) {
        setMarketNews(marketData.news.slice(0, 4));
      }
    } catch (err) {
        console.error('Failed to fetch news:', err);
      }
    }
    
    if (portfolioHoldings.length > 0) {
      fetchNews();
    }
  }, [portfolioHoldings]);

  const allocationData = useMemo((): AssetAllocationItem[] => {
    if (portfolioHoldings.length === 0) return assetAllocation;
    
    const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    if (totalValue === 0) return assetAllocation;
    
    const sectorMap = new Map<string, number>();
    
    portfolioHoldings.forEach(h => {
      const currentSector = h.sector || 'Other';
      const existing = sectorMap.get(currentSector) || 0;
      sectorMap.set(currentSector, existing + h.totalValue);
    });
    
    const allocations: AssetAllocationItem[] = [];
    const colors = Object.values(SECTOR_COLORS);
    let colorIndex = 0;
    
    sectorMap.forEach((value, sector) => {
      allocations.push({
        sector,
        value,
        percentage: Math.round((value / totalValue) * 100),
        color: SECTOR_COLORS[sector] || colors[colorIndex++ % colors.length],
      });
    });
    
    allocations.sort((a, b) => b.percentage - a.percentage);
    
    if (allocations.length > 5) {
      const top5 = allocations.slice(0, 5);
      const othersValue = allocations.slice(5).reduce((sum, a) => sum + a.value, 0);
      top5.push({
        sector: 'Other',
        value: othersValue,
        percentage: Math.round((othersValue / totalValue) * 100),
        color: '#6B7280',
      });
      return top5;
    }
    
    return allocations;
  }, [portfolioHoldings]);

  const sortedTopHoldings = useMemo(() => {
    return [...portfolioHoldings].sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);
  }, [portfolioHoldings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00BFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading live market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}, {userName}</h1>
        <p className="text-[#6B7280]">Here&apos;s your portfolio overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <PortfolioCard
          title="Total Portfolio Value"
          value={(summary.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          isMain
        />
        <PortfolioCard
          title="Purchasing Power"
          value={purchasingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          editable
          onEdit={() => {
            setPpInput(purchasingPower.toString());
            setShowPPModal(true);
          }}
        />
        <PortfolioCard
          title="Day P/L"
          change={summary.dayPL}
          changePercent={summary.dayPLPercent}
          showValue={false}
        />
        <PortfolioCard
          title="Week P/L"
          change={summary.weekPL}
          changePercent={summary.weekPLPercent}
          showValue={false}
        />
        <PortfolioCard
          title="All-Time P/L"
          change={summary.allTimePL}
          changePercent={summary.allTimePLPercent}
          showValue={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AllocationChart data={allocationData} />
        </div>
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Top Holdings</h3>
              <span className="text-sm text-[#6B7280]">By value</span>
            </div>
            <HoldingsTable holdings={sortedTopHoldings} />
            {portfolioHoldings.length > 5 && (
              <div className="mt-4 pt-4 border-t border-[#1F1F2E]">
                <a 
                  href="/portfolio" 
                  className="flex items-center justify-center gap-2 text-[#00BFFF] hover:text-[#00A8E8] transition-colors font-medium"
                >
                  Show more ({portfolioHoldings.length - 5} more)
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-8 bg-[#00BFFF] rounded-full"></span>
          Breaking Market News
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {marketNews.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`card p-6 hover:bg-[#12121A] transition-all group ${index === 0 ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#00BFFF] font-medium px-2 py-0.5 bg-[#00BFFF]/10 rounded">{item.source}</span>
                <span className="text-xs text-[#6B7280]">{item.published}</span>
                {index === 0 && (
                  <span className="text-xs text-red-500 font-bold px-2 py-0.5 bg-red-500/10 rounded animate-pulse">LIVE</span>
                )}
              </div>
              <h3 className={`text-lg font-semibold text-white mb-2 group-hover:text-[#00BFFF] transition-colors ${index === 0 ? 'text-xl' : ''}`}>
                {item.title}
              </h3>
              <p className="text-sm text-[#6B7280] line-clamp-2">{item.summary}</p>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00FFB0] rounded-full"></span>
          Your News
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {portfolioNews.slice(0, 8).map((item, idx) => (
            <NewsCard key={`portfolio-${idx}`} item={{
              id: `portfolio-${idx}`,
              title: item.title,
              source: item.source,
              timestamp: item.published,
              ticker: item.symbol,
              sentiment: 'neutral' as const,
              summary: item.title,
              link: item.link,
            }} />
          ))}
        </div>
      </div>

      {showPPModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit Purchasing Power</h3>
              <button
                onClick={() => setShowPPModal(false)}
                className="text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">Current Balance</label>
                <p className="text-2xl font-bold text-white">
                  ${purchasingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-[#9CA3AF] mb-2 block">New Balance</label>
                <input
                  type="number"
                  value={ppInput}
                  onChange={(e) => setPpInput(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="Enter new balance"
                  autoFocus
                />
              </div>
              
              <button
                onClick={async () => {
                  const newAmount = parseFloat(ppInput);
                  if (isNaN(newAmount) || newAmount < 0) return;
                  
                  setPpLoading(true);
                  
                  if (isConfigured && supabase && user) {
                    await supabase
                      .from('purchasing_power')
                      .update({ amount: newAmount })
                      .eq('user_id', user.id);
                  }
                  
                  setPurchasingPower(newAmount);
                  localStorage.setItem('starkflow_purchasing_power', JSON.stringify(newAmount));
                  window.dispatchEvent(new CustomEvent('portfolio-updated'));
                  
                  setPpLoading(false);
                  setShowPPModal(false);
                }}
                disabled={ppLoading || !ppInput}
                className="w-full py-3 px-6 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {ppLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}