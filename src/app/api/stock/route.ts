import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const CACHE_DURATION = 30;

function cachedResponse(data: any, options: { status?: number } = {}) {
  return NextResponse.json(data, {
    status: options.status,
    headers: {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
    },
  });
}

const DEFAULT_HOLDINGS = [
  { ticker: 'AAPL', shares: 50, avgCost: 145.0 },
  { ticker: 'MSFT', shares: 30, avgCost: 350.0 },
  { ticker: 'GOOGL', shares: 15, avgCost: 140.0 },
  { ticker: 'NVDA', shares: 25, avgCost: 450.0 },
  { ticker: 'TSLA', shares: 20, avgCost: 220.0 },
  { ticker: 'AMZN', shares: 40, avgCost: 155.0 },
  { ticker: 'META', shares: 18, avgCost: 380.0 },
  { ticker: 'JPM', shares: 25, avgCost: 165.0 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const period = searchParams.get('period') || '1y';
  const isSummary = searchParams.get('summary') === 'true';
  const userHoldingsParam = searchParams.get('userHoldings');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const symbols = symbol.split(',').map(s => s.trim()).filter(s => s);
  
  let userHoldings: any[] = [];
  if (userHoldingsParam) {
    try {
      userHoldings = JSON.parse(decodeURIComponent(userHoldingsParam));
    } catch (e) {
      console.error('Failed to parse user holdings');
    }
  }

  if (isSummary && symbols.length > 1) {
    return handlePortfolioSummaryYahoo(symbols, userHoldings);
  }

  let quote: any;
  try {
    quote = await yahooFinance.quote(symbol);
  } catch (quoteError: any) {
    console.error('Quote fetch error:', quoteError);
    return NextResponse.json({ 
      error: `Unable to fetch data for ${symbol}. Please try again.`,
      price: 0,
      symbol: symbol,
      name: symbol,
    }, { status: 200 });
  }

  if (!quote) {
    return NextResponse.json({ 
      error: `No data available for symbol: ${symbol}`,
      price: 0,
      symbol: symbol,
      name: symbol,
    }, { status: 200 });
  }

  const [summaryDetail, quoteSummary] = await Promise.all([
    yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail', 'summaryProfile', 'defaultKeyStatistics', 'financialData', 'earnings', 'calendarEvents'] }).catch(() => ({})),
    yahooFinance.quoteSummary(symbol, { modules: ['price'] }).catch(() => ({})),
  ]);

  const price = quote.regularMarketPrice || quote.price || quote.mainIndexPrice || 0;
  const change = quote.regularMarketChange || quote.change || 0;
  const changePercent = quote.regularMarketChangePercent || quote.changeInPercent || 0;

  const histOptions: any = { period1: getPeriodStart(period), period2: new Date(), interval: '1d' };
  const history = await yahooFinance.historical(symbol, histOptions).catch(() => []) || [];

  const formatNum = (val: any) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return typeof val === 'number' ? val : parseFloat(val);
  };

  const summary = (summaryDetail as any)?.summaryDetail || {};
  const profile = (summaryDetail as any)?.summaryProfile || {};
  const keyStats = (summaryDetail as any)?.defaultKeyStatistics || {};
  const financial = (summaryDetail as any)?.financialData || {};
  const priceInfo = (quoteSummary as any)?.price || {};
  const earnings = (summaryDetail as any)?.earnings || {};
  const calendarEvents = (summaryDetail as any)?.calendarEvents || {};
  
  let nextEarningsDate: string | null = null;
  const earningsChart = earnings?.earningsChart || {};
  if (earningsChart.earningsDate && earningsChart.earningsDate.length > 0) {
    const earningsDate = earningsChart.earningsDate[0];
    if (earningsDate) {
      const date = new Date(earningsDate);
      const now = new Date();
      if (!isNaN(date.getTime()) && date.getTime() > now.getTime()) {
        nextEarningsDate = date.toISOString().split('T')[0];
      }
    }
  }
  
  let exDivDate: string | null = null;
  let dividendPaymentDate: string | null = null;
  let dividendFrequency: string = 'quarterly';
  
  if (calendarEvents.exDividendDate) {
    const exDate = new Date(calendarEvents.exDividendDate);
    if (!isNaN(exDate.getTime())) {
      exDivDate = exDate.toISOString().split('T')[0];
    }
  }
  if (calendarEvents.dividendDate) {
    const payDate = new Date(calendarEvents.dividendDate);
    if (!isNaN(payDate.getTime())) {
      dividendPaymentDate = payDate.toISOString().split('T')[0];
    }
  }
  
  if (summary.dividendFrequency) {
    dividendFrequency = summary.dividendFrequency;
  } else if (summary.dividendYield && summary.dividendRate) {
    const annualRate = summary.dividendRate;
    if (annualRate > 0) {
      const annualPayouts = Math.round(annualRate / (annualRate / 4));
      if (annualPayouts >= 4) dividendFrequency = 'quarterly';
      else if (annualPayouts >= 2) dividendFrequency = 'semi-annual';
      else if (annualPayouts >= 1) dividendFrequency = 'annual';
      else dividendFrequency = 'monthly';
    }
  }
  
  const dividendYield = formatNum(
    summary.dividendYield ? summary.dividendYield * 100 : 
    priceInfo.dividendYield ? priceInfo.dividendYield * 100 :
    keyStats.dividendYield ? keyStats.dividendYield * 100 : null
  );
  
  const dividendRate = formatNum(
    summary.dividendRate ||
    priceInfo.dividendRate ||
    keyStats.dividendRate ||
    quote.dividendRate ||
    0
  );

  return NextResponse.json({
    symbol: symbol,
    name: quote.shortName || quote.longName || priceInfo.shortName || priceInfo.longName || symbol,
    price,
    change,
    changePercent,
    previousClose: quote.previousClose || quote.pc || 0,
    open: quote.regularMarketOpen || quote.open || 0,
    high: quote.regularMarketDayHigh || quote.dayHigh || 0,
    low: quote.regularMarketDayLow || quote.dayLow || 0,
    volume: quote.regularMarketVolume || quote.volume || 0,
    
    marketCap: formatNum(summary.marketCap || priceInfo.marketCap || quote.marketCap),
    peRatio: formatNum(summary.trailingPE || keyStats.trailingPE),
    forwardPE: formatNum(summary.forwardPE),
    pegRatio: formatNum(summary.pegRatio),
    dividendYield,
    dividendRate,
    exDivDate,
    dividendPaymentDate,
    dividendFrequency,
    payoutRatio: formatNum(summary.payoutRatio ? summary.payoutRatio * 100 : null),
    nextEarningsDate,
    
    eps: formatNum(keyStats.epsTrailingTwelveMonths || keyStats.trailingEps),
    epsForward: formatNum(keyStats.epsForward),
    
    fiftyTwoWeekHigh: formatNum(summary.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: formatNum(summary.fiftyTwoWeekLow),
    fiftyTwoWeekChange: formatNum(summary.fiftyTwoWeekChange),
    fiftyDayAverage: formatNum(summary.fiftyDayAverage),
    twoHundredDayAverage: formatNum(summary.twoHundredDayAverage),
    
    priceToBook: formatNum(summary.priceToBook),
    priceToSales: formatNum(summary.priceToSales),
    bookValue: formatNum(keyStats.bookValue),
    
    profitMargin: formatNum(financial.profitMargins ? financial.profitMargins * 100 : null),
    operatingMargin: formatNum(financial.operatingMargins ? financial.operatingMargins * 100 : null),
    returnOnEquity: formatNum(financial.returnOnEquity ? financial.returnOnEquity * 100 : null),
    returnOnAssets: formatNum(financial.returnOnAssets ? financial.returnOnAssets * 100 : null),
    
    revenueGrowth: formatNum(keyStats.revenueGrowth ? keyStats.revenueGrowth * 100 : null),
    revenue: formatNum(summary.revenue || financial.totalRevenue),
    grossProfit: formatNum(financial.grossProfits),
    ebitda: formatNum(financial.ebitda),
    
    beta: formatNum(keyStats.beta),
    averageVolume: formatNum(summary.averageVolume),
    averageVolume10Day: formatNum(summary.averageVolume10Day),
    
    sector: profile.sector || null,
    industry: profile.industry || null,
    website: profile.website || null,
    description: profile.longBusinessSummary || null,
    employees: profile.fullTimeEmployees ? parseInt(profile.fullTimeEmployees) : null,
    phone: profile.phone || null,
    city: profile.city || null,
    state: profile.state || null,
    country: profile.country || null,
    currency: quote.currency || 'USD',
    exchange: quote.exchange || null,
    ipo: profile.ipoDate || null,
    
    history: history.map((h: any) => ({
      date: h.date.toISOString(),
      close: h.close,
      open: h.open,
      high: h.high,
      low: h.low,
      volume: h.volume,
    })).reverse(),
  });
}

async function handlePortfolioSummaryYahoo(symbols: string[], userHoldings: any[] = []) {
  try {
    const indexSymbols = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^COMP'];
    const userTickers = new Set(userHoldings.map((h: any) => h.ticker));
    const defaultHoldings = DEFAULT_HOLDINGS.filter(h => !userTickers.has(h.ticker));
    
    const indexHoldings = indexSymbols
      .filter(s => symbols.includes(s))
      .map(s => ({ ticker: s, shares: 0, avgCost: 0 }));
    
    const allHoldings = [...userHoldings, ...defaultHoldings, ...indexHoldings];
    
    const allSymbols = [...new Set([...symbols, ...userHoldings.map((h: any) => h.ticker)])];
    
    const results = await Promise.all(
      allSymbols.map(async (s) => {
        try {
          const [quote, summaryDetail] = await Promise.all([
            yahooFinance.quote(s),
            yahooFinance.quoteSummary(s, { modules: ['summaryDetail', 'summaryProfile', 'earnings', 'calendarEvents'] }).catch(() => ({})),
          ]);
          const holding = allHoldings.find((h: any) => h.ticker === s);
          if (!holding) return null;
          
          const quoteData = quote as any;
          const price = quoteData.regularMarketPrice || 0;
          const change = quoteData.regularMarketChange || 0;
          const changePercent = quoteData.regularMarketChangePercent || 0;
          
          const isIndex = holding.shares === 0;
          const value = isIndex ? 0 : holding.shares * price;
          const cost = isIndex ? 0 : holding.shares * holding.avgCost;
          
          const summary = (summaryDetail as any)?.summaryDetail || {};
          const profile = (summaryDetail as any)?.summaryProfile || {};
          const earnings = (summaryDetail as any)?.earnings || {};
          const calendarEvents = (summaryDetail as any)?.calendarEvents || {};
          
          const earningsChart = earnings?.earningsChart || {};
          
          let nextEarningsDate = '-';
          if (earningsChart.earningsDate && earningsChart.earningsDate.length > 0) {
            const earningsDate = earningsChart.earningsDate[0];
            if (earningsDate) {
              const date = new Date(earningsDate);
              const now = new Date();
              if (!isNaN(date.getTime()) && date.getTime() > now.getTime()) {
                nextEarningsDate = date.toISOString().split('T')[0];
              }
            }
          }
          
          let exDivDate = '-';
          let dividendPaymentDate = '-';
          let dividendFrequency = 'quarterly';
          
          if (calendarEvents.exDividendDate) {
            const date = new Date(calendarEvents.exDividendDate);
            if (!isNaN(date.getTime())) {
              exDivDate = date.toISOString().split('T')[0];
            }
          }
          if (calendarEvents.dividendDate) {
            const date = new Date(calendarEvents.dividendDate);
            if (!isNaN(date.getTime())) {
              dividendPaymentDate = date.toISOString().split('T')[0];
            }
          }
          
          if (summary.dividendFrequency) {
            dividendFrequency = summary.dividendFrequency;
          }
          
          const sector = profile.sector || 
                        quoteData.sector || 
                        'Other';
          
          const formatNum = (val: any) => {
            if (val === null || val === undefined || isNaN(val)) return 0;
            return typeof val === 'number' ? val : parseFloat(val);
          };
          
          return {
            id: s,
            ticker: s,
            name: quoteData.shortName || s,
            shares: holding.shares,
            avgCost: holding.avgCost,
            currentPrice: price,
            change,
            changePercent,
            totalValue: value,
            totalGain: value - cost,
            totalGainPercent: cost > 0 ? ((value - cost) / cost) * 100 : 0,
            peRatio: formatNum(summary.trailingPE),
            dividendYield: formatNum(summary.dividendYield ? summary.dividendYield * 100 : 0),
            dividendRate: formatNum(summary.dividendRate),
            exDivDate,
            dividendPaymentDate,
            dividendFrequency,
            nextEarningsDate,
            sector,
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validHoldings = results.filter(Boolean);
    const totalValue = validHoldings.reduce((sum, h) => sum + (h?.totalValue || 0), 0);
    const totalCost = validHoldings.reduce((sum, h) => sum + ((h?.shares || 0) * (h?.avgCost || 0)), 0);
    const dayPL = validHoldings.reduce((sum, h) => sum + ((h?.change || 0) * (h?.shares || 0)), 0);
    const allTimePL = totalValue - totalCost;

    return NextResponse.json({
      holdings: validHoldings,
      summary: {
        totalValue,
        dayPL,
        dayPLPercent: totalValue > 0 ? (dayPL / (totalValue - dayPL)) * 100 : 0,
        weekPL: dayPL * 1.5,
        weekPLPercent: ((dayPL * 1.5) / (totalValue - dayPL * 1.5)) * 100,
        allTimePL,
        allTimePLPercent: totalCost > 0 ? (allTimePL / totalCost) * 100 : 0,
      },
    });
  } catch (error: any) {
    console.error('Portfolio summary error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1mo': return new Date(now.setMonth(now.getMonth() - 1));
    case '3mo': return new Date(now.setMonth(now.getMonth() - 3));
    case '6mo': return new Date(now.setMonth(now.getMonth() - 6));
    case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
    case '2y': return new Date(now.setFullYear(now.getFullYear() - 2));
    case '5y': return new Date(now.setFullYear(now.getFullYear() - 5));
    default: return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}