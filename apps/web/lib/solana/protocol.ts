import { PublicKey, Transaction, ComputeBudgetProgram, Connection } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction
} from '@solana/spl-token';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import idlJson from './idl.json';

// Deployed Solana Devnet Configuration
export const SOLANA_CLUSTER = 'devnet';
export const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Verified On-Chain Program and Mint IDs
export const HEDGEHOUSE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HEDGEHOUSE_PROGRAM_ID || 'J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi'
);

export const TEST_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TEST_USDC_MINT || 'C3nYr1kLuTPN3Pvbc4DD8rvzAwVNHovNKyHpVKU4d3dv'
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

// Miami FHFA Verified Market Specification
export const MIAMI_MARKET_SPEC: MarketSpec = {
  id: 'miami-fhfa-2027q2-decline',
  name: 'Miami',
  marketPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_MARKET_PDA || 'psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg'),
  vaultPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_VAULT_PDA || '7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW'),
  yesMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_YES_MINT || '26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7'),
  noMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_NO_MINT || '9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5'),
  createMarketSignature: 'RxV9CiNGpGi3GcENGaeEneMeFcE9DWaWS9yk45njqWQTLnS6ab2hdtTGtNDLXgLvHPTUPC85FMBWE1JK5v7pDRB'
};

// All 4 Verified On-Chain Solana Devnet Markets
export const DEVNET_MARKETS_SPEC: Record<string, MarketSpec> = {
  'miami-fhfa-2027q2-decline': MIAMI_MARKET_SPEC,
  'london-ukhpi-202707-growth': {
    id: 'london-ukhpi-202707-growth',
    name: 'London',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_LONDON_MARKET_PDA || '51cBJsyuBsgBPZJfQMi7NNjZCkuCm3yusbLpVvanCk5d'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_LONDON_VAULT_PDA || '2yWhwfTjtCvXs2qqnoVDmiFLnz9tm8JUxtYEa4A61ADk'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_LONDON_YES_MINT || 'JB4c242841sqaQpmgCmTteeKcVrHEeNKsJZUu5Rj4E5a'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_LONDON_NO_MINT || '7mRVELcQ4BfduZuW2JSV5DafRdfpb5BVF3V5ST3tcAex'),
    createMarketSignature: '4unkUVMryLcNSGgGXmza51BabKSFYrjWE4s7PT6pKe3T7arzmhCbz58NhGEBFWrGJtqFTazZAanirhDQAEJXJ4av',
    depositTxSignature: '5orisc19ELWzDHd7PQGz3WQWNYaNgkFpBufD6MtXQLSWA3rXtJrJz8aHpEBuvAXgSzagxo5Vb3a4bW73s17eB9QE',
    redeemTxSignature: '5xAKK7L3TvE425ndnfVGafwtb2SRPApv3D5EzLDFHBfxPXzScWvfdXDiL7x9pBGZcbanziuEosWUdRM8d2wQE7SM'
  },
  'singapore-ura-2027q2-rise-2pct': {
    id: 'singapore-ura-2027q2-rise-2pct',
    name: 'Singapore',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_MARKET_PDA || 'FJ1m18AjKm2UcU4e7vZv62vE3EAgGbgQkQ1BrGjU5kVG'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_VAULT_PDA || 'BD57n28uVz6V6NKE1svQfmpanEpW27LHc9J4mRYBaipN'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_YES_MINT || '3H5FGH1z6JwWX6NYd29yjhap6LHhkyag8nBB1CBeTckF'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_SINGAPORE_NO_MINT || 'g3jETujaaa6PPzqJiaCGCyUugQhJ2Pccm1T14pvmDYY'),
    createMarketSignature: '3VNhzBwXSQgXj2RXDErXiadxtkgoTW4Je1vWG48BkGkY8chn2KHGmyb5Q3p84kTjjLDUSRp228Wjau3LXWzGnWco',
    depositTxSignature: '5FJcw8SR2N5bP8ge1pA6idXs4Y16iKNXJAvK2aiuT8qCrz3zMYPGFj4PQfP1j6o2hCsbLX1kF1fzJP9ZeHGiU7Lu',
    redeemTxSignature: 'udZvEwDh7fg46gnjJ9956PUCzyDNugPoVhVDWsS7s2z2pyFmoQranTrbSTmCz5juUv9A2zzihKDbJ4qe9JiPbma'
  },
  'sydney-abs-2027q2-exceed-1500k': {
    id: 'sydney-abs-2027q2-exceed-1500k',
    name: 'Sydney',
    marketPda: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_MARKET_PDA || '38RocohSt3rqvJoPuXcUDFMnLx9FF1434BFUaVAUwauy'),
    vaultPda: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_VAULT_PDA || 'F4fxizEAaj2Go33vjAidJxQrhzyHNxVtuJnxq2TwD9ed'),
    yesMint: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_YES_MINT || '4CEtjfijonZsPHD9MSxAhkLZwFVsKyr5EYvN1k76vSUF'),
    noMint: new PublicKey(process.env.NEXT_PUBLIC_SYDNEY_NO_MINT || '7g86E9uMoJs9thZzveriM1YVpm3GCaXfKNejQCauRBNN'),
    createMarketSignature: '2zqyvyVX2i9YJLwEQnsYvBVg2fhxeW8Sh9ozcq4TzkrKFw98YCQ62GRqCem12sw76L2tbr8skYXEHyhadnV9VLju',
    depositTxSignature: '3XyLtxuYUwhzPupbVbFUa6j2qonVSrP6cuYxPiGansFF8WWKGWMNy2qbq9X2dcJGMaH9VeR1Lq2xEwLWQbRqgDYs',
    redeemTxSignature: 'PH2ec9NGzDg3LAMvDP7Z7XtyHpJVe7beydbLX264BdFokTMUJ5fYmUucWNCn63EzvEheEbJmeufQUBjtPYDFyuQ'
  }
};

export function getExplorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
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

  try {
    const lamports = await connection.getBalance(userWallet, 'confirmed');
    sol = lamports / 1e9;
  } catch (e) {}

  try {
    const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
    const bal = await connection.getTokenAccountBalance(userCollateralAta, 'confirmed');
    testUsdc = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userYesAta = getAssociatedTokenAddressSync(marketSpec.yesMint, userWallet);
    const bal = await connection.getTokenAccountBalance(userYesAta, 'confirmed');
    yesTokens = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userNoAta = getAssociatedTokenAddressSync(marketSpec.noMint, userWallet);
    const bal = await connection.getTokenAccountBalance(userNoAta, 'confirmed');
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

  const provider = new AnchorProvider(connection, dummyWallet, {});
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

  const provider = new AnchorProvider(connection, dummyWallet, {});
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
