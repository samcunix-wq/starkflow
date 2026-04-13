import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const summary = searchParams.get('summary');
  const userHoldingsJson = searchParams.get('userHoldings');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  try {
    const symbols = symbol.split(',').map(s => s.trim().toUpperCase());
    const results: any[] = [];

    for (const sym of symbols.slice(0, 50)) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const result = data?.chart?.result?.[0];

        if (result) {
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0];
          
          const currentPrice = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
          const change = currentPrice - previousClose;
          const changePercent = previousClose ? ((change / previousClose) * 100) : 0;

          let peRatio = null;
          let dividendYield = null;
          let dividendRate = null;

          try {
            const infoUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${sym}?modules=summaryDetail,defaultKeyStatistics`;
            const infoResponse = await fetch(infoUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            if (infoResponse.ok) {
              const infoData = await infoResponse.json();
              const summaryDetail = infoData?.quoteSummary?.result?.[0]?.summaryDetail;
              
              peRatio = summaryDetail?.trailingPE?.raw || null;
              dividendYield = summaryDetail?.dividendYield?.raw ? summaryDetail.dividendYield.raw * 100 : null;
              dividendRate = summaryDetail?.dividendRate?.raw || null;
            }
          } catch (e) {}

          const stockData: any = {
            symbol: sym,
            name: meta.shortName || meta.symbol || sym,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            previousClose: previousClose,
            open: meta.regularMarketOpen || 0,
            high: meta.regularMarketDayHigh || 0,
            low: meta.regularMarketDayLow || 0,
            volume: meta.regularMarketVolume || 0,
            marketCap: meta.marketCap || 0,
            peRatio: peRatio,
            dividendYield: dividendYield,
            dividendRate: dividendRate,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
            yearToDateChange: meta.ytdRange ? (currentPrice - meta.ytdRange.start) / meta.ytdRange.start * 100 : 0
          };

          if (userHoldingsJson && summary === 'true') {
            try {
              const userHoldings = JSON.parse(decodeURIComponent(userHoldingsJson));
              const userHolding = userHoldings.find((h: any) => h.ticker === sym);
              
              if (userHolding) {
                stockData.userHolding = {
                  shares: userHolding.shares,
                  avgCost: userHolding.avgCost,
                  totalCost: userHolding.shares * userHolding.avgCost,
                  currentValue: userHolding.shares * currentPrice,
                  gain: (currentPrice - userHolding.avgCost) * userHolding.shares,
                  gainPercent: ((currentPrice - userHolding.avgCost) / userHolding.avgCost) * 100
                };
              }
            } catch (e) {}
          }

          results.push(stockData);
        }
      } catch (e) {
        console.error(`Error fetching ${sym}:`, e);
      }
    }

    if (summary === 'true' && results.length > 0) {
      let holdings = [];
      try {
        if (userHoldingsJson) {
          holdings = JSON.parse(decodeURIComponent(userHoldingsJson));
        }
      } catch (e) {}

      const holdingsWithPrices = holdings.map((h: any) => {
        const priceData = results.find(r => r.symbol === h.ticker);
        const currentPrice = priceData?.price || h.currentPrice || h.avgCost;
        
        return {
          ...h,
          currentPrice: currentPrice,
          change: priceData?.change || 0,
          changePercent: priceData?.changePercent || 0,
          totalValue: h.shares * currentPrice,
          totalGain: (currentPrice - h.avgCost) * h.shares,
          totalGainPercent: ((currentPrice - h.avgCost) / h.avgCost) * 100
        };
      }).filter((h: any) => h.shares > 0);

      return NextResponse.json({ 
        holdings: holdingsWithPrices,
        marketData: results
      });
    }

    return NextResponse.json(results.length === 1 ? results[0] : results);
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
