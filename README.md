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
| **Solana Testnet Deployment** | **DEPLOYED & ACTIVE** | Executable on Solana Testnet (`J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi`). |
| **Test Collateral Mint** | **INITIALIZED** | Dedicated 6-decimal Testnet testUSDC (`3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg`). |
| **All 4 Testnet Markets** | **LIVE ON-CHAIN** | Initialized Miami, London, Singapore, Sydney with real PDAs on Testnet. |
| **On-Chain Protocol Flow** | **VERIFIED** | Deposit, pair redemption, and permissionless user flows verified on Testnet. |
| **Phase 2 & 2.1: Frontend UI & Hero** | **VERIFIED** | Production Next.js 14 frontend configured for Solana Testnet & live portfolio. |
| **Phase 3: Solana Wallet Integration** | **VERIFIED** | Solana Wallet Adapter configured for Testnet with interactive on-chain signing. |
| **Security Audit** | **NOT AUDITED** | Non-production testnet demo build. Never deploy to Mainnet without audit. |
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

### Solana Testnet Deployment & Verification Registry

The HedgeHouse protocol is fully deployed and active across all four metropolitan markets on Solana Testnet:

| On-Chain Artifact | Address / Signature | Explorer Link |
| :--- | :--- | :--- |
| **Program ID** | `J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi` | [View Program](https://explorer.solana.com/address/J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi?cluster=testnet) |
| **ProgramData PDA** | `HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB` | [View ProgramData](https://explorer.solana.com/address/HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB?cluster=testnet) |
| **Deploy Transaction** | `4HappWdPVEkDinicPyF6xXvHMtcvr3y14Bz4Rfb7TxD3o7EKZFKcYrrXmJcNiNNmJqBha3jhw5EMLccJvwoBNe1d` | [View Deploy Tx](https://explorer.solana.com/tx/4HappWdPVEkDinicPyF6xXvHMtcvr3y14Bz4Rfb7TxD3o7EKZFKcYrrXmJcNiNNmJqBha3jhw5EMLccJvwoBNe1d?cluster=testnet) |
| **Shared testUSDC Mint** | `3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg` | [View Mint](https://explorer.solana.com/address/3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg?cluster=testnet) |
| **Miami Market PDA** | `psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg` | [View Miami Market](https://explorer.solana.com/address/psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg?cluster=testnet) |
| **London Market PDA** | `51cBJsyuBsgBPZJfQMi7NNjZCkuCm3yusbLpVvanCk5d` | [View London Market](https://explorer.solana.com/address/51cBJsyuBsgBPZJfQMi7NNjZCkuCm3yusbLpVvanCk5d?cluster=testnet) |
| **Singapore Market PDA** | `FJ1m18AjKm2UcU4e7vZv62vE3EAgGbgQkQ1BrGjU5kVG` | [View Singapore Market](https://explorer.solana.com/address/FJ1m18AjKm2UcU4e7vZv62vE3EAgGbgQkQ1BrGjU5kVG?cluster=testnet) |
| **Sydney Market PDA** | `38RocohSt3rqvJoPuXcUDFMnLx9FF1434BFUaVAUwauy` | [View Sydney Market](https://explorer.solana.com/address/38RocohSt3rqvJoPuXcUDFMnLx9FF1434BFUaVAUwauy?cluster=testnet) |

#### Verified Real On-Chain Testnet E2E Transactions
- **Miami Deposit (15 testUSDC):** [`3P3RNeAC...bZNhc`](https://explorer.solana.com/tx/3P3RNeACZe9t3mDgDWpQfPkWhvvUdugW2HfaWe2z1UybXBuNT9bRUuuJZHdzwhSGyummanKUomEFwMV73LebzNhc?cluster=testnet)
- **Miami Redeem (5 Pairs):** [`25vwgVc1...QBxik8`](https://explorer.solana.com/tx/25vwgVc1Uej9DgEx6nrckYhHcgJEyA5e4Hui6YTicB26UESkQVEbGJx5uzRFqxUSztqwakmGYSGdo7HTyJqBxik8?cluster=testnet)
- **London Deposit (15 testUSDC):** [`CSEAox1g...TkNsHKq`](https://explorer.solana.com/tx/CSEAox1gWT86kRFTiDooHZ4ypz68UU5STUayhuu7Gu2qU7mTqobaPzd1mK7ct4uomJvoAkyWhVmf5RnwTkNsHKq?cluster=testnet)
- **London Redeem (5 Pairs):** [`5btBES2S...mnVKu5`](https://explorer.solana.com/tx/5btBES2SfjesQBNtYAoHDsHo5YAQmkgoiCeDVMUDPHy21FvBP8UznHCL9K1dYfvXoC1wKEMKbufMkfGoL7mnVKu5?cluster=testnet)
- **Singapore Deposit (15 testUSDC):** [`2rxMQtCv...7UY2NL`](https://explorer.solana.com/tx/2rxMQtCvji2FaLek2RoAqfKQxVsDuz2zNnLovQbHZ2nmFxLMysrWcsJzbjb2Y7arJkXZRJN2mwhEycj2aa7UY2NL?cluster=testnet)
- **Singapore Redeem (5 Pairs):** [`5gnz2agW...ykk4s`](https://explorer.solana.com/tx/5gnz2agW3tfmFxMqrnxGtThBBt4ZD39Co9KqsWW8mEs3kmCBd5YySiegeW6ieoeu5v3QZYGCiDrdJsHQ7GWykk4s?cluster=testnet)
- **Sydney Deposit (15 testUSDC):** [`2SRnHJBG...RvQSMQB`](https://explorer.solana.com/tx/2SRnHJBGdKsFUY2djQnuSXKXHXToeknHfvG2bVdjfEcMmZjC9Tmo5VdDDfik1CcajHvgD1UtRZt9swk2ARvQSMQB?cluster=testnet)
- **Sydney Redeem (5 Pairs):** [`g1dZstgx...yuxEeXK`](https://explorer.solana.com/tx/g1dZstgx6nQSaPTe8QTxvKVWSsGTNaeUVjLDFFCNgjpN6VBnLE1kwH2mPpdmSF4dqoNzsdicEwZnoaT5yuxEeXK?cluster=testnet)

#### Permissionless External User Flow Verification
- **External User Autonomous Deposit (20 testUSDC):** [`mCsJSDZP...AHXyot`](https://explorer.solana.com/tx/mCsJSDZPMPhTe3BU6nGwf8nrb4YMoK77yMzUmznAuMPPYdb3NgFX8HTtPmXGjTBdqZyGi2hvH9xyqdViUAHXyot?cluster=testnet)
- **External User Autonomous Redeem (10 Pairs):** [`kQDwA8vo...P7nN1s`](https://explorer.solana.com/tx/kQDwA8voW5ZKu6Nn1znxcauw9CwEUeXC538LoutpqntrsRRzbKmUai1zvwGCfAzrSrn6UNKEiTFSLDLfxP7nN1s?cluster=testnet)
- Verified: Zero admin/authority signer required. Any normal external wallet with Testnet SOL and testUSDC executes transactions autonomously.

---

## 3. Phase 2 & 2.1 — Production Frontend

The web application is located in `apps/web`:
- Built with **Next.js 14**, **Tailwind CSS**, and **Lucide Icons**.
- Integrated high-performance responsive local hero video asset (`apps/web/public/videos/hedgehouse-hero.mp4`).
- All 4 markets display live historical data from the Phase 0 ingestion pipeline with verified `TESTNET ACTIVE` status badges and on-chain interactions.
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
