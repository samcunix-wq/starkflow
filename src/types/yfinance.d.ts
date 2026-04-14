declare module 'yfinance' {
  export interface Ticker {
    info: () => Promise<any>;
    history: (options?: any) => Promise<any>;
    fundamentals?: {
      balanceSheet?: () => Promise<any>;
    };
  }
  export function Ticker(symbol: string): Ticker;
  export function search(query: string, options?: any): Promise<any>;
}