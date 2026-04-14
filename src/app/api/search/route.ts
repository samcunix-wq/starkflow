import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const mockSearchResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Incorporated', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'HD', name: 'The Home Depot Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'T', name: 'AT&T Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'VZ', name: 'Verizon Communications', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'BA', name: 'The Boeing Company', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'GE', name: 'General Electric Company', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'NKE', name: 'NIKE Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'MCD', name: "McDonald's Corporation", type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', type: 'Common Stock', exchange: 'NASDAQ' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'CVS', name: 'CVS Health Corporation', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', type: 'Common Stock', exchange: 'NYSE' },
  { symbol: 'O', name: 'Realty Income Corporation', type: 'REIT', exchange: 'NYSE' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VGT', name: 'Vanguard Information Technology ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'HDV', name: 'iShares Core Dividend ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SDY', name: 'SPDR S&P Dividend ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SYLD', name: 'Cambria Shareholder Yield ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VTV', name: 'Vanguard Value ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SCHG', name: 'Schwab US Large-Cap Growth ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SCHV', name: 'Schwab US Large-Cap Value ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'DGRO', name: 'iShares Dividend Growth ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VT', name: 'Vanguard Total World Stock ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'IXUS', name: 'iShares Core MSCI Total International ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'HYG', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'EMB', name: 'iShares JP Morgan USD Emerging Markets Bond ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'VNLA', name: 'Vanguard Long-Term Treasury ETF', type: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'BIB', name: 'Direxion NASDAQ 100 Bull 2X ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'TQQQ', name: 'ProShares Ultra QQQ', type: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'FAS', name: 'Direxion Financial Bull 3X ETF', type: 'ETF', exchange: 'NYSE' },
  { symbol: 'FAZ', name: 'Direxion Financial Bear 3X ETF', type: 'ETF', exchange: 'NYSE' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  if (!FINNHUB_API_KEY) {
    const queryUpper = query.toUpperCase();
    const filtered = mockSearchResults.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.symbol.toUpperCase().startsWith(queryUpper)
    );
    return NextResponse.json(filtered.length > 0 ? filtered.slice(0, 10) : mockSearchResults.slice(0, 5));
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    const data = await res.json();

    const symbols = (data?.result || [])
      .filter((item: any) => 
        item.type === 'Common Stock' || 
        item.type === 'ETF' ||
        item.type === 'ETP' ||
        item.type === 'REIT'
      )
      .filter((item: any) => !item.symbol.includes('.'))
      .slice(0, 15)
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.description,
        type: item.type,
        exchange: item.exchange || '',
      }));

    return NextResponse.json(symbols);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: `Search failed: ${error.message}` },
      { status: 500 }
    );
  }
}