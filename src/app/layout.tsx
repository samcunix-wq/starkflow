import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
        <Sidebar />
        <div className="flex-1 ml-[280px]">
          <Header />
          <main className="p-6 min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
