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
| **Phase 2 & 2.1: Frontend UI & Hero** | **VERIFIED** | Production Next.js 14 frontend with responsive hero video asset and 7 static routes. |
| **Phase 3: Solana Wallet Integration** | **VERIFIED** | Real Solana Wallet Adapter (Phantom, Solflare, Backpack) and live Mainnet RPC queries. |
| **Anchor Instruction Lifecycle** | **IMPLEMENTED** | Tested in JavaScript invariant simulations; native on-chain lifecycle pending. |
| **Anchor 0.30.1 IDL Generation** | **BLOCKED** | Blocked by toolchain incompatibility (`rustc 1.98.1` removed `proc_macro::SourceFile` needed by `anchor-syn`). |
| **Local-Validator Lifecycle** | **NOT COMPLETED** | End-to-end on-chain validator execution pending IDL toolchain alignment. |
| **Security Audit** | **NOT AUDITED** | Protocol has not undergone independent third-party security audits. |
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

### Technical Toolchain Blocker Notice
While the on-chain SBF program compiles cleanly (`target/deploy/hedgehouse.so`), full `anchor build` IDL generation is currently **BLOCKED** due to an upstream Rust ecosystem breaking change:
- Modern host toolchain uses `rustc 1.98.1`.
- In `rustc >= 1.98`, the compiler removed `proc_macro::SourceFile`.
- Older `proc-macro2 1.0.94` fails to compile under `rustc 1.98.1` due to this missing type.
- Newer `proc-macro2 >= 1.0.95` removed `Span::source_file()`, which `anchor-syn 0.30.1` requires for IDL extraction.
Consequently, native IDL generation is documented as honestly blocked pending toolchain alignment.

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
