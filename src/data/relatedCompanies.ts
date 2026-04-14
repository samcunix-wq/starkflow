export interface RelatedCompany {
  ticker: string;
  name: string;
  sector: string;
}

export const RELATED_COMPANIES: Record<string, RelatedCompany[]> = {
  AAPL: [
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Cyclical' },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  ],
  MSFT: [
    { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Cyclical' },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { ticker: 'ORCL', name: 'Oracle', sector: 'Technology' },
  ],
  GOOGL: [
    { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Cyclical' },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  ],
  AMZN: [
    { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { ticker: 'WMT', name: 'Walmart', sector: 'Consumer Defensive' },
  ],
  META: [
    { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { ticker: 'SNAP', name: 'Snap', sector: 'Communication Services' },
    { ticker: 'PINS', name: 'Pinterest', sector: 'Communication Services' },
  ],
  NVDA: [
    { ticker: 'AMD', name: 'AMD', sector: 'Technology' },
    { ticker: 'INTC', name: 'Intel', sector: 'Technology' },
    { ticker: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
    { ticker: 'AVGO', name: 'Broadcom', sector: 'Technology' },
    { ticker: 'TSM', name: 'TSMC', sector: 'Technology' },
  ],
  TSLA: [
    { ticker: 'F', name: 'Ford', sector: 'Consumer Cyclical' },
    { ticker: 'GM', name: 'General Motors', sector: 'Consumer Cyclical' },
    { ticker: 'RIVN', name: 'Rivian', sector: 'Consumer Cyclical' },
    { ticker: 'LCID', name: 'Lucid', sector: 'Consumer Cyclical' },
    { ticker: 'NIO', name: 'NIO', sector: 'Consumer Cyclical' },
  ],
  JPM: [
    { ticker: 'BAC', name: 'Bank of America', sector: 'Financial Services' },
    { ticker: 'WFC', name: 'Wells Fargo', sector: 'Financial Services' },
    { ticker: 'GS', name: 'Goldman Sachs', sector: 'Financial Services' },
    { ticker: 'MS', name: 'Morgan Stanley', sector: 'Financial Services' },
    { ticker: 'C', name: 'Citigroup', sector: 'Financial Services' },
  ],
  V: [
    { ticker: 'MA', name: 'Mastercard', sector: 'Financial Services' },
    { ticker: 'PYPL', name: 'PayPal', sector: 'Financial Services' },
    { ticker: 'SQ', name: 'Block', sector: 'Financial Services' },
    { ticker: 'AXP', name: 'American Express', sector: 'Financial Services' },
    { ticker: 'DFS', name: 'Discover', sector: 'Financial Services' },
  ],
  JNJ: [
    { ticker: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
    { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
    { ticker: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
    { ticker: 'MRK', name: 'Merck', sector: 'Healthcare' },
    { ticker: 'BMY', name: 'Bristol-Myers', sector: 'Healthcare' },
  ],
  PG: [
    { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer Defensive' },
    { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer Defensive' },
    { ticker: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer Defensive' },
    { ticker: 'KMB', name: 'Kimberly-Clark', sector: 'Consumer Defensive' },
    { ticker: 'GIS', name: 'General Mills', sector: 'Consumer Defensive' },
  ],
  VOO: [
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: 'ETF' },
    { ticker: 'IVV', name: 'iShares Core S&P 500', sector: 'ETF' },
    { ticker: 'VTI', name: 'Vanguard Total Stock', sector: 'ETF' },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: 'ETF' },
    { ticker: 'DIA', name: 'SPDR Dow Jones', sector: 'ETF' },
  ],
  QQQ: [
    { ticker: 'VGT', name: 'Vanguard Tech', sector: 'ETF' },
    { ticker: 'XLK', name: 'Tech Select Sector', sector: 'ETF' },
    { ticker: 'VOO', name: 'Vanguard S&P 500', sector: 'ETF' },
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: 'ETF' },
    { ticker: 'ARKQ', name: 'ARK Autonomous', sector: 'ETF' },
  ],
  SCHD: [
    { ticker: 'VYM', name: 'Vanguard High Dividend', sector: 'ETF' },
    { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', sector: 'ETF' },
    { ticker: 'DVY', name: 'iShares Dividend', sector: 'ETF' },
    { ticker: 'HDV', name: 'iShares Core High Dividend', sector: 'ETF' },
    { ticker: 'DGRO', name: 'iShares Dividend Growth', sector: 'ETF' },
  ],
  VTI: [
    { ticker: 'VOO', name: 'Vanguard S&P 500', sector: 'ETF' },
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: 'ETF' },
    { ticker: 'ITOT', name: 'iShares Core S&P Total', sector: 'ETF' },
    { ticker: 'SPTM', name: 'SPDR Total Stock', sector: 'ETF' },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: 'ETF' },
  ],
  KO: [
    { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer Defensive' },
    { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
    { ticker: 'MDLZ', name: 'Mondelez', sector: 'Consumer Defensive' },
    { ticker: 'KMB', name: 'Kimberly-Clark', sector: 'Consumer Defensive' },
    { ticker: 'GIS', name: 'General Mills', sector: 'Consumer Defensive' },
  ],
  DIS: [
    { ticker: 'CMCSA', name: 'Comcast', sector: 'Communication Services' },
    { ticker: 'NFLX', name: 'Netflix', sector: 'Communication Services' },
    { ticker: 'WBD', name: 'Warner Bros', sector: 'Communication Services' },
    { ticker: 'PARA', name: 'Paramount', sector: 'Communication Services' },
    { ticker: 'FOX', name: 'Fox', sector: 'Communication Services' },
  ],
  NFLX: [
    { ticker: 'DIS', name: 'Disney', sector: 'Communication Services' },
    { ticker: 'WBD', name: 'Warner Bros', sector: 'Communication Services' },
    { ticker: 'CMCSA', name: 'Comcast', sector: 'Communication Services' },
    { ticker: 'PARA', name: 'Paramount', sector: 'Communication Services' },
    { ticker: 'AMZN', name: 'Amazon (Prime)', sector: 'Consumer Cyclical' },
  ],
  HD: [
    { ticker: 'LOW', name: "Lowe's", sector: 'Consumer Cyclical' },
    { ticker: 'WMT', name: 'Walmart', sector: 'Consumer Defensive' },
    { ticker: 'TGT', name: 'Target', sector: 'Consumer Defensive' },
    { ticker: 'COST', name: 'Costco', sector: 'Consumer Defensive' },
    { ticker: 'BBY', name: 'Best Buy', sector: 'Consumer Cyclical' },
  ],
  UNH: [
    { ticker: 'CVS', name: 'CVS Health', sector: 'Healthcare' },
    { ticker: 'CI', name: 'Cigna', sector: 'Healthcare' },
    { ticker: 'HUM', name: 'Humana', sector: 'Healthcare' },
    { ticker: 'CNC', name: 'Centene', sector: 'Healthcare' },
    { ticker: 'ELV', name: 'Elevance', sector: 'Healthcare' },
  ],
  VZ: [
    { ticker: 'T', name: 'AT&T', sector: 'Communication Services' },
    { ticker: 'TMUS', name: 'T-Mobile', sector: 'Communication Services' },
    { ticker: 'CMCSA', name: 'Comcast', sector: 'Communication Services' },
    { ticker: 'DISH', name: 'DISH Network', sector: 'Communication Services' },
    { ticker: 'CHTR', name: 'Charter', sector: 'Communication Services' },
  ],
  INTC: [
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
    { ticker: 'AMD', name: 'AMD', sector: 'Technology' },
    { ticker: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
    { ticker: 'AVGO', name: 'Broadcom', sector: 'Technology' },
    { ticker: 'MU', name: 'Micron', sector: 'Technology' },
  ],
  AMD: [
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
    { ticker: 'INTC', name: 'Intel', sector: 'Technology' },
    { ticker: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
    { ticker: 'AVGO', name: 'Broadcom', sector: 'Technology' },
    { ticker: 'TXN', name: 'Texas Instruments', sector: 'Technology' },
  ],
  CRM: [
    { ticker: 'ADBE', name: 'Adobe', sector: 'Technology' },
    { ticker: 'NOW', name: 'ServiceNow', sector: 'Technology' },
    { ticker: 'WDAY', name: 'Workday', sector: 'Technology' },
    { ticker: 'ZS', name: 'Zscaler', sector: 'Technology' },
    { ticker: 'ORCL', name: 'Oracle', sector: 'Technology' },
  ],
  ADBE: [
    { ticker: 'CRM', name: 'Salesforce', sector: 'Technology' },
    { ticker: 'NOW', name: 'ServiceNow', sector: 'Technology' },
    { ticker: 'WDAY', name: 'Workday', sector: 'Technology' },
    { ticker: 'INTU', name: 'Intuit', sector: 'Technology' },
    { ticker: 'DOCU', name: 'DocuSign', sector: 'Technology' },
  ],
  PYPL: [
    { ticker: 'V', name: 'Visa', sector: 'Financial Services' },
    { ticker: 'MA', name: 'Mastercard', sector: 'Financial Services' },
    { ticker: 'SQ', name: 'Block', sector: 'Financial Services' },
    { ticker: 'COIN', name: 'Coinbase', sector: 'Financial Services' },
    { ticker: 'AFRM', name: 'Affirm', sector: 'Financial Services' },
  ],
  SQ: [
    { ticker: 'PYPL', name: 'PayPal', sector: 'Financial Services' },
    { ticker: 'V', name: 'Visa', sector: 'Financial Services' },
    { ticker: 'MA', name: 'Mastercard', sector: 'Financial Services' },
    { ticker: 'HOOD', name: 'Robinhood', sector: 'Financial Services' },
    { ticker: 'COIN', name: 'Coinbase', sector: 'Financial Services' },
  ],
  UBER: [
    { ticker: 'LYFT', name: 'Lyft', sector: 'Technology' },
    { ticker: 'DASH', name: 'DoorDash', sector: 'Consumer Cyclical' },
    { ticker: 'ABNB', name: 'Airbnb', sector: 'Consumer Cyclical' },
    { ticker: 'GRUB', name: 'Just Eat', sector: 'Consumer Cyclical' },
    { ticker: 'RBLX', name: 'Roblox', sector: 'Technology' },
  ],
  ABNB: [
    { ticker: 'BKNG', name: 'Booking', sector: 'Consumer Cyclical' },
    { ticker: 'MAR', name: 'Marriott', sector: 'Consumer Cyclical' },
    { ticker: 'HLT', name: 'Hilton', sector: 'Consumer Cyclical' },
    { ticker: 'UBER', name: 'Uber', sector: 'Technology' },
    { ticker: 'DASH', name: 'DoorDash', sector: 'Consumer Cyclical' },
  ],
  O: [
    { ticker: 'PLD', name: 'Prologis', sector: 'Real Estate' },
    { ticker: 'AMT', name: 'American Tower', sector: 'Real Estate' },
    { ticker: 'CCI', name: 'Crown Castle', sector: 'Real Estate' },
    { ticker: 'EQIX', name: 'Equinix', sector: 'Real Estate' },
    { ticker: 'PSA', name: 'Public Storage', sector: 'Real Estate' },
  ],
  SPY: [
    { ticker: 'VOO', name: 'Vanguard S&P 500', sector: 'ETF' },
    { ticker: 'IVV', name: 'iShares Core S&P 500', sector: 'ETF' },
    { ticker: 'VTI', name: 'Vanguard Total Stock', sector: 'ETF' },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: 'ETF' },
    { ticker: 'DIA', name: 'SPDR Dow Jones', sector: 'ETF' },
  ],
};

export const SECTOR_RELATED: Record<string, string[]> = {
  'Technology': ['MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD', 'AVGO', 'ORCL', 'ADBE'],
  'Financial Services': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP', 'PYPL', 'SQ'],
  'Healthcare': ['UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'BMY', 'LLY', 'AMGN', 'GILD', 'BIIB'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'LOW', 'NKE', 'MCD', 'SBUX', 'UBER', 'DASH', 'ABNB'],
  'Consumer Defensive': ['PG', 'KO', 'PEP', 'WMT', 'COST', 'TGT', 'MDLZ', 'GIS', 'KMB', 'CL'],
  'Communication Services': ['GOOGL', 'META', 'DIS', 'NFLX', 'VZ', 'T', 'CMCSA', 'WBD', 'PARA', 'SNAP'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY'],
  'Industrials': ['CAT', 'DE', 'BA', 'HON', 'UNP', 'RTX', 'LMT', 'GE', 'MMM', 'UPS'],
  'Real Estate': ['O', 'PLD', 'AMT', 'CCI', 'EQIX', 'PSA', 'AVB', 'EQR', 'WELL', 'SPG'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'ED', 'PEG'],
  'Materials': ['LIN', 'APD', 'SHW', 'ECL', 'NEM', 'FCX', 'NUE', 'DOW', 'DD', 'PPG'],
};

export function getRelatedCompanies(symbol: string, sector?: string | null): RelatedCompany[] {
  if (RELATED_COMPANIES[symbol]) {
    return RELATED_COMPANIES[symbol].filter(c => c.ticker !== symbol);
  }
  
  if (sector && SECTOR_RELATED[sector]) {
    return SECTOR_RELATED[sector]
      .filter(t => t !== symbol)
      .slice(0, 5)
      .map(ticker => ({ ticker, name: ticker, sector: sector }));
  }
  
  return [];
}
