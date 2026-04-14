'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase, isConfigured as isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  peRatio: number;
  dividendYield: number;
  dividendRate: number;
  exDivDate: string;
  dividendPaymentDate: string;
  dividendFrequency: string;
  nextEarningsDate: string;
  sector: string;
}

interface PortfolioContextType {
  holdings: Holding[];
  setHoldings: (holdings: Holding[]) => void;
  addHolding: (holding: Holding) => void;
  sellFromHolding: (ticker: string, sharesSold: number, price: number) => void;
  isLoading: boolean;
  refreshHoldings: () => Promise<void>;
  purchasingPower: number;
  setPurchasingPower: (value: number) => void;
  updatePurchasingPower: (change: number) => void;
  realizedPL: number;
  addRealizedPL: (gain: number) => void;
  isSynced: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'starkflow_holdings';
const PP_KEY = 'starkflow_purchasing_power';
const REALIZED_PL_KEY = 'starkflow_realized_pl';
const INITIAL_PURCHASING_POWER = 5000;
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META', 'JPM', 'V', 'JNJ', 'PG', 'VOO', 'SPY', 'QQQ', 'SCHD', 'VTI', 'VYM', 'HD', 'UNH', 'DIS', 'NFLX', 'KO', 'PEP', 'COST', 'ABBV', 'MRK', 'CVX', 'XOM', 'WMT', 'TMO', 'CSCO', 'ABT', 'AVGO', 'ACN', 'NKE', 'LLY', 'VZ', 'INTC', 'AMD', 'QCOM', 'TXN', 'ADBE', 'CRM', 'ORCL', 'IBM', 'NOW', 'INTU', 'AMAT', 'SBUX', 'PM', 'HON', 'UPS', 'RTX', 'LOW', 'MS', 'GS', 'BLK', 'AXP', 'SPGI', 'MDLZ', 'TGT', 'CAT', 'DE', 'MCD', 'ISRG', 'MDT', 'ZTS', 'SYK', 'BKNG', 'GILD', 'ADP', 'REGN', 'VRTX', 'ADI', 'LRCX', 'MU', 'KLAC', 'AMT', 'CCI', 'PLD', 'EQIX', 'PSA', 'AVB', 'EQR', 'WELL', 'DLR', 'SPG', 'O', 'KIM', 'REG', 'PFE', 'MRNA', 'BION', 'CVS', 'CI', 'HUM', 'CNC', 'MOH', 'ELV', 'HCA', 'THC', 'UHS', 'ABC', 'CAH', 'MCK', 'BDX', 'EW', 'ALGN', 'IDXX', 'IQV', 'INCY', 'TECH', 'RMD', 'STE', 'HOLX', 'WAT', 'DHR', 'BSX', 'GE', 'APH', 'TDG', 'ROK', 'ITW', 'ETN', 'EMR', 'FTV', 'AME', 'DOV', 'FTNT', 'PANW', 'CRWD', 'ZS', 'OKTA', 'NET', 'DDOG', 'SNOW', 'TEAM', 'WDAY', 'HUBS', 'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'UBER', 'LYFT', 'DASH', 'COIN', 'MSTR', 'HOOD', 'RIVN', 'LCID', 'F', 'GM'];

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [holdings, setHoldingsState] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPower, setPurchasingPowerState] = useState(INITIAL_PURCHASING_POWER);
  const [realizedPL, setRealizedPL] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  const syncToSupabase = useCallback(async (holdingsData: Holding[], pp: number, rp: number) => {
    if (!user || !isSupabaseConfigured) return;
    
    try {
      const { error: holdingsError } = await supabase
        .from('holdings')
        .upsert(
          holdingsData.map(h => ({
            user_id: user.id,
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            avg_cost: h.avgCost,
            current_price: h.currentPrice,
            change_amount: h.change,
            change_percent: h.changePercent,
            total_value: h.totalValue,
            total_gain: h.totalGain,
            total_gain_percent: h.totalGainPercent,
            pe_ratio: h.peRatio,
            dividend_yield: h.dividendYield,
            dividend_rate: h.dividendRate,
            ex_div_date: h.exDivDate,
            dividend_payment_date: h.dividendPaymentDate,
            dividend_frequency: h.dividendFrequency,
            next_earnings_date: h.nextEarningsDate,
            sector: h.sector,
          })),
          { onConflict: 'user_id,ticker' }
        );

      if (holdingsError) {
        console.error('Failed to sync holdings:', holdingsError);
      } else {
        setIsSynced(true);
      }

      const { error: ppError } = await supabase
        .from('purchasing_power')
        .upsert({ user_id: user.id, amount: pp }, { onConflict: 'user_id' });

      if (ppError) {
        console.error('Failed to sync purchasing power:', ppError);
      }

      const { error: rpError } = await supabase
        .from('realized_pl')
        .upsert({ user_id: user.id, amount: rp }, { onConflict: 'user_id' });

      if (rpError) {
        console.error('Failed to sync realized P/L:', rpError);
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }, [user]);

  const loadFromSupabase = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      const [holdingsRes, ppRes, rpRes] = await Promise.all([
        supabase.from('holdings').select('*').eq('user_id', user.id),
        supabase.from('purchasing_power').select('amount').eq('user_id', user.id).single(),
        supabase.from('realized_pl').select('amount').eq('user_id', user.id).single(),
      ]);

      const supabaseHoldings: Holding[] = holdingsRes.data?.map(h => ({
        id: h.id,
        ticker: h.ticker,
        name: h.name,
        shares: h.shares,
        avgCost: h.avg_cost,
        currentPrice: h.current_price,
        change: h.change_amount,
        changePercent: h.change_percent,
        totalValue: h.total_value,
        totalGain: h.total_gain,
        totalGainPercent: h.total_gain_percent,
        peRatio: h.pe_ratio,
        dividendYield: h.dividend_yield,
        dividendRate: h.dividend_rate,
        exDivDate: h.ex_div_date,
        dividendPaymentDate: h.dividend_payment_date,
        dividendFrequency: h.dividend_frequency,
        nextEarningsDate: h.next_earnings_date,
        sector: h.sector,
      })) || [];

      const supabasePP = ppRes.data?.amount;
      const supabaseRP = rpRes.data?.amount;

      return {
        holdings: supabaseHoldings.length > 0 ? supabaseHoldings : null,
        purchasingPower: supabasePP ?? null,
        realizedPL: supabaseRP ?? null,
      };
    } catch (err) {
      console.error('Failed to load from Supabase:', err);
      return null;
    }
  }, [user]);

  const setHoldings = useCallback((newHoldings: Holding[]) => {
    setHoldingsState(newHoldings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHoldings));
    }
    syncToSupabase(newHoldings, purchasingPower, realizedPL);
  }, [syncToSupabase, purchasingPower, realizedPL]);

  const setPurchasingPower = useCallback((value: number) => {
    setPurchasingPowerState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PP_KEY, JSON.stringify(value));
    }
    syncToSupabase(holdings, value, realizedPL);
    window.dispatchEvent(new CustomEvent('portfolio-updated'));
  }, [syncToSupabase, holdings, realizedPL]);

  const updatePurchasingPower = useCallback((change: number) => {
    setPurchasingPowerState(prev => prev + change);
  }, []);

  const addRealizedPL = useCallback((gain: number) => {
    setRealizedPL(prev => {
      const newValue = prev + gain;
      if (typeof window !== 'undefined') {
        localStorage.setItem(REALIZED_PL_KEY, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, []);

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      syncToSupabase(holdings, purchasingPower, realizedPL);
    }
  }, [holdings, purchasingPower, realizedPL, user, syncToSupabase]);

  const fetchWithTimeout = useCallback(async (url: string, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    }
  }, []);

  const refreshHoldings = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    setIsSynced(false);
    
    try {
      let localHoldings: Holding[] = [];
      
      if (user && isSupabaseConfigured) {
        const supabaseData = await loadFromSupabase();
        if (supabaseData) {
          if (supabaseData.holdings) {
            setHoldingsState(supabaseData.holdings);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseData.holdings));
          }
          if (supabaseData.purchasingPower !== null) {
            setPurchasingPowerState(supabaseData.purchasingPower);
            localStorage.setItem(PP_KEY, JSON.stringify(supabaseData.purchasingPower));
          }
          if (supabaseData.realizedPL !== null) {
            setRealizedPL(supabaseData.realizedPL);
            localStorage.setItem(REALIZED_PL_KEY, JSON.stringify(supabaseData.realizedPL));
          }
          setIsLoading(false);
          return;
        }
      }
      
      const stored = localStorage.getItem(STORAGE_KEY);
      localHoldings = stored ? JSON.parse(stored) : [];
      
      const storedPP = localStorage.getItem(PP_KEY);
      if (storedPP) {
        setPurchasingPowerState(JSON.parse(storedPP));
      }
      
      const storedRealizedPL = localStorage.getItem(REALIZED_PL_KEY);
      if (storedRealizedPL) {
        setRealizedPL(JSON.parse(storedRealizedPL));
      }
      
      const symbols = DEFAULT_TICKERS.join(',');
      const userHoldingsJson = encodeURIComponent(JSON.stringify(localHoldings));
      const res = await fetchWithTimeout(`/api/stock?symbol=${symbols}&summary=true&userHoldings=${userHoldingsJson}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.holdings && data.holdings.length > 0) {
          setHoldings(data.holdings);
        } else {
          setHoldings(localHoldings);
        }
      } else {
        setHoldings(localHoldings);
      }
    } catch (err: any) {
      if (err.message !== 'Request timed out') {
        console.error('Failed to refresh holdings:', err);
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHoldingsState(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithTimeout, setHoldings, loadFromSupabase, user]);

  useEffect(() => {
    refreshHoldings();
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      refreshHoldings();
    };
    
    const handlePortfolioUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.holdings) {
        setHoldings(customEvent.detail.holdings);
      } else {
        refreshHoldings();
      }
    };
    
    (window as any).refreshPortfolio = () => {
      refreshHoldings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio-updated', handlePortfolioUpdate);
    
    const refreshInterval = setInterval(() => {
      refreshHoldings();
    }, 60000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
      clearInterval(refreshInterval);
    };
  }, [refreshHoldings, setHoldings]);

  const addHoldingFn = useCallback((newHolding: Holding) => {
    setHoldingsState(prev => addHolding(prev, newHolding));
  }, []);

  const sellFromHoldingFn = useCallback((ticker: string, sharesSold: number, price: number) => {
    const existing = holdings.find(h => h.ticker === ticker);
    if (existing) {
      const realizedGain = (price - existing.avgCost) * sharesSold;
      addRealizedPL(realizedGain);
    }
    setHoldingsState(prev => sellFromHolding(prev, ticker, sharesSold, price));
  }, [holdings, addRealizedPL]);

  const contextValue = useMemo(() => ({
    holdings,
    setHoldings,
    addHolding: addHoldingFn,
    sellFromHolding: sellFromHoldingFn,
    isLoading,
    refreshHoldings,
    purchasingPower,
    setPurchasingPower,
    updatePurchasingPower,
    realizedPL,
    addRealizedPL,
    isSynced,
  }), [holdings, isLoading, purchasingPower, setHoldings, addHoldingFn, sellFromHoldingFn, refreshHoldings, setPurchasingPower, updatePurchasingPower, realizedPL, addRealizedPL, isSynced]);

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

export function addHolding(holdings: Holding[], newHolding: Holding): Holding[] {
  const existing = holdings.find(h => h.ticker === newHolding.ticker);
  if (existing) {
    return holdings.map(h => {
      if (h.ticker === newHolding.ticker) {
        const totalShares = h.shares + newHolding.shares;
        const totalCost = (h.shares * h.avgCost) + (newHolding.shares * newHolding.avgCost);
        return {
          ...h,
          shares: totalShares,
          avgCost: totalCost / totalShares,
          totalValue: totalShares * h.currentPrice,
        };
      }
      return h;
    });
  }
  return [...holdings, newHolding];
}

export function sellFromHolding(holdings: Holding[], ticker: string, sharesSold: number, price: number): Holding[] {
  return holdings
    .map(h => {
      if (h.ticker === ticker) {
        const remainingShares = h.shares - sharesSold;
        if (remainingShares <= 0) {
          return null;
        }
        return {
          ...h,
          shares: remainingShares,
          totalValue: remainingShares * price,
        };
      }
      return h;
    })
    .filter((h): h is Holding => h !== null);
}
