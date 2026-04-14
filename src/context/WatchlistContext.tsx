'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
}

interface WatchlistContextType {
  watchlists: Watchlist[];
  createWatchlist: (name: string) => void;
  deleteWatchlist: (id: string) => void;
  renameWatchlist: (id: string, name: string) => void;
  addToWatchlist: (listId: string, item: WatchlistItem) => void;
  removeFromWatchlist: (listId: string, symbol: string) => void;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const STORAGE_KEY = 'starkflow_watchlists';
const DEFAULT_WATCHLIST: Watchlist = {
  id: 'default',
  name: 'My Watchlist',
  items: [],
  createdAt: new Date().toISOString(),
};

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setWatchlists(JSON.parse(stored));
        } catch {
          setWatchlists([DEFAULT_WATCHLIST]);
        }
      } else {
        setWatchlists([DEFAULT_WATCHLIST]);
      }
      setIsLoading(false);
    }
  }, []);

  const saveToStorage = (lists: Watchlist[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    setWatchlists(lists);
  };

  const createWatchlist = (name: string) => {
    const newList: Watchlist = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
    };
    saveToStorage([...watchlists, newList]);
  };

  const deleteWatchlist = (id: string) => {
    if (watchlists.length <= 1) return;
    saveToStorage(watchlists.filter(w => w.id !== id));
  };

  const renameWatchlist = (id: string, name: string) => {
    saveToStorage(watchlists.map(w => w.id === id ? { ...w, name } : w));
  };

  const addToWatchlist = (listId: string, item: WatchlistItem) => {
    saveToStorage(watchlists.map(w => {
      if (w.id === listId) {
        if (w.items.some(i => i.symbol === item.symbol)) return w;
        return { ...w, items: [...w.items, item] };
      }
      return w;
    }));
  };

  const removeFromWatchlist = (listId: string, symbol: string) => {
    saveToStorage(watchlists.map(w => {
      if (w.id === listId) {
        return { ...w, items: w.items.filter(i => i.symbol !== symbol) };
      }
      return w;
    }));
  };

  return (
    <WatchlistContext.Provider value={{ watchlists, createWatchlist, deleteWatchlist, renameWatchlist, addToWatchlist, removeFromWatchlist, isLoading }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}