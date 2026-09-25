import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'HedgeHouse — Global Housing Risk Markets on Solana',
  description:
    'Explore global housing-risk markets resolved using official public housing data.',
  openGraph: {
    title: 'HedgeHouse — Global Housing Risk Markets on Solana',
    description:
      'Explore global housing-risk markets resolved using official public housing data.',
    siteName: 'HedgeHouse',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0B0D0C] text-[#F4F4F0] flex flex-col font-sans selection:bg-[#10B981]/20 selection:text-[#10B981]">
        <Header />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
