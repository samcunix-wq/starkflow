import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const CACHE_DURATION = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  if (!startDate) {
    return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
  }

  try {
    const [priceHistory, dividends, splits, quote] = await Promise.all([
      yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      }).catch(() => []),
      yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
        events: 'dividends',
      }).catch(() => []),
      yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
        events: 'split',
      }).catch(() => []),
      yahooFinance.quote(symbol).catch(() => null),
    ]);

    const adjustedHistory = applySplitsAndDividends(priceHistory, splits, dividends, startDate);
    
    const totalDividends = dividends.reduce((sum: number, d: any) => sum + d.dividends, 0);
    const currentPrice = quote?.regularMarketPrice || priceHistory[priceHistory.length - 1]?.close || 0;
    const startPrice = priceHistory[0]?.adjClose || priceHistory[0]?.close || 0;

    return NextResponse.json({
      symbol,
      name: quote?.shortName || quote?.longName || symbol,
      currentPrice,
      startPrice,
      startDate,
      endDate,
      priceHistory: adjustedHistory.map((h: any) => ({
        date: h.date.toISOString(),
        price: h.adjClose || h.close,
        close: h.close,
      })),
      dividends: dividends.map((d: any) => ({
        date: d.date.toISOString(),
        amount: d.dividends,
      })),
      splits: splits.map((s: any) => ({
        date: s.date.toISOString(),
        ratio: s.stockSplits,
      })),
      summary: {
        totalDividends,
        dividendCount: dividends.length,
        totalReturn: startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0,
        priceReturn: currentPrice - startPrice,
      },
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error: any) {
    console.error('Simulator historical error:', error);
    return NextResponse.json(
      { error: `Failed to fetch historical data: ${error.message}` },
      { status: 500 }
    );
  }
}

function applySplitsAndDividends(
  history: any[],
  splits: any[],
  dividends: any[],
  startDate: string
): any[] {
  if (!history.length) return [];

  const adjustedHistory = history.map(h => ({
    ...h,
    adjClose: h.adjClose || h.close,
  }));

  const splitMap = new Map<string, number>();
  splits.forEach(split => {
    const dateStr = split.date.toISOString().split('T')[0];
    const [before, after] = split.stockSplits.split(':').map(Number);
    const ratio = after / before;
    splitMap.set(dateStr, ratio);
  });

  const dividendSet = new Set<string>();
  dividends.forEach(d => {
    dividendSet.add(d.date.toISOString().split('T')[0]);
  });

  let cumulativeSplit = 1;
  const startTime = new Date(startDate).getTime();

  for (let i = 0; i < adjustedHistory.length; i++) {
    const dateStr = adjustedHistory[i].date.toISOString().split('T')[0];
    
    if (splitMap.has(dateStr)) {
      cumulativeSplit *= splitMap.get(dateStr)!;
    }

    if (adjustedHistory[i].date.getTime() >= startTime) {
      adjustedHistory[i].adjClose = (adjustedHistory[i].close || adjustedHistory[i].adjClose) * cumulativeSplit;
    }
  }

  return adjustedHistory;
}
