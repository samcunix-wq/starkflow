import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SimulatorProvider } from "@/context/SimulatorContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import IndexBar from "@/components/IndexBar";
import NotificationChecker from "@/components/NotificationChecker";
import JARVISButton from "@/components/JARVISButton";

export const metadata: Metadata = {
  title: "StarkFlow - Premium Finance Dashboard",
  description: "All-in-one modern finance dashboard for everyday investors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex bg-[#050505]">
        <AuthProvider>
          <PortfolioProvider>
            <WatchlistProvider>
              <NotificationProvider>
                <SimulatorProvider>
                  <NotificationChecker />
                  <Sidebar />
                  <div className="flex-1 ml-[280px]">
                    <Header />
                    <IndexBar />
                    <main className="p-6 min-h-[calc(100vh-64px-40px)]">
                      {children}
                    </main>
                    <JARVISButton />
                  </div>
                </SimulatorProvider>
              </NotificationProvider>
            </WatchlistProvider>
          </PortfolioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
