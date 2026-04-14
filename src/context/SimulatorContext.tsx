'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SimulatorScenario {
  id: string;
  name: string;
  symbol: string;
  startDate: string;
  investmentAmount: number;
  monthlyContribution?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatorResult {
  scenarioId: string;
  currentValue: number;
  totalInvested: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  priceHistory: Array<{ date: string; value: number }>;
  dividendHistory: Array<{ date: string; amount: number; shares: number }>;
}

interface SimulatorContextType {
  scenarios: SimulatorScenario[];
  results: Record<string, SimulatorResult>;
  addScenario: (scenario: Omit<SimulatorScenario, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateScenario: (id: string, updates: Partial<SimulatorScenario>) => void;
  deleteScenario: (id: string) => void;
  saveResult: (result: SimulatorResult) => void;
  clearAll: () => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

const STORAGE_KEY = 'starkflow_simulator_scenarios';
const RESULTS_KEY = 'starkflow_simulator_results';

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [scenarios, setScenarios] = useState<SimulatorScenario[]>([]);
  const [results, setResults] = useState<Record<string, SimulatorResult>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedScenarios = localStorage.getItem(STORAGE_KEY);
      const savedResults = localStorage.getItem(RESULTS_KEY);
      
      if (savedScenarios) {
        setScenarios(JSON.parse(savedScenarios));
      }
      if (savedResults) {
        setResults(JSON.parse(savedResults));
      }
    } catch (error) {
      console.error('Failed to load simulator data:', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
      } catch (error) {
        console.error('Failed to save scenarios:', error);
      }
    }
  }, [scenarios, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
      } catch (error) {
        console.error('Failed to save results:', error);
      }
    }
  }, [results, isLoaded]);

  const addScenario = useCallback((scenario: Omit<SimulatorScenario, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newScenario: SimulatorScenario = {
      ...scenario,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setScenarios(prev => [...prev, newScenario]);
    return id;
  }, []);

  const updateScenario = useCallback((id: string, updates: Partial<SimulatorScenario>) => {
    setScenarios(prev => prev.map(s => 
      s.id === id 
        ? { ...s, ...updates, updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
  }, []);

  const saveResult = useCallback((result: SimulatorResult) => {
    setResults(prev => ({
      ...prev,
      [result.scenarioId]: result,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setScenarios([]);
    setResults({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESULTS_KEY);
  }, []);

  return (
    <SimulatorContext.Provider value={{
      scenarios,
      results,
      addScenario,
      updateScenario,
      deleteScenario,
      saveResult,
      clearAll,
    }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
