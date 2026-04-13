import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '1y';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const rangeMap: Record<string, string> = {
    '1m': '1mo',
    '3m': '3mo',
    '6m': '6mo',
    '1y': '1y',
    'all': '5y'
  };

  const intervalMap: Record<string, string> = {
    '1m': '1d',
    '3m': '1d',
    '6m': '1wk',
    '1y': '1wk',
    'all': '1mo'
  };

  const period = rangeMap[range] || '1y';
  const interval = intervalMap[range] || '1d';

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || quotes.close;

    const prices = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      price: adjClose[i] || quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0
    })).filter((p: any) => p.price !== null && p.price !== undefined);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      range,
      prices
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
