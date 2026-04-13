import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "StarkFlow - AI Portfolio Advisor",
  description: "Your personal AI-powered investment portfolio tracker with JARVIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex bg-[#050505]">
        <Providers>
          <Sidebar />
          <div className="flex-1 lg:ml-[280px]">
            <Header />
            <main className="p-4 lg:p-6 min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
