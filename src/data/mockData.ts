export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  peRatio: number;
  dividendYield: number;
  dividendRate: number;
  exDivDate: string;
  dividendPaymentDate: string;
  dividendFrequency: string;
  nextEarningsDate: string;
  sector: string;
}

export interface PortfolioSummary {
  totalValue: number;
  dayPL: number;
  dayPLPercent: number;
  weekPL: number;
  weekPLPercent: number;
  allTimePL: number;
  allTimePLPercent: number;
}

export interface AssetAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

export interface UserGoal {
  id: string;
  ticker: string;
  targetPrice: number;
  targetShares: number;
  goalType: 'buy' | 'sell';
  status: 'active' | 'achieved' | 'missed';
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  ticker?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  link?: string;
}

export interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  accuracy: number;
  followers: number;
  following: number;
}

export interface TrendingStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  mentions: number;
  sentiment: number;
}

export const portfolioSummary: PortfolioSummary = {
  totalValue: 127450.0,
  dayPL: 1234.56,
  dayPLPercent: 0.98,
  weekPL: 3456.78,
  weekPLPercent: 2.79,
  allTimePL: 45678.9,
  allTimePLPercent: 55.9,
};

export const holdings: Holding[] = [
  {
    id: '1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgCost: 145.0,
    currentPrice: 178.5,
    change: 4.12,
    changePercent: 2.36,
    totalValue: 8925.0,
    totalGain: 1675.0,
    totalGainPercent: 23.1,
    peRatio: 28.5,
    dividendYield: 0.52,
    dividendRate: 0.96,
    exDivDate: '2024-02-09',
    dividendPaymentDate: '2024-02-15',
    dividendFrequency: 'quarterly',
    nextEarningsDate: '2024-04-25',
    sector: 'Technology',
  },
  {
    id: '2',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 30,
    avgCost: 350.0,
    currentPrice: 420.0,
    change: 7.56,
    changePercent: 1.83,
    totalValue: 12600.0,
    totalGain: 2100.0,
    totalGainPercent: 20.0,
    peRatio: 35.2,
    dividendYield: 0.74,
    dividendRate: 3.0,
    exDivDate: '2024-02-14',
    dividendPaymentDate: '2024-03-14',
    dividendFrequency: 'quarterly',
    nextEarningsDate: '2024-04-30',
    sector: 'Technology',
  },
  {
    id: '3',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 15,
    avgCost: 140.0,
    currentPrice: 175.0,
    change: -0.88,
    changePercent: -0.5,
    totalValue: 2625.0,
    totalGain: 525.0,
    totalGainPercent: 25.0,
    peRatio: 24.8,
    dividendYield: 0.0,
    dividendRate: 0,
    exDivDate: '-',
    dividendPaymentDate: '-',
    dividendFrequency: 'none',
    nextEarningsDate: '2024-04-23',
    sector: 'Technology',
  },
  {
    id: '4',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 25,
    avgCost: 450.0,
    currentPrice: 890.0,
    change: 37.38,
    changePercent: 4.39,
    totalValue: 22250.0,
    totalGain: 11000.0,
    totalGainPercent: 97.78,
    peRatio: 65.4,
    dividendYield: 0.03,
    dividendRate: 0.16,
    exDivDate: '2024-02-26',
    dividendPaymentDate: '2024-03-27',
    dividendFrequency: 'quarterly',
    nextEarningsDate: '2024-05-22',
    sector: 'Technology',
  },
  {
    id: '5',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    shares: 20,
    avgCost: 220.0,
    currentPrice: 245.0,
    change: -2.94,
    changePercent: -1.19,
    totalValue: 4900.0,
    totalGain: 500.0,
    totalGainPercent: 11.36,
    peRatio: 42.1,
    dividendYield: 0.0,
    dividendRate: 0,
    exDivDate: '-',
    dividendPaymentDate: '-',
    dividendFrequency: 'none',
    nextEarningsDate: '2024-04-23',
    sector: 'Consumer',
  },
  {
    id: '6',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 40,
    avgCost: 155.0,
    currentPrice: 185.0,
    change: 1.67,
    changePercent: 0.91,
    totalValue: 7400.0,
    totalGain: 1200.0,
    totalGainPercent: 19.35,
    peRatio: 45.6,
    dividendYield: 0.0,
    dividendRate: 0,
    exDivDate: '-',
    dividendPaymentDate: '-',
    dividendFrequency: 'none',
    nextEarningsDate: '2024-05-01',
    sector: 'Consumer',
  },
  {
    id: '7',
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    shares: 18,
    avgCost: 380.0,
    currentPrice: 520.0,
    change: 16.12,
    changePercent: 3.2,
    totalValue: 9360.0,
    totalGain: 2520.0,
    totalGainPercent: 36.84,
    peRatio: 32.8,
    dividendYield: 0.35,
    dividendRate: 2.0,
    exDivDate: '2024-02-22',
    dividendPaymentDate: '2024-02-28',
    dividendFrequency: 'quarterly',
    nextEarningsDate: '2024-04-24',
    sector: 'Technology',
  },
  {
    id: '8',
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    shares: 25,
    avgCost: 165.0,
    currentPrice: 195.0,
    change: 0.78,
    changePercent: 0.4,
    totalValue: 4875.0,
    totalGain: 750.0,
    totalGainPercent: 18.18,
    peRatio: 11.2,
    dividendYield: 2.45,
    dividendRate: 4.6,
    exDivDate: '2024-01-04',
    dividendPaymentDate: '2024-01-31',
    dividendFrequency: 'quarterly',
    nextEarningsDate: '2024-04-12',
    sector: 'Finance',
  },
];

export const assetAllocation: AssetAllocation[] = [
  { sector: 'Technology', value: 57360, percentage: 45, color: '#00BFFF' },
  { sector: 'Consumer', value: 25490, percentage: 20, color: '#00D4FF' },
  { sector: 'Finance', value: 19117.5, percentage: 15, color: '#0099CC' },
  { sector: 'Healthcare', value: 15294, percentage: 12, color: '#006699' },
  { sector: 'Other', value: 10188.5, percentage: 8, color: '#003366' },
];

export const userGoals: UserGoal[] = [
  {
    id: '1',
    ticker: 'AAPL',
    targetPrice: 300,
    targetShares: 100,
    goalType: 'buy',
    status: 'active',
  },
  {
    id: '2',
    ticker: 'NVDA',
    targetPrice: 1000,
    targetShares: 10,
    goalType: 'sell',
    status: 'active',
  },
];

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'NVIDIA Announces Next-Gen AI Chips, Stock Surges',
    source: 'Bloomberg',
    timestamp: '2 hours ago',
    ticker: 'NVDA',
    sentiment: 'positive',
    summary: 'NVIDIA unveiled its latest AI accelerator chips, promising 3x performance improvement over previous generation.',
  },
  {
    id: '2',
    title: 'Apple Reports Record Q1 Revenue, iPhone Sales Beat Estimates',
    source: 'Reuters',
    timestamp: '4 hours ago',
    ticker: 'AAPL',
    sentiment: 'positive',
    summary: 'Apple Inc. reported quarterly revenue of $119.6 billion, beating analyst expectations by 5%.',
  },
  {
    id: '3',
    title: 'Tesla Faces Production Challenges at Berlin Gigafactory',
    source: 'CNBC',
    timestamp: '6 hours ago',
    ticker: 'TSLA',
    sentiment: 'negative',
    summary: 'Tesla is experiencing supply chain disruptions at its Berlin facility, potentially impacting Q2 deliveries.',
  },
  {
    id: '4',
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    source: 'WSJ',
    timestamp: '8 hours ago',
    sentiment: 'positive',
    summary: 'Fed Chair Powell indicated interest rate cuts could come earlier than expected if inflation continues to cool.',
  },
  {
    id: '5',
    title: 'Microsoft Cloud Revenue Exceeds Expectations',
    source: 'TechCrunch',
    timestamp: '10 hours ago',
    ticker: 'MSFT',
    sentiment: 'positive',
    summary: 'Microsoft Azure cloud platform revenue grew 29% year-over-year, exceeding Wall Street estimates.',
  },
];

export const socialUsers: SocialUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: '@alexc',
    avatar: 'AC',
    rank: 1,
    accuracy: 78.5,
    followers: 15420,
    following: 234,
  },
  {
    id: '2',
    name: 'Sarah Williams',
    username: '@sarahw',
    avatar: 'SW',
    rank: 2,
    accuracy: 74.2,
    followers: 12850,
    following: 412,
  },
  {
    id: '3',
    name: 'Michael Park',
    username: '@mikep',
    avatar: 'MP',
    rank: 3,
    accuracy: 71.8,
    followers: 9876,
    following: 189,
  },
  {
    id: '4',
    name: 'Emma Johnson',
    username: '@emmaj',
    avatar: 'EJ',
    rank: 4,
    accuracy: 69.4,
    followers: 8234,
    following: 567,
  },
  {
    id: '5',
    name: 'David Kim',
    username: '@davidk',
    avatar: 'DK',
    rank: 5,
    accuracy: 67.2,
    followers: 6543,
    following: 321,
  },
];

export const trendingStocks: TrendingStock[] = [
  { ticker: 'NVDA', name: 'NVIDIA', price: 890.0, change: 37.38, changePercent: 4.39, mentions: 12453, sentiment: 89 },
  { ticker: 'AAPL', name: 'Apple', price: 178.5, change: 4.12, changePercent: 2.36, mentions: 8921, sentiment: 76 },
  { ticker: 'TSLA', name: 'Tesla', price: 245.0, change: -2.94, changePercent: -1.19, mentions: 7654, sentiment: 45 },
  { ticker: 'AMD', name: 'AMD', price: 178.0, change: 5.34, changePercent: 3.1, mentions: 5432, sentiment: 82 },
  { ticker: 'META', name: 'Meta', price: 520.0, change: 16.12, changePercent: 3.2, mentions: 4321, sentiment: 78 },
];
