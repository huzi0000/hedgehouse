'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ShieldCheck, Wallet, Menu, X } from 'lucide-react';
import { ConnectWalletModal } from './ConnectWalletModal';

export function Header() {
  const pathname = usePathname();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/markets', label: 'Markets' },
    { href: '/data', label: 'Data' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#222725] bg-[#0B0D0C]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center group-hover:border-[#10B981]/50 transition-colors">
                <span className="font-mono font-bold text-xs tracking-tighter text-[#10B981]">H</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold tracking-wider text-sm text-[#F4F4F0] flex items-center gap-1.5">
                  HEDGEHOUSE
                </span>
                <span className="text-[10px] text-[#565E5A] font-mono tracking-tight hidden sm:inline-block">
                  GLOBAL HOUSING RISK
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                      isActive
                        ? 'text-[#F4F4F0] bg-[#161A18] border border-[#2B322F]'
                        : 'text-[#8A918E] hover:text-[#F4F4F0] hover:bg-[#161A18]/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Solana Mainnet Target Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[11px] font-mono text-[#8A918E]" title="Target Network: Solana Mainnet (Protocol Execution Awaiting Deployment)">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#F4F4F0] font-medium">SOLANA / MAINNET</span>
            </div>

            {/* Connect Wallet Button */}
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#161A18] hover:bg-[#1B201E] border border-[#2B322F] hover:border-[#10B981]/40 rounded text-xs font-mono text-[#F4F4F0] transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Connect Wallet</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="p-2 bg-[#161A18] border border-[#222725] rounded text-[#10B981]"
              aria-label="Connect wallet"
            >
              <Wallet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-[#161A18] border border-[#222725] rounded text-[#8A918E] hover:text-[#F4F4F0]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-b border-[#222725] bg-[#0B0D0C] px-4 pt-3 pb-5 space-y-3 font-mono">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[11px] text-[#8A918E] w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#F4F4F0] font-medium">SOLANA / MAINNET</span>
            </div>
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs text-[#8A918E] hover:text-[#F4F4F0] hover:bg-[#161A18] rounded"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <ConnectWalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
}
