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
  exDivDate: string;
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

  const refreshHoldings = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userHoldings: Holding[] = stored ? JSON.parse(stored) : [];
      
      if (userHoldings.length > 0) {
        const symbols = userHoldings.map(h => h.ticker).join(',');
        const res = await fetch(`/api/stock?symbol=${symbols}&summary=true`);
        
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
      } else {
        setHoldings([]);
      }
    } catch (err) {
      console.error('Failed to refresh holdings:', err);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHoldingsState(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, [setHoldings]);

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
    
    const handleStorageChange = () => refreshHoldings();
    const handlePortfolioUpdate = () => refreshHoldings();
    
    (window as any).refreshPortfolio = () => refreshHoldings();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio-updated', handlePortfolioUpdate);
    
    const refreshInterval = setInterval(() => refreshHoldings(), 60000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
      clearInterval(refreshInterval);
    };
  }, [refreshHoldings]);

  const addHoldingFn = useCallback((newHolding: Holding) => {
    setHoldingsState(prev => {
      const existing = prev.find(h => h.ticker === newHolding.ticker);
      if (existing) {
        return prev.map(h => {
          if (h.ticker === newHolding.ticker) {
            const totalShares = h.shares + newHolding.shares;
            const totalCost = (h.shares * h.avgCost) + (newHolding.shares * newHolding.avgCost);
            return { ...h, shares: totalShares, avgCost: totalCost / totalShares };
          }
          return h;
        });
      }
      return [...prev, newHolding];
    });
  }, []);

  const sellFromHoldingFn = useCallback((ticker: string, sharesSold: number, price: number) => {
    const existing = holdings.find(h => h.ticker === ticker);
    if (existing) {
      const realizedGain = (price - existing.avgCost) * sharesSold;
      addRealizedPL(realizedGain);
    }
    setHoldingsState(prev => prev.map(h => {
      if (h.ticker === ticker) {
        const remainingShares = h.shares - sharesSold;
        if (remainingShares <= 0) return null;
        return { ...h, shares: remainingShares };
      }
      return h;
    }).filter((h): h is Holding => h !== null));
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
