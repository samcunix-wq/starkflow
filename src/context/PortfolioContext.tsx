'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

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
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'starkflow_holdings';
const PP_KEY = 'starkflow_purchasing_power';
const REALIZED_PL_KEY = 'starkflow_realized_pl';
const INITIAL_PURCHASING_POWER = 5000;
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META', 'JPM', 'V', 'JNJ', 'PG', 'VOO', 'SPY', 'QQQ', 'SCHD', 'VTI', 'VYM', 'HD', 'UNH', 'DIS', 'NFLX', 'KO', 'PEP', 'COST', 'ABBV', 'MRK', 'CVX', 'XOM', 'WMT', 'TMO', 'CSCO', 'ABT', 'AVGO', 'ACN', 'NKE', 'LLY', 'VZ', 'INTC', 'AMD', 'QCOM', 'TXN', 'ADBE', 'CRM', 'ORCL', 'IBM', 'NOW', 'INTU', 'AMAT', 'SBUX', 'PM', 'HON', 'UPS', 'RTX', 'LOW', 'MS', 'GS', 'BLK', 'AXP', 'SPGI', 'MDLZ', 'TGT', 'CAT', 'DE', 'MCD', 'ISRG', 'MDT', 'ZTS', 'SYK', 'BKNG', 'GILD', 'ADP', 'REGN', 'VRTX', 'ADI', 'LRCX', 'MU', 'KLAC', 'AMT', 'CCI', 'PLD', 'EQIX', 'PSA', 'AVB', 'EQR', 'WELL', 'DLR', 'SPG', 'O', 'KIM', 'REG', 'PFE', 'MRNA', 'BION', 'CVS', 'CI', 'HUM', 'CNC', 'MOH', 'ELV', 'HCA', 'THC', 'UHS', 'ABC', 'CAH', 'MCK', 'BDX', 'EW', 'ALGN', 'IDXX', 'IQV', 'INCY', 'TECH', 'RMD', 'STE', 'HOLX', 'WAT', 'DHR', 'BSX', 'GE', 'APH', 'TDG', 'ROK', 'ITW', 'ETN', 'EMR', 'FTV', 'AME', 'DOV', 'FTNT', 'PANW', 'CRWD', 'ZS', 'OKTA', 'NET', 'DDOG', 'SNOW', 'TEAM', 'WDAY', 'HUBS', 'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'UBER', 'LYFT', 'DASH', 'COIN', 'MSTR', 'HOOD', 'RIVN', 'LCID', 'F', 'GM'];

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldingsState] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPower, setPurchasingPowerState] = useState(INITIAL_PURCHASING_POWER);
  const [realizedPL, setRealizedPL] = useState(0);

  const setHoldings = useCallback((newHoldings: Holding[]) => {
    setHoldingsState(newHoldings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHoldings));
    }
  }, []);

  const setPurchasingPower = useCallback((value: number) => {
    setPurchasingPowerState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PP_KEY, JSON.stringify(value));
    }
    window.dispatchEvent(new CustomEvent('portfolio-updated'));
  }, []);

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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userHoldings: Holding[] = stored ? JSON.parse(stored) : [];
      
      const symbols = DEFAULT_TICKERS.join(',');
      const userHoldingsJson = encodeURIComponent(JSON.stringify(userHoldings));
      const res = await fetchWithTimeout(`/api/stock?symbol=${symbols}&summary=true&userHoldings=${userHoldingsJson}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.holdings && data.holdings.length > 0) {
          setHoldings(data.holdings);
        } else {
          setHoldings(userHoldings);
        }
      } else {
        setHoldings(userHoldings);
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
  }, [fetchWithTimeout, setHoldings]);

  useEffect(() => {
    const storedPP = localStorage.getItem(PP_KEY);
    if (storedPP) {
      setPurchasingPowerState(JSON.parse(storedPP));
    }
    
    const storedRealizedPL = localStorage.getItem(REALIZED_PL_KEY);
    if (storedRealizedPL) {
      setRealizedPL(JSON.parse(storedRealizedPL));
    }
    
    refreshHoldings();
    
    const handleStorageChange = () => {
      refreshHoldings();
      const storedPP = localStorage.getItem(PP_KEY);
      if (storedPP) {
        setPurchasingPowerState(JSON.parse(storedPP));
      }
      const storedRealizedPL = localStorage.getItem(REALIZED_PL_KEY);
      if (storedRealizedPL) {
        setRealizedPL(JSON.parse(storedRealizedPL));
      }
    };
    
    const handlePortfolioUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.holdings) {
        setHoldings(customEvent.detail.holdings);
      } else {
        refreshHoldings();
      }
      const storedPP = localStorage.getItem(PP_KEY);
      if (storedPP) {
        setPurchasingPowerState(JSON.parse(storedPP));
      }
      const storedRealizedPL = localStorage.getItem(REALIZED_PL_KEY);
      if (storedRealizedPL) {
        setRealizedPL(JSON.parse(storedRealizedPL));
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
  }), [holdings, isLoading, purchasingPower, setHoldings, addHoldingFn, sellFromHoldingFn, refreshHoldings, setPurchasingPower, updatePurchasingPower, realizedPL, addRealizedPL]);

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