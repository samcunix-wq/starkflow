'use client';

import { ReactNode } from 'react';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
