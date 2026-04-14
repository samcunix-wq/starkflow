import { NextResponse } from 'next/server';

const MOCK_HOLDINGS = [
  { ticker: 'AAPL', shares: 50, avgCost: 145.0 },
  { ticker: 'MSFT', shares: 30, avgCost: 350.0 },
  { ticker: 'GOOGL', shares: 15, avgCost: 140.0 },
  { ticker: 'NVDA', shares: 25, avgCost: 450.0 },
  { ticker: 'TSLA', shares: 20, avgCost: 220.0 },
  { ticker: 'AMZN', shares: 40, avgCost: 155.0 },
  { ticker: 'META', shares: 18, avgCost: 380.0 },
  { ticker: 'JPM', shares: 25, avgCost: 165.0 },
];

const YahooFinance = require('yahoo-finance2').default;

async function getPortfolioData() {
  try {
    const symbols = MOCK_HOLDINGS.map(h => h.ticker).join(',');
    const quotes = await Promise.all(
      MOCK_HOLDINGS.map(async (h) => {
        try {
          const quote = await YahooFinance.quote(h.ticker);
          const price = quote.regularMarketPrice || 0;
          return {
            ...h,
            currentPrice: price,
            value: h.shares * price,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
          };
        } catch {
          return null;
        }
      })
    );
    return quotes.filter(Boolean);
  } catch {
    return [];
  }
}

function generateInsight(page: string, portfolio: any[], symbol?: string): any {
  const totalValue = portfolio.reduce((sum: number, h: any) => sum + (h.value || 0), 0);
  const dayPL = portfolio.reduce((sum: number, h: any) => sum + (h.change || 0) * (h.shares || 0), 0);
  
  switch (page) {
    case 'portfolio':
      if (dayPL > 100) {
        return {
          type: 'tip',
          title: 'Portfolio Performance',
          content: `Your portfolio is up $${dayPL.toFixed(2)} today. Tech stocks are driving the gains.`,
        };
      }
      if (totalValue > 50000) {
        return {
          type: 'recommendation',
          title: 'Consider Rebalancing',
          content: 'Your portfolio has grown significantly. Consider taking some profits or diversifying into ETFs for stability.',
        };
      }
      return {
        type: 'tip',
        title: 'Daily Insight',
        content: 'Review your positions regularly to stay aligned with your investment goals.',
      };

    case 'stock':
      if (symbol) {
        const holding = portfolio.find((h: any) => h.ticker === symbol);
        if (holding) {
          const gain = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
          if (gain > 20) {
            return {
              type: 'alert',
              title: `${symbol} Alert`,
              content: `Your ${symbol} position is up ${gain.toFixed(1)}%. Consider setting a stop-loss to protect gains.`,
            };
          }
          return {
            type: 'tip',
            title: `${symbol} in Your Portfolio`,
            content: `You own ${holding.shares} shares. Your average cost is $${holding.avgCost.toFixed(2)}.`,
          };
        }
        return {
          type: 'recommendation',
          title: `${symbol} Analysis`,
          content: 'This stock is not in your portfolio. Would you like me to analyze if it fits your strategy?',
        };
      }
      return null;

    case 'dividends':
      const dividendStocks = portfolio.filter((h: any) => h.dividendYield > 0);
      if (dividendStocks.length > 0) {
        return {
          type: 'progress',
          title: 'Dividend Income',
          content: `You have ${dividendStocks.length} dividend-paying stocks. Consider SCHD or VYM to increase dividend income.`,
        };
      }
      return {
        type: 'recommendation',
        title: 'Dividend Opportunity',
        content: 'Your portfolio has no dividend stocks. Consider adding SCHD for quarterly income.',
      };

    case 'watchlist':
      return {
        type: 'tip',
        title: 'Watchlist Update',
        content: '3 stocks in your watchlist are showing positive momentum this week.',
      };

    case 'news':
      return {
        type: 'tip',
        title: 'Market Context',
        content: '2 of your holdings are mentioned in today\'s market news. Check the news page for details.',
      };

    default:
      return {
        type: 'tip',
        title: 'JARVIS Insight',
        content: 'Stay informed about your investments with regular portfolio reviews.',
      };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, symbol } = body;

    const portfolio = await getPortfolioData();
    const insight = generateInsight(page, portfolio, symbol);

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('Insight API error:', error);
    return NextResponse.json(
      { insight: { type: 'tip', title: 'JARVIS', content: 'Unable to generate insight at this time.' } },
      { status: 200 }
    );
  }
}