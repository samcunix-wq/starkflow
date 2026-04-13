import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'general';
  const category = searchParams.get('category') || 'market';

  try {
    const symbols = symbol.split(',').map(s => s.trim());
    
    const news: any[] = [];
    
    for (const sym of symbols.slice(0, 5)) {
      try {
        const response = await fetch(
          `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sym)}&newsCount=5&enableFuzzyQuery=false`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          (data.news || []).forEach((item: any) => {
            if (item.title && !news.find(n => n.title === item.title)) {
              news.push({
                title: item.title,
                source: item.publisher || 'Unknown',
                published: item.publishedAt || new Date().toISOString(),
                symbol: sym !== 'general' ? sym : item.relatedTickers?.[0] || null,
                summary: item.title,
                link: item.link || item.url
              });
            }
          });
        }
      } catch (e) {}
    }

    if (news.length === 0) {
      return NextResponse.json({
        news: [
          {
            title: 'Market Update',
            source: 'Financial News',
            published: new Date().toISOString(),
            symbol: null,
            summary: 'Check back for latest market news and updates.',
            link: '#'
          }
        ]
      });
    }

    return NextResponse.json({ news });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ news: [] });
  }
}
