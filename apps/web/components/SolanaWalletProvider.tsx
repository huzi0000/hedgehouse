'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Default styles for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Enforce Solana Testnet RPC endpoint
  const endpoint = useMemo(() => {
    const envRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (envRpc && !envRpc.includes('devnet') && !envRpc.includes('mainnet')) {
      return envRpc;
    }
    return 'https://api.testnet.solana.com';
  }, []);

  // Standard wallet adapter: Modern Solana wallets (Phantom, Solflare, Backpack, etc.)
  // implement the Solana Wallet Standard and are automatically registered.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
