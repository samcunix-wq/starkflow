'use client';

import { portfolioSummary, assetAllocation, holdings, newsItems } from '@/data/mockData';
import PortfolioCard from '@/components/PortfolioCard';
import AllocationChart from '@/components/AllocationChart';
import HoldingsTable from '@/components/HoldingsTable';
import NewsCard from '@/components/NewsCard';

export default function Dashboard() {
  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Shawn</h1>
        <p className="text-[#6B7280]">Here's your portfolio overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PortfolioCard
          title="Total Portfolio Value"
          value={portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          isMain
        />
        <PortfolioCard
          title="Day P/L"
          value={portfolioSummary.dayPL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          change={portfolioSummary.dayPL}
          changePercent={portfolioSummary.dayPLPercent}
        />
        <PortfolioCard
          title="Week P/L"
          value={portfolioSummary.weekPL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          change={portfolioSummary.weekPL}
          changePercent={portfolioSummary.weekPLPercent}
        />
        <PortfolioCard
          title="All-Time P/L"
          value={portfolioSummary.allTimePL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          change={portfolioSummary.allTimePL}
          changePercent={portfolioSummary.allTimePLPercent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AllocationChart data={assetAllocation} />
        </div>
        <div className="lg:col-span-2">
          <HoldingsTable holdings={holdings} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {newsItems.slice(0, 5).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
