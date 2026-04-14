import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const SECTOR_STOCKS: Record<string, string[]> = {
  'Technology': ['MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'CSCO', 'ACN', 'IBM', 'INTC', 'AMD', 'QCOM', 'TXN', 'NOW', 'INTU', 'SNPS', 'CDNS', 'PANW', 'CRWD', 'FTNT', 'NET', 'ZS', 'DDOG', 'SNOW', 'MU', 'LRCX', 'KLAC', 'AMAT'],
  'Financial Services': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP', 'PYPL', 'SQ', 'COIN', 'AFRM', 'HOOD', 'BLK', 'SCHW', 'AXS', 'C', 'USB', 'PNC', 'TFC', 'COF', 'DFS', 'SYF', 'ALL', 'MET', 'PRU', 'L', 'AIG', 'TRV', 'CINF'],
  'Healthcare': ['UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'BMY', 'LLY', 'AMGN', 'GILD', 'BIIB', 'REGN', 'VRTX', 'GNE', 'BIVI', 'INCY', 'MRNA', 'ISRG', 'MDT', 'SYK', 'ABT', 'BSX', 'EW', 'ZTS', 'HUM', 'CNC', 'CI', 'HCA', 'DVA', 'UHS', 'MOH'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'LOW', 'NKE', 'MCD', 'SBUX', 'UBER', 'DASH', 'ABNB', 'BKNG', 'MAR', 'HLT', 'YUM', 'CMG', 'DPZ', 'GM', 'F', 'RIVN', 'LCID', 'NIO', 'ROST', 'DG', 'DLTR', 'BBY', 'ORLY', 'AZO', 'TSCO', 'ULTA', 'LULU'],
  'Consumer Defensive': ['PG', 'KO', 'PEP', 'WMT', 'COST', 'TGT', 'MDLZ', 'GIS', 'KMB', 'CL', 'K', 'HSY', 'KMB', 'SYY', 'ADM', 'TSN', 'BG', 'CF', 'MOS', 'FMC', 'DE', 'AGCO', 'CAT', 'HON', 'EMR', 'ROK', 'PH', 'ITW', 'ETN', 'EIX'],
  'Communication Services': ['GOOGL', 'META', 'DIS', 'NFLX', 'VZ', 'T', 'CMCSA', 'WBD', 'PARA', 'SNAP', 'PINS', 'TWTR', 'MTCH', 'LYV', 'WMG', 'SIRI', 'OMC', 'IPG', 'CAI', 'PLAY', 'RBLX', 'EA', 'TTWO', 'ATVI', 'UBSFY'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY', 'HAL', 'BKR', 'SLB', 'DVN', 'FANG', 'MRO', 'APA', 'HES', 'CTRA', 'OKE', 'WMB', 'KMI', 'ET', 'EPD', 'MPLX', 'BPL', 'TRGP', 'LNG', 'CEQP'],
  'Industrials': ['CAT', 'DE', 'BA', 'HON', 'UNP', 'RTX', 'LMT', 'GE', 'MMM', 'UPS', 'FDX', 'CSX', 'NSC', 'GD', 'NOC', 'LHX', 'TXT', 'HII', 'LDOS', 'SAIC', 'CARR', 'OTIS', 'URI', 'PCAR', 'CMI', 'ROK', 'PH', 'ITW', 'EMR', 'DOV'],
  'Real Estate': ['O', 'PLD', 'AMT', 'CCI', 'EQIX', 'PSA', 'AVB', 'EQR', 'WELL', 'SPG', 'DLR', 'VTR', 'ARE', 'SBAC', 'EXR', 'WY', 'NLY', 'AGNC', 'RITH', 'CSG', 'IRM', 'ESS', 'MAA', 'UDR', 'KIM', 'REG', 'CPT', 'SUI', 'ELS'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'ED', 'PEG', 'AEE', 'ES', 'EIX', 'DTE', 'DUK', 'GPC', 'EVRG', 'CNP', 'CMS', 'AWK', 'NI', 'AOS', 'AWK', 'WEC', 'ATO', 'CMS', 'D', 'PCG', 'PPL', 'FE'],
  'Materials': ['LIN', 'APD', 'SHW', 'ECL', 'NEM', 'FCX', 'NUE', 'DOW', 'DD', 'PPG', 'ALB', 'CE', 'CTVA', 'FMC', 'IFF', 'MLM', 'VMC', 'MLM', 'NEM', 'AEM', 'GOLD', 'KGC', 'PAAS', 'WPM', 'S洋', 'NG', 'CCJ', 'UEC', 'DNN'],
};

const CACHE_DURATION = 60;

function cachedResponse(data: any) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const limit = parseInt(searchParams.get('limit') || '6');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const [quote, summaryDetail] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile'] }).catch(() => ({})),
    ]);

    const profile = (summaryDetail as any)?.summaryProfile || {};
    const sector = profile.sector || quote.sector || null;
    const industry = profile.industry || quote.industry || null;

    if (!sector) {
      return cachedResponse({ related: [], sector, industry });
    }

    const sectorStocks = SECTOR_STOCKS[sector] || [];
    const otherStocks = sectorStocks.filter(s => s !== symbol).slice(0, limit + 10);

    const stockChunks = [];
    for (let i = 0; i < otherStocks.length; i += 10) {
      stockChunks.push(otherStocks.slice(i, i + 10));
    }

    const results = await Promise.all(
      stockChunks.map(chunk => 
        Promise.all(
          chunk.map(async (ticker) => {
            try {
              const q = await yahooFinance.quote(ticker);
              return {
                ticker,
                name: q.shortName || q.longName || ticker,
                price: q.regularMarketPrice || 0,
                change: q.regularMarketChange || 0,
                changePercent: q.regularMarketChangePercent || 0,
                sector,
                industry,
              };
            } catch {
              return null;
            }
          })
        )
      )
    );

    const allRelated = results.flat().filter(Boolean).slice(0, limit);

    return cachedResponse({
      related: allRelated,
      sector,
      industry,
      currentSymbol: symbol,
    });
  } catch (error: any) {
    console.error('Related stocks error:', error);
    return NextResponse.json(
      { error: `Failed to fetch related stocks: ${error.message}` },
      { status: 500 }
    );
  }
}
