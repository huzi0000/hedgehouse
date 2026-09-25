import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'HedgeHouse — Global Housing-Risk Markets on Solana',
  description:
    'Institutional housing-risk transfer protocol settling deterministically against official public indices (FHFA, UK HPI, URA, ABS).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0D0C] text-[#F4F4F0] flex flex-col font-sans selection:bg-[#10B981]/20 selection:text-[#10B981]">
        <Header />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
