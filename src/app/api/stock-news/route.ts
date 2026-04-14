import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const DEFAULT_MARKET_NEWS = [
  { title: 'Stock Market Shows Strong Momentum Amid Tech Rally', link: 'https://www.reuters.com/markets/us/social-sentiment-stockrally-2024-01-15/', source: 'Reuters', published: '1 hour ago' },
  { title: 'Federal Reserve Signals Interest Rate Stability', link: 'https://www.reuters.com/markets/us/fed-signals-rate-stable-2024-01-15/', source: 'Reuters', published: '3 hours ago' },
  { title: 'Global Markets React to Economic Data and Corporate Earnings', link: 'https://www.bloomberg.com/markets/stocks', source: 'Bloomberg', published: '5 hours ago' },
  { title: 'Institutional Investors Increase Positions in Growth Stocks', link: 'https://www.cnbc.com/2024/01/15/institutional-investors-growth-stocks.html', source: 'CNBC', published: '7 hours ago' },
  { title: 'Technology Sector Leads Market Gains This Quarter', link: 'https://www.wsj.com/livecoverage/stock-market-today-2024-01-15', source: 'WSJ', published: '1 day ago' },
  { title: 'Analysts Predict Strong Q4 Earnings Season Ahead', link: 'https://www.marketwatch.com/investing/stocks/earnings', source: 'MarketWatch', published: '1 day ago' },
  { title: 'Market Volatility Decreases as Investor Sentiment Improves', link: 'https://www.ft.com/markets/stocks', source: 'Financial Times', published: '2 days ago' },
  { title: 'Global Economic Outlook Remains Positive Despite Headwinds', link: 'https://www.economist.com/business/2024/01/15/global-economic-outlook', source: 'Economist', published: '2 days ago' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const category = searchParams.get('category') || 'portfolio';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  if (category === 'market' || symbol === 'GENERAL') {
    if (FINNHUB_API_KEY) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
        );
        
        if (res.ok) {
          const data = await res.json();
          
          if (Array.isArray(data) && data.length > 0) {
            const news = data.slice(0, 20).map((article: any) => ({
              title: article.headline,
              link: article.url,
              source: article.source || 'Finnhub',
              published: article.datetime ? getRelativeTime(new Date(article.datetime * 1000)) : 'Recently',
              summary: article.summary,
            }));
            return NextResponse.json({ news });
          }
        }
      } catch (error) {
        console.error('Finnhub Market News API error:', error);
      }
    }
    
    const enrichedNews = DEFAULT_MARKET_NEWS.map(item => ({
      ...item,
      published: item.published,
    }));
    return NextResponse.json({ news: enrichedNews, isMock: true });
  }

  const symbols = symbol.split(',').map(s => s.trim()).filter(Boolean);
  
  if (FINNHUB_API_KEY) {
    try {
      const today = new Date();
      const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      const allNews: any[] = [];
      
      for (const sym of symbols.slice(0, 8)) {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`
          );
          
          if (res.ok) {
            const data = await res.json();
            
            if (Array.isArray(data) && data.length > 0) {
              const newsForSymbol = data.slice(0, 5).map((article: any) => ({
                title: article.headline,
                link: article.url,
                source: article.source || 'Finnhub',
                published: getRelativeTime(new Date(article.datetime * 1000)),
                summary: article.summary,
                symbol: sym,
              }));
              allNews.push(...newsForSymbol);
            }
          }
        } catch (e) {
          console.error(`Failed to fetch news for ${sym}:`, e);
        }
      }
      
      if (allNews.length > 0) {
        allNews.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        return NextResponse.json({ news: allNews.slice(0, 20) });
      }
    } catch (error) {
      console.error('Finnhub News API error:', error);
    }
  }

  const enrichedNews = symbols.slice(0, 4).map(sym => ({
    title: `${sym} Reports Quarterly Earnings`,
    link: `https://finance.yahoo.com/quote/${sym}`,
    source: 'Reuters',
    published: '1 day ago',
    summary: `${sym} latest earnings report shows strong performance`,
    symbol: sym,
  }));

  return NextResponse.json({ news: enrichedNews, isMock: true });
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}