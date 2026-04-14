'use client';

import { useEffect, useState, useRef, use } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Star, Bell, ExternalLink, Activity, Building2, DollarSign, BarChart2, PieChart, Newspaper, Clock, ExternalLink as LinkIcon, Wallet, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { usePortfolio, Holding } from '@/context/PortfolioContext';
import { useWatchlist } from '@/context/WatchlistContext';
import RelatedCompanies from '@/components/RelatedCompanies';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  summary?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number | null;
  peRatio: number | null;
  pegRatio: number | null;
  dividendYield: number | null;
  dividendRate: number | null;
  exDivDate: string | null;
  dividendPaymentDate: string | null;
  dividendFrequency: string | null;
  nextEarningsDate: string | null;
  eps: number | null;
  epsForward: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  revenueGrowth: number | null;
  revenue: number | null;
  grossProfit: number | null;
  ebitda: number | null;
  beta: number | null;
  averageVolume: number | null;
  averageVolume10Day: number | null;
  sector: string | null;
  industry: string | null;
  website: string | null;
  description: string | null;
  employees: number | null;
  currency: string;
  exchange: string | null;
  ipo: string | null;
}

function getTradingViewSymbol(symbol: string, exchange: string | null): string {
  const s = symbol.toUpperCase();
  if (!exchange) return s;
  
  const exch = exchange.toUpperCase();
  
  if (exch.includes('NYSE') || exch === 'NYQ') return `NYSE:${s}`;
  if (exch.includes('NASDAQ')) return `NASDAQ:${s}`;
  if (exch.includes('LSE')) return `LSE:${s}`;
  if (exch.includes('AMS') || exch.includes('EURONEXT')) return `AMS:${s}`;
  if (exch.includes('XETRA')) return `XETR:${s}`;
  if (exch.includes('HKEX') || exch.includes('HONG KONG')) return `HKEX:${s}`;
  if (exch.includes('TSE') || exch.includes('TOKYO')) return `TSE:${s}`;
  
  return s;
}

export default function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const [data, setData] = useState<StockData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'news'>('chart');
  const [tvSymbol, setTvSymbol] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [buyForm, setBuyForm] = useState({ shares: '', price: '' });
  const [sellForm, setSellForm] = useState({ shares: '', price: '' });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  
  const { holdings, setHoldings, addHolding, sellFromHolding } = usePortfolio();
  const { watchlists, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const userPosition = holdings.find(h => h.ticker === symbol?.toUpperCase());
  
  const isInWatchlist = watchlists.some(w => w.items.some(i => i.symbol === symbol?.toUpperCase()));
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    
    async function fetchStock() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        if (json.error && !json.fallback) throw new Error(json.error);
        setData(json);
        setTvSymbol(getTradingViewSymbol(json.symbol, json.exchange));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (symbol) fetchStock();
  }, [symbol]);

  useEffect(() => {
    if (!loading && data && activeTab === 'chart') {
      const interval = setInterval(() => {
        if ((window as any).TradingView) {
          if (chartContainerRef.current && !widgetRef.current) {
            widgetRef.current = new (window as any).TradingView.widget({
              width: '100%',
              height: 500,
              symbol: tvSymbol || `NASDAQ:${data.symbol}`,
              interval: 'D',
              timezone: 'America/New_York',
              theme: 'dark',
              style: '1',
              locale: 'en',
              toolbar_bg: '#0D0D12',
              enable_publishing: false,
              allow_symbol_change: true,
              container_id: 'tradingview_chart',
              hide_side_toolbar: false,
              studies: ['MAS@tv-scripting'],
              backgroundColor: '#0D0D12',
            });
          }
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loading, data, activeTab, tvSymbol]);

  useEffect(() => {
    if (!loading && data && activeTab === 'news') {
      if (!news.length && !newsLoading) {
        setNewsLoading(true);
        fetch(`/api/stock-news?symbol=${data.symbol}`)
          .then(res => res.json())
          .then(newsData => {
            if (newsData.news) setNews(newsData.news);
          })
          .catch(err => console.error('News fetch error:', err))
          .finally(() => setNewsLoading(false));
      }
    }
  }, [loading, data, activeTab]);

  useEffect(() => {
    if (!loading && data && activeTab === 'chart' && chartContainerRef.current) {
      widgetRef.current = null;
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00BFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[#EF4444] mb-4">{error}</p>
        <Link href="/" className="text-[#00BFFF] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.change >= 0;
  
  const formatNumber = (num: number | null | undefined, isCurrency = false, isPercent = false) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (isPercent) return num.toFixed(2) + '%';
    if (isCurrency && Math.abs(num) >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (isCurrency && Math.abs(num) >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (isCurrency && Math.abs(num) >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (isCurrency) return '$' + num.toFixed(2);
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toFixed(2);
  };

  return (
    <div className="max-w-[1600px]">
      <script src="https://s3.tradingview.com/tv.js" async />
      
      <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">{data.symbol}</h1>
            <span className="text-[#6B7280]">•</span>
            <span className="text-lg text-[#9CA3AF]">{data.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-white font-mono">${data.price?.toFixed(2) || 'N/A'}</span>
            {data.change !== undefined && data.change !== null && (
              <span className={`flex items-center gap-1 text-lg font-mono ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent?.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>

        {!userPosition && (
          <div className="flex gap-3">
            <button 
              onClick={() => setShowBuyModal(true)}
              className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors"
            >
              Buy {data.symbol}
            </button>
            <button 
              onClick={() => setShowWatchlistModal(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isInWatchlist 
                  ? 'bg-[#10B981] text-white' 
                  : 'bg-[#12121A] text-[#9CA3AF] hover:text-white border border-[#1F1F2E]'
              }`}
            >
              {isInWatchlist ? 'Watching' : <><Eye className="w-5 h-5" /> Watch</>}
            </button>
          </div>
        )}

        {userPosition && (
          <div className="card p-4 bg-gradient-to-r from-[#00BFFF]/5 to-transparent border-l-4 border-l-[#00BFFF]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-[#00BFFF]" />
                <div>
                  <p className="text-sm text-[#6B7280]">Your Position</p>
                  <p className="text-lg font-semibold text-white">{userPosition.shares} shares</p>
                  <p className="text-xs text-[#6B7280]">Avg Cost: ${userPosition.avgCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6B7280]">Value</p>
                <p className="text-lg font-semibold text-white font-mono">${userPosition.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6B7280]">Today's Return</p>
                <p className={`text-lg font-semibold font-mono ${userPosition.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {userPosition.change >= 0 ? '+' : ''}${userPosition.change.toFixed(2)} ({userPosition.changePercent?.toFixed(2)}%)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6B7280]">Total Gain/Loss</p>
                <p className={`text-lg font-semibold font-mono ${userPosition.totalGain >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {userPosition.totalGain >= 0 ? '+' : ''}${userPosition.totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-3 ml-4">
                <button 
                  onClick={() => setShowBuyModal(true)}
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors"
                >
                  Buy
                </button>
                <button 
                  onClick={() => setShowSellModal(true)}
                  className="px-5 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg font-medium transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('chart'); widgetRef.current = null; }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'chart' ? 'bg-[#00BFFF] text-white' : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            Advanced Chart
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'news' ? 'bg-[#00BFFF] text-white' : 'bg-[#12121A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            News & Analysis
          </button>
        </div>
      </div>

      {activeTab === 'chart' && (
        <div className="mb-8">
          <div className="card p-6">
            <div id="tradingview_chart" ref={chartContainerRef} style={{ height: 500 }} />
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="mb-8">
          {newsLoading ? (
            <div className="card p-8 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#00BFFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[#6B7280]">Loading news...</p>
              </div>
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#00BFFF]" />
                Latest News for {data.symbol}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="card p-4 hover:bg-[#12121A] transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[#00BFFF] font-medium px-2 py-0.5 bg-[#00BFFF]/10 rounded">{item.source}</span>
                      <Clock className="w-3 h-3 text-[#6B7280]" />
                      <span className="text-xs text-[#6B7280]">{item.published}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#00BFFF] transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <LinkIcon className="w-3 h-3" />
                      <span>Read more</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Newspaper className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-[#6B7280]">No news available for {data.symbol}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00BFFF]" /> Price & Volume
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Open</span>
                <span className="text-white font-mono">{formatNumber(data.open, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Prev Close</span>
                <span className="text-white font-mono">{formatNumber(data.previousClose, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Day High</span>
                <span className="text-white font-mono">{formatNumber(data.high, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Day Low</span>
                <span className="text-white font-mono">{formatNumber(data.low, true)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Volume</span>
                <span className="text-white font-mono">{formatNumber(data.volume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Avg Volume</span>
                <span className="text-white font-mono">{formatNumber(data.averageVolume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">52W High</span>
                <span className="text-white font-mono">{formatNumber(data.fiftyTwoWeekHigh, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">52W Low</span>
                <span className="text-white font-mono">{formatNumber(data.fiftyTwoWeekLow, true)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#00BFFF]" /> Valuation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Market Cap</span>
                <span className="text-white font-mono">{formatNumber(data.marketCap, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">P/E Ratio</span>
                <span className="text-white font-mono">{formatNumber(data.peRatio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">PEG Ratio</span>
                <span className="text-white font-mono">{formatNumber(data.pegRatio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">EPS (TTM)</span>
                <span className="text-white font-mono">{formatNumber(data.eps, true)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Dividend Yield</span>
                <span className="text-white font-mono">{formatNumber(data.dividendYield, false, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Price/Book</span>
                <span className="text-white font-mono">{formatNumber(data.priceToBook)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Price/Sales</span>
                <span className="text-white font-mono">{formatNumber(data.priceToSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Beta</span>
                <span className="text-white font-mono">{formatNumber(data.beta)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00BFFF]" /> Profitability
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Profit Margin</span>
                <span className="text-white font-mono">{formatNumber(data.profitMargin, false, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Operating Margin</span>
                <span className="text-white font-mono">{formatNumber(data.operatingMargin, false, true)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">ROE</span>
                <span className="text-white font-mono">{formatNumber(data.returnOnEquity, false, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">ROA</span>
                <span className="text-white font-mono">{formatNumber(data.returnOnAssets, false, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">EBITDA</span>
                <span className="text-white font-mono">{formatNumber(data.ebitda, true)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#00BFFF]" /> Growth & Size
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Revenue Growth</span>
                <span className="text-white font-mono">{formatNumber(data.revenueGrowth, false, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Revenue</span>
                <span className="text-white font-mono">{formatNumber(data.revenue, true)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Gross Profit</span>
                <span className="text-white font-mono">{formatNumber(data.grossProfit, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Employees</span>
                <span className="text-white font-mono">{data.employees ? data.employees.toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#00BFFF]" /> Company Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Sector</p>
            <p className="text-sm text-white">{data.sector || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Industry</p>
            <p className="text-sm text-white">{data.industry || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Exchange</p>
            <p className="text-sm text-white">{data.exchange || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">IPO Date</p>
            <p className="text-sm text-white">{data.ipo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Currency</p>
            <p className="text-sm text-white">{data.currency || 'USD'}</p>
          </div>
          {data.exDivDate && (
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Ex-Dividend Date</p>
              <p className="text-sm text-white">{data.exDivDate}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Next Earnings</p>
            <p className="text-sm text-white">{data.nextEarningsDate || 'TBD'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Dividend Yield</p>
            <p className="text-sm text-white">{formatNumber(data.dividendYield, false, true)}</p>
          </div>
        </div>
          {data.description && (
            <div className="mt-4 pt-4 border-t border-[#1F1F2E]">
              <p className="text-sm text-[#9CA3AF]">{data.description}</p>
            </div>
          )}
        </div>

        {showBuyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Buy {symbol?.toUpperCase()}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#6B7280] mb-2 block">Shares</label>
                  <input
                    type="number"
                    value={buyForm.shares}
                    onChange={(e) => setBuyForm({ ...buyForm, shares: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B7280] mb-2 block">Price per Share ($)</label>
                  <input
                    type="number"
                    value={buyForm.price || data?.price?.toString() || ''}
                    onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    const shares = parseFloat(buyForm.shares);
                    const price = parseFloat(buyForm.price) || data?.price || 0;
                    if (shares > 0 && price > 0) {
                      const newHolding: Holding = {
                        id: symbol?.toUpperCase() || '',
                        ticker: symbol?.toUpperCase() || '',
                        name: data?.name || symbol?.toUpperCase() || '',
                        shares,
                        avgCost: price,
                        currentPrice: price,
                        change: 0,
                        changePercent: 0,
                        totalValue: shares * price,
                        totalGain: 0,
                        totalGainPercent: 0,
                        peRatio: data?.peRatio || 0,
                        dividendYield: data?.dividendYield || 0,
                        dividendRate: data?.dividendRate || 0,
                        exDivDate: data?.exDivDate || '-',
                        dividendPaymentDate: data?.dividendPaymentDate || '-',
                        dividendFrequency: data?.dividendFrequency || 'quarterly',
                        nextEarningsDate: data?.nextEarningsDate || '-',
                        sector: data?.sector || 'Other',
                      };
                      addHolding(newHolding);
                      setShowBuyModal(false);
                      setBuyForm({ shares: '', price: '' });
                    }
                  }}
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-xl"
                >
                  Confirm Buy
                </button>
                <button onClick={() => setShowBuyModal(false)} className="w-full py-3 text-[#6B7280] hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showSellModal && userPosition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Sell {symbol?.toUpperCase()}</h3>
              <div className="p-3 bg-[#12121A] rounded-lg mb-4">
                <p className="text-sm text-[#6B7280]">You own {userPosition.shares} shares</p>
                <p className="text-sm text-[#6B7280]">Avg Cost: ${userPosition.avgCost.toFixed(2)}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#6B7280] mb-2 block">Shares to Sell</label>
                  <input
                    type="number"
                    max={userPosition.shares}
                    value={sellForm.shares}
                    onChange={(e) => setSellForm({ ...sellForm, shares: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                    placeholder={`Max: ${userPosition.shares}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B7280] mb-2 block">Price per Share ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellForm.price || data?.price?.toString() || ''}
                    onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                  />
                </div>
                {sellForm.shares && sellForm.price && (
                  <div className="p-3 bg-[#12121A] rounded-lg">
                    <p className="text-sm text-[#6B7280]">Total Sale Value</p>
                    <p className="text-xl font-bold text-white">
                      ${(parseFloat(sellForm.shares) * parseFloat(sellForm.price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    const shares = parseFloat(sellForm.shares);
                    const price = parseFloat(sellForm.price) || data?.price || 0;
                    if (shares > 0 && shares <= userPosition.shares && price > 0) {
                      sellFromHolding(symbol?.toUpperCase() || '', shares, price);
                      setShowSellModal(false);
                      setSellForm({ shares: '', price: '' });
                    }
                  }}
                  className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium rounded-xl"
                >
                  Confirm Sell
                </button>
                <button onClick={() => setShowSellModal(false)} className="w-full py-3 text-[#6B7280] hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showWatchlistModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Add to Watchlist</h3>
                <button onClick={() => setShowWatchlistModal(false)} className="text-[#6B7280] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {watchlists.map(list => {
                  const isInList = list.items.some(i => i.symbol === symbol?.toUpperCase());
                  return (
                    <button
                      key={list.id}
                      onClick={() => {
                        if (isInList) {
                          removeFromWatchlist(list.id, symbol?.toUpperCase() || '');
                        } else {
                          addToWatchlist(list.id, {
                            symbol: symbol?.toUpperCase() || '',
                            name: data.name || symbol?.toUpperCase() || '',
                            price: data.price,
                            change: data.change,
                            changePercent: data.changePercent,
                            addedAt: new Date().toISOString(),
                          });
                        }
                        setShowWatchlistModal(false);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left bg-[#12121A] hover:bg-[#1F1F2E] text-white"
                    >
                      <span>{list.name}</span>
                      <span className={`text-xs ${isInList ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                        {isInList ? 'Remove' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      <div className="mt-8">
        <RelatedCompanies symbol={data.symbol} />
      </div>
    </div>
  );
}