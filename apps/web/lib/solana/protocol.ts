import { PublicKey, Transaction, ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction
} from '@solana/spl-token';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import idlJson from './idl.json';

// Deployed Solana Testnet Configuration
export const SOLANA_CLUSTER = 'testnet';
export const DEFAULT_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL &&
  !process.env.NEXT_PUBLIC_SOLANA_RPC_URL.includes('devnet') &&
  !process.env.NEXT_PUBLIC_SOLANA_RPC_URL.includes('mainnet')
    ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    : 'https://api.testnet.solana.com';

// Verified On-Chain Program and Mint IDs
export const HEDGEHOUSE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HEDGEHOUSE_PROGRAM_ID || 'J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi'
);

export const TEST_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TEST_USDC_MINT || '3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg'
);

export interface MarketSpec {
  id: string;
  name: string;
  marketPda: PublicKey;
  vaultPda: PublicKey;
  yesMint: PublicKey;
  noMint: PublicKey;
  createMarketSignature: string;
  depositTxSignature?: string;
  redeemTxSignature?: string;
}

// Miami FHFA Verified Market Specification (Testnet)
export const MIAMI_MARKET_SPEC: MarketSpec = {
  id: 'miami-fhfa-2027q2-decline',
  name: 'Miami',
  marketPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_MARKET_PDA || 'psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg'),
  vaultPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_VAULT_PDA || '7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW'),
  yesMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_YES_MINT || '26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7'),
  noMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_NO_MINT || '9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5'),
  createMarketSignature: '2RM2FESCxBdeN9q3kURdemn6NWVTf3VHQZ7obRikF5nyLB8xaFKNSLVuceoiFZDJrfz5TBAQBDDZgS7tQAvT88ww',
  depositTxSignature: '3P3RNeACZe9t3mDgDWpQfPkWhvvUdugW2HfaWe2z1UybXBuNT9bRUuuJZHdzwhSGyummanKUomEFwMV73LebzNhc',
  redeemTxSignature: '25vwgVc1Uej9DgEx6nrckYhHcgJEyA5e4Hui6YTicB26UESkQVEbGJx5uzRFqxUSztqwakmGYSGdo7HTyJqBxik8'
};

// All 4 Verified On-Chain Solana Testnet Markets
export const TESTNET_MARKETS_SPEC: Record<string, MarketSpec> = {
  'miami-fhfa-2027q2-decline': MIAMI_MARKET_SPEC,
  'london-ukhpi-202707-growth': {
    id: 'london-ukhpi-202707-growth',
    name: 'London',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_LONDON_MARKET_PDA || '51cBJsyuBsgBPZJfQMi7NNjZCkuCm3yusbLpVvanCk5d'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_LONDON_VAULT_PDA || '2yWhwfTjtCvXs2qqnoVDmiFLnz9tm8JUxtYEa4A61ADk'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_LONDON_YES_MINT || 'JB4c242841sqaQpmgCmTteeKcVrHEeNKsJZUu5Rj4E5a'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_LONDON_NO_MINT || '7mRVELcQ4BfduZuW2JSV5DafRdfpb5BVF3V5ST3tcAex'),
    createMarketSignature: '22iA7MEFRiDqUHuJRSWc6w3vfJXiTF3iqYp8jR1m4dFwsRAs3iCGYXcPikT5yXCGhtUstxJTBnG3VzV2agQEBfjg',
    depositTxSignature: 'CSEAox1gWT86kRFTiDooHZ4ypz68UU5STUayhuu7Gu2qU7mTqobaPzd1mK7ct4uomJvoAkyWhVmf5RnwTkNsHKq',
    redeemTxSignature: '5btBES2SfjesQBNtYAoHDsHo5YAQmkgoiCeDVMUDPHy21FvBP8UznHCL9K1dYfvXoC1wKEMKbufMkfGoL7mnVKu5'
  },
  'singapore-ura-2027q2-rise-2pct': {
    id: 'singapore-ura-2027q2-rise-2pct',
    name: 'Singapore',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_MARKET_PDA || 'FJ1m18AjKm2UcU4e7vZv62vE3EAgGbgQkQ1BrGjU5kVG'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_VAULT_PDA || 'BD57n28uVz6V6NKE1svQfmpanEpW27LHc9J4mRYBaipN'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_YES_MINT || '3H5FGH1z6JwWX6NYd29yjhap6LHhkyag8nBB1CBeTckF'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_NO_MINT || 'g3jETujaaa6PPzqJiaCGCyUugQhJ2Pccm1T14pvmDYY'),
    createMarketSignature: '2bp7Z7s6nJStE3ofKhjCUuGAU16PmtZGpZwTbAgfuen7gMRDjHFVVH9NrsqUcbcJmwMK6rTynwUwLQQHh47BRZ3x',
    depositTxSignature: '2rxMQtCvji2FaLek2RoAqfKQxVsDuz2zNnLovQbHZ2nmFxLMysrWcsJzbjb2Y7arJkXZRJN2mwhEycj2aa7UY2NL',
    redeemTxSignature: '5gnz2agW3tfmFxMqrnxGtThBBt4ZD39Co9KqsWW8mEs3kmCBd5YySiegeW6ieoeu5v3QZYGCiDrdJsHQ7GWykk4s'
  },
  'sydney-abs-2027q2-exceed-1500k': {
    id: 'sydney-abs-2027q2-exceed-1500k',
    name: 'Sydney',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_MARKET_PDA || '38RocohSt3rqvJoPuXcUDFMnLx9FF1434BFUaVAUwauy'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_VAULT_PDA || 'F4fxizEAaj2Go33vjAidJxQrhzyHNxVtuJnxq2TwD9ed'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_YES_MINT || '4CEtjfijonZsPHD9MSxAhkLZwFVsKyr5EYvN1k76vSUF'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_NO_MINT || '7g86E9uMoJs9thZzveriM1YVpm3GCaXfKNejQCauRBNN'),
    createMarketSignature: '4DQCi2TxRiZXRkmjecW4bbMeg7dUaqF9xTn2w5huDyEkEanG56UtznxTt9qKeCepSkvXXYLP1iswAPfrq7YTz1tN',
    depositTxSignature: '2SRnHJBGdKsFUY2djQnuSXKXHXToeknHfvG2bVdjfEcMmZjC9Tmo5VdDDfik1CcajHvgD1UtRZt9swk2ARvQSMQB',
    redeemTxSignature: 'g1dZstgx6nQSaPTe8QTxvKVWSsGTNaeUVjLDFFCNgjpN6VBnLE1kwH2mPpdmSF4dqoNzsdicEwZnoaT5yuxEeXK'
  }
};

// Backwards compatibility alias for components
export const DEVNET_MARKETS_SPEC = TESTNET_MARKETS_SPEC;

export function getExplorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=testnet`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=testnet`;
}

export interface UserBalances {
  sol: number;
  testUsdc: number;
  yesTokens: number;
  noTokens: number;
}

export async function fetchUserBalances(
  connection: Connection,
  userWallet: PublicKey,
  marketSpec: MarketSpec = MIAMI_MARKET_SPEC
): Promise<UserBalances> {
  let sol = 0;
  let testUsdc = 0;
  let yesTokens = 0;
  let noTokens = 0;

  // Ensure query always executes against Solana Testnet
  const activeConnection =
    connection && !connection.rpcEndpoint.includes('devnet') && !connection.rpcEndpoint.includes('mainnet')
      ? connection
      : new Connection('https://api.testnet.solana.com', 'confirmed');

  try {
    const lamports = await activeConnection.getBalance(userWallet, 'confirmed');
    sol = lamports / LAMPORTS_PER_SOL;
  } catch (e) {
    console.error('Failed to query Testnet native SOL balance:', e);
  }

  try {
    const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
    const bal = await activeConnection.getTokenAccountBalance(userCollateralAta, 'confirmed');
    testUsdc = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userYesAta = getAssociatedTokenAddressSync(marketSpec.yesMint, userWallet);
    const bal = await activeConnection.getTokenAccountBalance(userYesAta, 'confirmed');
    yesTokens = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userNoAta = getAssociatedTokenAddressSync(marketSpec.noMint, userWallet);
    const bal = await activeConnection.getTokenAccountBalance(userNoAta, 'confirmed');
    noTokens = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  return { sol, testUsdc, yesTokens, noTokens };
}

/**
 * Builds an atomic transaction that:
 * 1. Creates idempotent ATAs for YES and NO position tokens if not yet existing
 * 2. Deposits collateral into the isolated market PDA vault
 * 3. Mints 1:1 matching YES and NO position tokens to the user's ATAs
 */
export async function buildDepositCollateralTx(
  connection: Connection,
  userWallet: PublicKey,
  amountUsdc: number,
  marketSpec: MarketSpec = MIAMI_MARKET_SPEC
): Promise<Transaction> {
  const dummyWallet: any = {
    publicKey: userWallet,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs
  };

  const activeConnection =
    connection && !connection.rpcEndpoint.includes('devnet') && !connection.rpcEndpoint.includes('mainnet')
      ? connection
      : new Connection('https://api.testnet.solana.com', 'confirmed');

  const provider = new AnchorProvider(activeConnection, dummyWallet, {});
  const program = new Program(idlJson as Idl, provider);

  const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
  const userYesAta = getAssociatedTokenAddressSync(marketSpec.yesMint, userWallet);
  const userNoAta = getAssociatedTokenAddressSync(marketSpec.noMint, userWallet);

  // 6 decimals: 1 USDC = 1,000,000 base units
  const baseUnits = BigInt(Math.round(amountUsdc * 1e6));

  const depositIx = await program.methods
    .depositCollateral(new BN(baseUnits.toString()))
    .accounts({
      market: marketSpec.marketPda,
      user: userWallet,
      userCollateral: userCollateralAta,
      collateralVault: marketSpec.vaultPda,
      collateralMint: TEST_USDC_MINT,
      yesMint: marketSpec.yesMint,
      noMint: marketSpec.noMint,
      userYes: userYesAta,
      userNo: userNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    createAssociatedTokenAccountIdempotentInstruction(
      userWallet,
      userYesAta,
      userWallet,
      marketSpec.yesMint
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      userWallet,
      userNoAta,
      userWallet,
      marketSpec.noMint
    ),
    depositIx
  );

  return tx;
}

/**
 * Builds a transaction that burns equal quantities of YES and NO position tokens
 * and redeems equivalent USDC collateral back to the user before resolution.
 */
export async function buildRedeemPairTx(
  connection: Connection,
  userWallet: PublicKey,
  pairsToRedeem: number,
  marketSpec: MarketSpec = MIAMI_MARKET_SPEC
): Promise<Transaction> {
  const dummyWallet: any = {
    publicKey: userWallet,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs
  };

  const activeConnection =
    connection && !connection.rpcEndpoint.includes('devnet') && !connection.rpcEndpoint.includes('mainnet')
      ? connection
      : new Connection('https://api.testnet.solana.com', 'confirmed');

  const provider = new AnchorProvider(activeConnection, dummyWallet, {});
  const program = new Program(idlJson as Idl, provider);

  const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
  const userYesAta = getAssociatedTokenAddressSync(marketSpec.yesMint, userWallet);
  const userNoAta = getAssociatedTokenAddressSync(marketSpec.noMint, userWallet);

  const baseUnits = BigInt(Math.round(pairsToRedeem * 1e6));

  const redeemIx = await program.methods
    .redeemPair(new BN(baseUnits.toString()))
    .accounts({
      market: marketSpec.marketPda,
      user: userWallet,
      userCollateral: userCollateralAta,
      collateralVault: marketSpec.vaultPda,
      yesMint: marketSpec.yesMint,
      noMint: marketSpec.noMint,
      userYes: userYesAta,
      userNo: userNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 }),
    redeemIx
  );

  return tx;
}
