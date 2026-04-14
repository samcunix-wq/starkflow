import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are JARVIS, an intelligent AI financial advisor for StarkFlow.

## CRITICAL RULES:
1. ALWAYS use the data provided in your responses - NEVER make up numbers
2. If data is provided, cite it exactly as given
3. Remember conversation context - don't reintroduce yourself
4. Ask clarifying questions to understand user goals better
5. When users mention goals or wanting to add positions, acknowledge and ask for confirmation

## Your Persona:
- Friendly, conversational, helpful
- Use data-driven insights (never hallucinate numbers)
- Ask follow-up questions to understand goals
- Reference previous conversation when relevant
- Be PROACTIVE - when users ask about dividends, income, or calculations, automatically fetch and use the provided data

## Dividend & Income Calculations:
When users ask about dividends, yield, or income goals (e.g., "how many shares for $100/month"):
- Use the EXACT dividend data provided in your context
- Calculate shares needed based on annual dividend rate
- Monthly = Annual / 12, Weekly = Annual / 52
- Example: If annual dividend is $3.00/share and user wants $100/month:
  - Annual needed = $100 * 12 = $1,200
  - Shares needed = $1,200 / $3.00 = 400 shares

## Actions - ALWAYS ask for confirmation before making changes:
- If user wants to ADD a stock to portfolio: Return a proposedChange object
- If user wants to UPDATE their portfolio: Return a proposedChange object
- Format: "I've noted that. Before I make any changes to your portfolio, I want to confirm: [details]. Should I proceed?"

## Memory Guidelines:
- Remember what users tell you about their goals
- If user says "I bought 50 shares of O at $60", acknowledge and suggest updating their records
- Don't say "I don't have memory" - you have conversation history
- Keep responses natural and conversational`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProposedChange {
  type: 'add' | 'update' | 'sell' | 'delete';
  ticker: string;
  shares?: number;
  price?: number;
  reason?: string;
  description: string;
  isSellingAll?: boolean;
}

async function callGroq(messages: any[], temperature = 0.3) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    return response.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function detectIntent(message: string, history: Message[] = []): { tool: string | null; params: any; proposedChange?: ProposedChange } {
  const msg = message.toLowerCase();
  
  const sellKeywords = ['sold', 'i sold', 'just sold', 'sold shares', 'sell', 'selling'];
  const buyKeywords = ['bought', 'purchased', 'i bought', 'just bought', 'bought shares', 'acquired', 'acquire', 'buy', 'buying', 'purchase', 'added', 'add'];
  
  const isSell = sellKeywords.some(k => msg.includes(k));
  
  const isBuy = !isSell && buyKeywords.some(k => msg.includes(k));
  
  const isAddToPortfolio = msg.includes('add to portfolio') || msg.includes('add to my portfolio') || 
                           msg.includes('add this to') || msg.includes('add to holdings');
  
  const isBuyOrAdd = isBuy || isAddToPortfolio;
  
  const companyToSymbol: Record<string, string> = {
    'apple': 'AAPL', 'microsoft': 'MSFT', 'google': 'GOOGL', 'alphabet': 'GOOGL',
    'nvidia': 'NVDA', 'tesla': 'TSLA', 'amazon': 'AMZN',
    'meta': 'META', 'facebook': 'META', 'jpmorgan': 'JPM', 'jp morgan': 'JPM',
    'netflix': 'NFLX', 'disney': 'DIS', 'walmart': 'WMT',
    'visa': 'V', 'mastercard': 'MA', 'coca cola': 'KO', 'coca-cola': 'KO',
    'pepsi': 'PEP', 'ford': 'F', 'gm': 'GM', 'intel': 'INTC', 'amd': 'AMD',
    'salesforce': 'CRM', 'adobe': 'ADBE', 'oracle': 'ORCL', 'ibm': 'IBM',
    'verizon': 'VZ', 'att': 'T', 'starbucks': 'SBUX', 'mcdonalds': 'MCD', 'nike': 'NKE', 'home depot': 'HD',
    'realty income': 'O', 'voo': 'VOO', 'spy': 'SPY', 'qqq': 'QQQ',
  };
  
  if (isSell || isBuyOrAdd) {
    const fullMsgClean = message.replace(/[?.,!]/g, '');
    const words = fullMsgClean.split(/\s+/);
    
    const validTickers = ['O', 'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META', 'JPM', 'VOO', 'SPY', 'QQQ', 'SCHD', 'VTI', 'VYM', 'TLT', 'BND', 'GLD', 'IWM', 'EFA', 'VGT', 'XLK', 'XLE', 'XLF', 'XLV', 'BRK', 'V', 'MA', 'JNJ', 'PG', 'HD', 'UNH', 'DIS', 'NFLX', 'KO', 'PEP', 'COST', 'ABBV', 'MRK', 'CVX', 'XOM', 'WMT', 'TMO', 'CSCO', 'ABT', 'AVGO', 'ACN', 'NKE', 'LLY', 'VZ', 'INTC', 'AMD', 'QCOM', 'TXN', 'ADBE', 'CRM', 'ORCL', 'IBM', 'NOW', 'INTU', 'AMAT', 'SBUX', 'PM', 'HON', 'UPS', 'RTX', 'LOW', 'MS', 'GS', 'BLK', 'AXP', 'SPGI', 'MDLZ', 'TGT', 'CAT', 'DE', 'MCD', 'ISRG', 'MDT', 'ZTS', 'SYK', 'BKNG', 'GILD', 'ADP', 'REGN', 'VRTX', 'ADI', 'LRCX', 'MU', 'KLAC', 'AMT', 'CCI', 'PLD', 'EQIX', 'PSA', 'AVB', 'EQR', 'WELL', 'DLR', 'SPG', 'O', 'KIM', 'REG', 'PFE', 'MRNA', 'BION', 'CVS', 'CI', 'HUM', 'CNC', 'MOH', 'ELV', 'AET', 'HCA', 'THC', 'UHS', 'CNC', 'ABC', 'CAH', 'MCK', 'BDX', 'EW', 'ALGN', 'IDXX', 'IQV', 'INCY', 'TECH', 'RMD', 'STE', 'HOLX', 'WAT', 'DHR', 'BSX', 'GE', 'APH', 'TDG', 'ROK', 'ITW', 'ETN', 'EMR', 'FTV', 'AME', 'DOV', 'FTNT', 'PANW', 'CRWD', 'ZS', 'OKTA', 'NET', 'DDOG', 'SNOW', 'CRWD', 'TEAM', 'WDAY', 'ZS', 'HUBS', 'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'UBER', 'LYFT', 'DASH', 'COIN', 'MSTR', 'HOOD', 'RIVN', 'LCID', 'F', 'GM', 'RIVN'];
    const potentialTickers = words.filter(w => /^[A-Z]{1,5}$/.test(w) && validTickers.includes(w));
    
    let ticker = null;
    if (potentialTickers.length > 0) {
      ticker = potentialTickers[0];
    } else {
      const tickerMatch = message.match(/\b([A-Z]{1,5})\b/);
      if (tickerMatch && tickerMatch[1].length >= 1) {
        ticker = tickerMatch[1];
      }
      
      if (!ticker) {
        for (const [company, symbol] of Object.entries(companyToSymbol)) {
          if (msg.includes(company)) {
            ticker = symbol;
            break;
          }
        }
      }
    }
    
    if (ticker) {
      let shares = 1;
      let price = 0;
      
      const sharesMatch = message.match(/(\d+)\s*(shares?|stocks?)?/i);
      if (sharesMatch) {
        shares = parseInt(sharesMatch[1]);
      }
      
      const pricePatterns = [
        message.match(/at\s+\$?(\d+(?:\.\d+)?)/i),
        message.match(/\$(\d+(?:\.\d+)?)/),
        message.match(/for\s+\$?(\d+(?:\.\d+)?)/i),
        message.match(/(\d+(?:\.\d+)?)\s*dollars?/i),
      ];
      
      for (const pattern of pricePatterns) {
        if (pattern && parseFloat(pattern[1]) !== shares) {
          price = parseFloat(pattern[1]);
          break;
        }
      }
      
      if (isSell) {
        const allKeywords = ['all', 'all of', 'everything', 'all shares', 'my entire', 'entire position', 'liquidate'];
        const isSellingAll = allKeywords.some(k => msg.includes(k));
        
        let sharesToSell = shares;
        let foundSharesInHistory = false;
        
        if (isSellingAll && history.length > 0) {
          const historyStr = JSON.stringify(history).toLowerCase();
          const tickerIndex = historyStr.indexOf(ticker.toLowerCase());
          if (tickerIndex > -1) {
            const snippet = historyStr.substring(Math.max(0, tickerIndex - 100), tickerIndex + 100);
            const sharesMatch = snippet.match(/(\d+)\s*shares?/i);
            if (sharesMatch) {
              sharesToSell = parseInt(sharesMatch[1]);
              foundSharesInHistory = true;
            }
          }
        }
        
        const proposedChange: ProposedChange = {
          type: 'sell',
          ticker: ticker,
          shares: sharesToSell,
          price: price,
          description: `Sell ${isSellingAll ? 'ALL ' : ''}${sharesToSell} shares of ${ticker} at $${price || 'current price'}${isSellingAll ? ' (your entire position)' : ''}`,
          isSellingAll,
        };
        return { tool: null, params: {}, proposedChange };
      }
      
      const proposedChange: ProposedChange = {
        type: 'add',
        ticker: ticker,
        shares: shares,
        price: price,
        description: `Add ${shares} shares of ${ticker} at $${price || 'current price'}`,
      };
      return { tool: null, params: {}, proposedChange };
    }
  }
  
  const portfolioKeywords = ['portfolio', 'holdings', 'worth', 'value', 'gain', 'profit', 'loss', 'total', 'my stocks', 'own'];
  if (msg.includes('portfolio') || msg.includes('holdings') || msg.includes('worth') || msg.includes('value')) {
    return { tool: 'portfolio', params: {} };
  }
  
  const dividendKeywords = ['dividend', 'dividends', 'yield', 'payout', 'income', '$', 'per month', 'per year', 'annual'];
  const isDividendQuery = dividendKeywords.some(k => msg.includes(k));
  
  if (isDividendQuery) {
    for (const [company, symbol] of Object.entries(companyToSymbol)) {
      if (msg.includes(company)) {
        return { tool: 'stock', params: { symbol } };
      }
    }
    
    const words = message.replace(/[?.,!]/g, '').split(/\s+/);
    const symbols = words
      .filter(w => /^[A-Z]{1,5}$/.test(w))
      .filter(s => !['THE', 'AND', 'FOR', 'WANT', 'BUY', 'SELL', 'GET', 'WHAT', 'HOW', 'PRICE', 'MUCH', 'COST', 'DIVIDEND', 'YIELD', 'MONTH', 'YEAR', 'ANNUAL', 'NEED', 'INVEST', 'RECEIVE', 'GETTING', 'EVERY', 'MONTHLY', 'O', 'I', 'A', 'IN'].includes(s));
    
    if (symbols.length > 0) {
      return { tool: 'stock', params: { symbol: symbols[0] } };
    }
  }
  
  const stockKeywords = ['price', 'quote', 'how much', 'cost of', 'worth', 'trading at'];
  
  if (stockKeywords.some(k => msg.includes(k))) {
    const words = message.replace(/[?.,!]/g, '').split(/\s+/);
    const symbols = words
      .filter(w => /^[A-Z]{1,5}$/.test(w))
      .filter(s => !['THE', 'AND', 'FOR', 'WANT', 'BUY', 'SELL', 'GET', 'WHAT', 'HOW', 'PRICE', 'MUCH', 'COST', 'I', 'A', 'IN', 'IT', 'IS', 'ON', 'TO', 'BE'].includes(s));
    if (symbols.length > 0) {
      return { tool: 'stock', params: { symbol: symbols[0] } };
    }
    for (const [company, symbol] of Object.entries(companyToSymbol)) {
      if (msg.includes(company)) {
        return { tool: 'stock', params: { symbol } };
      }
    }
  }
  
  const searchKeywords = ['search', 'find', 'look for', 'etf', 'stock', 'recommend'];
  if (searchKeywords.some(k => msg.includes(k))) {
    let query = message.replace(/[?.,!]/g, '').replace(/search|find|look for|what is|show me|recommend/gi, '').trim().slice(0, 40);
    if (!query) query = msg.includes('etf') ? 'ETF' : 'stocks';
    return { tool: 'search', params: { query } };
  }
  
  const newsKeywords = ['news', 'headline', 'latest', 'market'];
  if (newsKeywords.some(k => msg.includes(k))) {
    const words = message.replace(/[?.,!]/g, '').split(/\s+/);
    const symbols = words.filter(w => /^[A-Z]{2,5}$/.test(w)).slice(0, 1);
    return { tool: 'news', params: { symbol: symbols[0] || 'GENERAL' } };
  }
  
  return { tool: null, params: {} };
}

async function executeTool(tool: string, params: any): Promise<any> {
  const baseUrl = 'http://localhost:3000';
  
  switch (tool) {
    case 'portfolio': {
      const res = await fetch(`${baseUrl}/api/stock?symbol=AAPL,MSFT,GOOGL,NVDA,TSLA,AMZN,META,JPM&summary=true`);
      return res.json();
    }
    case 'stock': {
      const res = await fetch(`${baseUrl}/api/stock?symbol=${encodeURIComponent(params.symbol)}`);
      return res.json();
    }
    case 'search': {
      const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(params.query)}`);
      return res.json();
    }
    case 'news': {
      const res = await fetch(`${baseUrl}/api/stock-news?symbol=${encodeURIComponent(params.symbol)}`);
      return res.json();
    }
    default:
      return null;
  }
}

function formatDataContext(tool: string, data: any): string {
  if (!data) return 'No data available.';
  
  if (tool === 'portfolio' && data.holdings) {
    const s = data.summary || {};
    return `PORTFOLIO DATA (Use exactly these values):
Total Value: $${(s.totalValue || 0).toLocaleString()}
Day P/L: $${(s.dayPL || 0).toFixed(2)} (${(s.dayPLPercent || 0).toFixed(2)}%)
All-Time P/L: $${(s.allTimePL || 0).toFixed(2)} (${(s.allTimePLPercent || 0).toFixed(2)}%)

Holdings:
${data.holdings.map((h: any) => `- ${h.ticker}: ${h.shares} shares @ $${(h.currentPrice || 0).toFixed(2)} (${(h.changePercent || 0) >= 0 ? '+' : ''}${(h.changePercent || 0).toFixed(2)}%)`).join('\n')}`;
  }
  
  if (tool === 'stock' && data?.price !== undefined) {
    const annualDividend = data.dividendRate || 0;
    const monthlyDividend = annualDividend / 12;
    const quarterlyDividend = annualDividend / 4;
    
    return `STOCK DATA for ${data.symbol}:
Current Price: $${(data.price || 0).toFixed(2)}
Day Change: $${(data.change || 0).toFixed(2)} (${(data.changePercent || 0).toFixed(2)}%)
52-Week Range: $${(data.fiftyTwoWeekLow || 0).toFixed(2)} - $${(data.fiftyTwoWeekHigh || 0).toFixed(2)}
P/E Ratio: ${data.peRatio ? data.peRatio.toFixed(1) : 'N/A'}
Market Cap: ${data.marketCap ? '$' + (data.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}

=== DIVIDEND INFO ===
Dividend Yield: ${data.dividendYield ? data.dividendYield.toFixed(2) + '%' : 'N/A'}
Annual Dividend Rate: $${annualDividend.toFixed(4)} per share
Quarterly Dividend: $${quarterlyDividend.toFixed(4)} per share
Monthly Equivalent: $${monthlyDividend.toFixed(4)} per share
Ex-Dividend Date: ${data.exDivDate || 'N/A'}
Next Earnings: ${data.nextEarningsDate || 'N/A'}
Dividend Frequency: ${data.dividendFrequency || 'quarterly'}

CALCULATIONS YOU CAN MAKE:
- For $100/month income: ${annualDividend > 0 ? Math.ceil(1200 / annualDividend) : 'N/A'} shares needed
- For $500/month income: ${annualDividend > 0 ? Math.ceil(6000 / annualDividend) : 'N/A'} shares needed
- For $1000/month income: ${annualDividend > 0 ? Math.ceil(12000 / annualDividend) : 'N/A'} shares needed`;
  }
  
  if (tool === 'search' && Array.isArray(data)) {
    return `SEARCH RESULTS:\n${data.slice(0, 8).map((s: any) => `- ${s.symbol}: ${s.name} (${s.type || 'Stock'})`).join('\n')}`;
  }
  
  if (tool === 'news' && data?.news) {
    return `MARKET NEWS:\n${data.news.slice(0, 5).map((n: any) => `- ${n.title} (${n.source})`).join('\n')}`;
  }
  
  return JSON.stringify(data).slice(0, 1500);
}

const DEFAULT_GREETING = `👋 Hi! I'm JARVIS, your AI financial advisor for StarkFlow.

I have access to your portfolio data and can help you with:
• Portfolio analysis and insights
• Stock prices and research
• Market news
• Recording trades and updates

What would you like to discuss?`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const msgLower = message.toLowerCase();
    const isGreeting = msgLower === 'hi' || msgLower === 'hello' || msgLower === 'hey' || msgLower === 'hi!';
    
    if (isGreeting && history.length > 2) {
      const response = await callGroq([
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6).map((m: Message) => ({ role: m.role, content: m.content })),
        { role: 'user', content: 'User said hi. Acknowledge them warmly without reintroducing yourself. Keep it brief.' },
      ]);
      const text = response.choices?.[0]?.message?.content || 'Hi again! How can I help you?';
      return NextResponse.json({ response: text, notes: getNotes() });
    }

    if (isGreeting) {
      return NextResponse.json({ response: DEFAULT_GREETING, notes: getNotes() });
    }

    const { tool, params, proposedChange } = detectIntent(message, history);
    
    let contextData = '';
    let toolUsed = null;
    
    if (tool) {
      const data = await executeTool(tool, params);
      contextData = formatDataContext(tool, data);
      toolUsed = tool;
    }

    const historyMessages = history.slice(-8).map((m: Message) => ({ 
      role: m.role, 
      content: m.content.substring(0, 500) 
    }));

    let userMessage = message;
    if (tool && contextData) {
      userMessage = `${message}\n\nIMPORTANT DATA (Use these exact values, do not make up numbers):\n${contextData}`;
    }

    if (proposedChange) {
      userMessage = `${message}\n\nIMPORTANT: The user wants to make a portfolio change. Ask for confirmation first with a clear summary of what will change. Format your response to include: "Here's what I'm about to do: [description]. Should I proceed?"`;
    }

    const notes = getNotes();
    const updatedNotes = updateNotes(message);

    if (proposedChange) {
      const text = `I've noted you'd like to ${proposedChange.description}. Should I proceed with this change?`;
      return NextResponse.json({ 
        response: text, 
        toolUsed,
        proposedChange,
        notes: updatedNotes
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyMessages,
      { role: 'user', content: userMessage },
    ];

    let text = '';
    try {
      const response = await callGroq(messages);
      text = response.choices?.[0]?.message?.content || '';
    } catch (e: any) {
      console.error('Groq failed:', e.message);
    }

    if (!text) {
      text = 'I had trouble processing that. Could you try again?';
    }

    return NextResponse.json({ 
      response: text, 
      toolUsed,
      proposedChange: null,
      notes: updatedNotes
    });

  } catch (error: any) {
    console.error('JARVIS error:', error);
    return NextResponse.json({ 
      response: `I encountered an error: ${error.message}. Please try again.`,
    }, { status: 200 });
  }
}

function getNotes(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('jarvis_notes') || '[]');
  } catch {
    return [];
  }
}

function updateNotes(message: string): any[] {
  if (typeof window === 'undefined') return [];
  
  const msg = message.toLowerCase();
  const notes = getNotes();
  const now = new Date().toISOString();
  
  if (msg.includes('want to own') || msg.includes('goal') || msg.includes('plan to buy')) {
    const sharesMatch = message.match(/(\d+)\s*(shares?|stocks?)/i);
    const symbolMatch = message.match(/\b([A-Z]{2,5})\b/i);
    
    if (sharesMatch && symbolMatch) {
      const existingGoal = notes.findIndex((n: any) => n.type === 'goal' && n.symbol === symbolMatch[1]);
      if (existingGoal >= 0) {
        notes[existingGoal] = { ...notes[existingGoal], shares: sharesMatch[1], updatedAt: now };
      } else {
        notes.push({
          id: Date.now().toString(),
          type: 'goal',
          content: `Goal: ${sharesMatch[1]} shares of ${symbolMatch[1]}`,
          symbol: symbolMatch[1],
          shares: sharesMatch[1],
          createdAt: now,
        });
      }
      localStorage.setItem('jarvis_notes', JSON.stringify(notes));
    }
  }
  
  return notes;
}