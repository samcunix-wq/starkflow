import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,summaryProfile`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    const profile = data?.quoteSummary?.result?.[0]?.assetProfile;
    
    if (!profile) {
      return NextResponse.json([]);
    }

    const sector = profile.sector || 'Unknown';
    const industry = profile.industry || 'Unknown';

    const relatedQuery = `${sector} stocks`;
    const relatedResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(relatedQuery)}&quotesCount=6&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    let related = [];
    if (relatedResponse.ok) {
      const relatedData = await relatedResponse.json();
      related = (relatedData.quotes || [])
        .filter((q: any) => q.symbol !== symbol && q.quoteType === 'EQUITY')
        .slice(0, 5)
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          sector: sector,
          industry: industry
        }));
    }

    return NextResponse.json({
      sector,
      industry,
      related,
      website: profile.website,
      description: profile.longBusinessSummary?.substring(0, 500)
    });
  } catch (error) {
    console.error('Related stocks error:', error);
    return NextResponse.json({ related: [] });
  }
}
