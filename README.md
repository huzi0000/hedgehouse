# HedgeHouse

**Global Housing-Risk Markets on Solana.**

HedgeHouse is a decentralized financial infrastructure protocol designed to enable transparent, deterministic hedging and position-taking on metropolitan housing market valuations. Instead of subjective oracle voting or unverified feeds, outcomes settle deterministically against official sovereign government housing statistics.

---

## Technical Status Matrix

| Component | Status | Details |
| :--- | :--- | :--- |
| **Phase 0: Sovereign Data Feeds** | **VERIFIED** | Live feeds for Miami (FHFA), London (UK HPI), Singapore (URA), Sydney (ABS). |
| **Phase 0: Deterministic Resolver** | **VERIFIED** | Strict mathematical rule engine and resolution bridge verified with unit tests. |
| **Phase 1: Smart Contract Source** | **VERIFIED** | Core Anchor Rust program implementing matched-pair collateral vault & SPL mints. |
| **Phase 1: SBF Bytecode Compilation** | **VERIFIED** | Program compiled to Solana SBF BPF (`target/deploy/hedgehouse.so`, 388,712 bytes). |
| **Solana Devnet Deployment** | **DEPLOYED & ACTIVE** | Executable on Solana Devnet (`J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi`). |
| **Test Collateral Mint** | **INITIALIZED** | Dedicated 6-decimal testUSDC (`C3nYr1kLuTPN3Pvbc4DD8rvzAwVNHovNKyHpVKU4d3dv`). |
| **Miami FHFA Devnet Market** | **LIVE ON-CHAIN** | Initialized market PDA (`psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg`). |
| **On-Chain Protocol Flow** | **VERIFIED** | Deposit, pair redemption, and resolver constraint enforcement verified on-chain. |
| **Phase 2 & 2.1: Frontend UI & Hero** | **VERIFIED** | Production Next.js 14 frontend with interactive Devnet trading panel & portfolio. |
| **Phase 3: Solana Wallet Integration** | **VERIFIED** | Solana Wallet Adapter configured for Devnet with interactive on-chain signing. |
| **Security Audit** | **NOT AUDITED** | Non-production devnet research build. Never deploy to Mainnet without audit. |
| **Mainnet Program Deployment** | **NOT DEPLOYED** | Hard deployment gate maintained. Zero real SOL or USDC spent. |

---

## 1. Phase 0 — Sovereign Housing Data Architecture

HedgeHouse integrates directly with public, government-published housing data sources:

1. **United States / Miami:**  
   - **Provider:** Federal Housing Finance Agency (FHFA)
   - **Series:** Miami-Miami Beach-Kendall, FL (MSAD 33124) All-Transactions HPI
   - **Frequency:** Quarterly (Base: 100)
2. **United Kingdom / London:**  
   - **Provider:** HM Land Registry / Office for National Statistics (UK HPI)
   - **Series:** Greater London Monthly House Price Index
   - **Frequency:** Monthly (Base: Jan 2015 = 100)
3. **Singapore:**  
   - **Provider:** Urban Redevelopment Authority (URA) / SingStat
   - **Series:** Private Residential Property Price Index (All Types)
   - **Frequency:** Quarterly (Base: 2009-Q1 = 100)
4. **Australia / Sydney:**  
   - **Provider:** Australian Bureau of Statistics (ABS)
   - **Series:** Cat 6432.0 Total Value of Dwellings — Greater Sydney Median Established House Price
   - **Frequency:** Quarterly (AUD)

### Deterministic Resolution Engine
Markets resolve to **YES** or **NO** based exclusively on verifiable mathematical formulas (e.g., `TARGET_LT_BASELINE`, `YOY_CHANGE_GT`). If official data has not yet been published by the provider, the market remains strictly `UNRESOLVED`.

---

## 2. Phase 1 — Solana Smart Contract Protocol

Implemented in Anchor / Rust at `programs/hedgehouse`:

- **Program ID:** `J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi`
- **Matched-Pair Collateral Model:** 1 unit of USDC deposited mints exactly 1 YES token + 1 NO token into the user's account.
- **Pre-Resolution Pair Redemption:** Any user holding 1 YES + 1 NO token can burn the matched pair to reclaim 1 USDC collateral at any time prior to market settlement.
- **Deterministic Settlement:** Only the designated `resolver_authority` can trigger `resolve_market`, passing the binary outcome derived from official public data.
- **Winning Claims:** Post-resolution, holders of winning tokens burn them to claim full $1:1$ collateral payouts. Losing tokens are rendered void.

### Solana Devnet Deployment & Verification Registry

The HedgeHouse protocol is deployed and active on Solana Devnet:

| On-Chain Artifact | Address / Signature | Explorer Link |
| :--- | :--- | :--- |
| **Program ID** | `J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi` | [View Program](https://explorer.solana.com/address/J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi?cluster=devnet) |
| **ProgramData PDA** | `HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB` | [View ProgramData](https://explorer.solana.com/address/HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB?cluster=devnet) |
| **Deploy Transaction** | `3cfoq5mYcTZzkmCBxVLvKvV6uz5vnZACehmoH2nbmqrjQnnXDBHCVDEJEkgfvYBY8Mm1vk4aM4xvD1mjx5WHMk6U` | [View Deploy Tx](https://explorer.solana.com/tx/3cfoq5mYcTZzkmCBxVLvKvV6uz5vnZACehmoH2nbmqrjQnnXDBHCVDEJEkgfvYBY8Mm1vk4aM4xvD1mjx5WHMk6U?cluster=devnet) |
| **Test Collateral Mint** | `C3nYr1kLuTPN3Pvbc4DD8rvzAwVNHovNKyHpVKU4d3dv` | [View Mint](https://explorer.solana.com/address/C3nYr1kLuTPN3Pvbc4DD8rvzAwVNHovNKyHpVKU4d3dv?cluster=devnet) |
| **Miami Market PDA** | `psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg` | [View Market PDA](https://explorer.solana.com/address/psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg?cluster=devnet) |
| **Collateral Vault PDA** | `7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW` | [View Vault PDA](https://explorer.solana.com/address/7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW?cluster=devnet) |
| **YES Mint PDA** | `26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7` | [View YES Mint](https://explorer.solana.com/address/26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7?cluster=devnet) |
| **NO Mint PDA** | `9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5` | [View NO Mint](https://explorer.solana.com/address/9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5?cluster=devnet) |
| **Create Market Tx** | `RxV9CiNGpGi3GcENGaeEneMeFcE9DWaWS9yk45njqWQTLnS6ab2hdtTGtNDLXgLvHPTUPC85FMBWE1JK5v7pDRB` | [View Create Market Tx](https://explorer.solana.com/tx/RxV9CiNGpGi3GcENGaeEneMeFcE9DWaWS9yk45njqWQTLnS6ab2hdtTGtNDLXgLvHPTUPC85FMBWE1JK5v7pDRB?cluster=devnet) |
| **Deposit Collateral Tx** | `5ZofP3vxSWSyu3McMtaZyibJrAwWf8fipNScJCMWaEMM3dnwQg8R4w9b8SMy8CAmLuF8oHDWdG2sb9wE6cxtfDMC` | [View Deposit Tx](https://explorer.solana.com/tx/5ZofP3vxSWSyu3McMtaZyibJrAwWf8fipNScJCMWaEMM3dnwQg8R4w9b8SMy8CAmLuF8oHDWdG2sb9wE6cxtfDMC?cluster=devnet) |
| **Redeem Matched Pair Tx**| `5uSdpn4EuskawDq9zKNoT4x6WuQgBx7YXK8f7jefeHiaEVuKWpHN787H9TZWC7jt27LUqwkPh9EmCYyZdeSPg5KG` | [View Redeem Tx](https://explorer.solana.com/tx/5uSdpn4EuskawDq9zKNoT4x6WuQgBx7YXK8f7jefeHiaEVuKWpHN787H9TZWC7jt27LUqwkPh9EmCYyZdeSPg5KG?cluster=devnet) |
| **Frontend Client Deposit Tx**| `2tBxnNnNSMx7BZvDKhDAEeeJDZekbVDUv1VavLRtx9ocFb9j84NL8FLkW8tN99pKvAM9jHBgFHBEBjk7UZAhP6QG` | [View Frontend Client Tx](https://explorer.solana.com/tx/2tBxnNnNSMx7BZvDKhDAEeeJDZekbVDUv1VavLRtx9ocFb9j84NL8FLkW8tN99pKvAM9jHBgFHBEBjk7UZAhP6QG?cluster=devnet) |

#### Verified Constraint Enforcements
- **Pre-Resolution Pair Redemption:** Successfully burned 40.00 YES + 40.00 NO tokens to reclaim 40.00 testUSDC collateral on Devnet (`5uSdpn4...`).
- **Unauthorized Resolution Rejection:** Attacker `Co1wtnMZWunWY4vsBPgQ7nQEP7VpNySRjJL9hDi5jhhy` attempting unauthorized settlement was strictly rejected on-chain (`Custom: 6005`, `HedgeHouseError::UnauthorizedResolver`, error `0x1775`).
- **Honest Market State:** The Miami FHFA market evaluates whether `FHFA(2027-Q2) < FHFA(2026-Q2)`. Since official FHFA 2027-Q2 data will not be released until August 2027, the market is maintained in its authentic unfinalized active state.

---

## 3. Phase 2 & 2.1 — Production Frontend

The web application is located in `apps/web`:
- Built with **Next.js 14**, **Tailwind CSS**, and **Lucide Icons**.
- Integrated high-performance responsive local hero video asset (`apps/web/public/videos/hedgehouse-hero.mp4`).
- All 4 markets display live historical data from the Phase 0 ingestion pipeline with explicit, transparent `COMING ON-CHAIN` indicators.
- Zero mock trading, zero invented liquidity, zero fabricated probabilities.

---

## 4. Phase 3 — Solana Wallet Integration

- Configured using official `@solana/wallet-adapter-react` and `@solana/wallet-adapter-react-ui`.
- **Wallet Standard Auto-Discovery:** Native support for Phantom, Solflare, Backpack, and other standard Solana wallets.
- **Mainnet RPC Query:** Reads live, real SOL balances directly from Solana Mainnet RPC via `connection.getBalance(publicKey)`.
- **Honest Portfolio View:** Correctly informs connected users that protocol execution awaits verified on-chain deployment.

---

## Running the Project

### Phase 0 Verification & Tests
```bash
# Run all unit tests, resolver tests, and provider normalization checks
npm test

# Verify live official housing endpoints
npm run verify

# Test deterministic resolution
npm run resolve
```

### Frontend Web Application
```bash
# Build production bundle
npm run web:build

# Start development server
npm run web:dev
```
