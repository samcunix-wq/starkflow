'use client';

import { useEffect } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationChecker() {
  const { holdings } = usePortfolio();
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    if (holdings.length === 0) return;

    const checkUpcomingEvents = () => {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      holdings.forEach((holding) => {
        if (!holding.ticker) return;

        const notifiedExDivKey = `notified_exdiv_${holding.ticker}_${holding.exDivDate}`;
        const notifiedEarningsKey = `notified_earnings_${holding.ticker}_${holding.nextEarningsDate}`;

        if (holding.exDivDate && holding.exDivDate !== '-' && !localStorage.getItem(notifiedExDivKey)) {
          const exDivDate = new Date(holding.exDivDate);
          if (exDivDate >= today && exDivDate <= threeDaysFromNow) {
            addNotification({
              type: 'ex_dividend',
              title: 'Ex-Dividend Date Approaching',
              message: `${holding.ticker} goes ex-dividend on ${holding.exDivDate}. If you buy before this date, you'll receive the dividend.`,
              ticker: holding.ticker,
            });
            localStorage.setItem(notifiedExDivKey, 'true');
          }
        }

        if (holding.nextEarningsDate && holding.nextEarningsDate !== '-' && !localStorage.getItem(notifiedEarningsKey)) {
          const earningsDate = new Date(holding.nextEarningsDate);
          if (earningsDate >= today && earningsDate <= sevenDaysFromNow) {
            addNotification({
              type: 'earnings',
              title: 'Earnings Announcement Coming',
              message: `${holding.ticker} reports earnings on ${holding.nextEarningsDate}. Expect potential volatility.`,
              ticker: holding.ticker,
            });
            localStorage.setItem(notifiedEarningsKey, 'true');
          }
        }
      });
    };

    const timeout = setTimeout(checkUpcomingEvents, 3000);
    return () => clearTimeout(timeout);
  }, [holdings, addNotification]);

  return null;
}
