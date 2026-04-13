import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=calendarEvents,summaryDetail,defaultKeyStatistics`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ dividends: [] });
    }

    const data = await response.json();
    const result = data?.quoteSummary?.result?.[0];
    
    if (!result) {
      return NextResponse.json({ dividends: [] });
    }

    const dividends: any[] = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      dividends.push({
        date: futureDate.toISOString().split('T')[0],
        ticker: ticker.toUpperCase(),
        amount: result.summaryDetail?.dividendRate?.raw || 0,
        yield: result.summaryDetail?.dividendYield?.raw * 100 || 0
      });
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      dividendRate: result.summaryDetail?.dividendRate?.raw || 0,
      dividendYield: result.summaryDetail?.dividendYield?.raw * 100 || 0,
      exDividendDate: result.calendarEvents?.exDividendDate?.raw 
        ? new Date(result.calendarEvents.exDividendDate.raw * 1000).toISOString().split('T')[0]
        : null,
      dividends
    });
  } catch (error) {
    console.error('Dividends API error:', error);
    return NextResponse.json({ dividends: [] });
  }
}
