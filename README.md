# HedgeHouse

A Solana-based housing-risk market protocol where users collateralize objective housing-index outcomes using matched YES/NO positions.

---

## Overview

HedgeHouse lets users express or hedge housing-market risk without tokenizing physical property. Markets resolve strictly against objective, government-published housing statistics rather than subjective oracle votes, sentiment feeds, or speculative synthetic tokens.

HedgeHouse is **not**:
- Property tokenization (no fractional real estate, no deed NFTs)
- An Automated Market Maker (AMM) with impermanent loss or bonding curves
- A generic opinion or prediction market

### The Matched-Pair Collateral Primitive

The protocol operates on a deterministic matched-pair collateral primitive:

1. **Collateral Deposit:** Depositing $X$ testUSDC locks collateral in an isolated Program Derived Address (PDA) market vault and mints exactly $X$ YES + $X$ NO SPL tokens directly to the user.
2. **Pre-Resolution Pair Redemption:** Any user holding an equal pair ($Y$ YES + $Y$ NO) can burn them at any time prior to resolution to retrieve $Y$ testUSDC collateral from the vault with zero slippage.
3. **Deterministic Settlement:** Upon official publication of the designated statistical index, an authorized resolver submits the cryptographic settlement instruction.
4. **Winning Position Claim:** Post-resolution, winning outcome tokens burn $1:1$ against vault collateral ($1.00$ collateral per winning token). The opposite outcome tokens are rendered void.

---

## Why HedgeHouse

Housing represents the single largest asset class for households and institutional balance sheets globally, yet housing exposure remains geographic, illiquid, and structurally difficult to hedge directly. Traditional real-estate hedging instruments (such as legacy exchange futures) suffer from poor retail accessibility, high capital friction, and mismatched municipal basis risk.

HedgeHouse explores an on-chain primitive for objective, index-resolved housing risk across major global metropolitan centers.

> [!NOTE]
> HedgeHouse is a technical prototype demonstrating on-chain index collateralization on Solana Testnet. It is not an offer of regulated real-estate derivatives and is not deployed to Solana Mainnet.

---

## Live Demo

- **Production Interface:** [https://hedgehouse.vercel.app](https://hedgehouse.vercel.app)
- **Solana Cluster:** `Testnet`
- **Collateral Asset:** HedgeHouse testUSDC (`3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg`)
- **Monetary Value:** Demo / test assets only — **no real monetary value**.

A public, rate-limited **"Get testUSDC"** faucet is integrated directly into the web application, allowing any user with a Testnet-compatible wallet (Phantom, Solflare, Backpack) to claim 100 testUSDC and interact with live on-chain markets.

---

## Current Testnet Markets

All four metropolitan housing risk markets are active on Solana Testnet:

| Market | Market ID | Series & Benchmark | Predicate Condition |
| :--- | :--- | :--- | :--- |
| **Miami** | `miami-fhfa-2027q2-decline` | FHFA All-Transactions Index (MSAD 33124) | HPI drops below 2024-Q2 baseline (481.56) |
| **London** | `london-ukhpi-202707-growth` | HM Land Registry / ONS UK HPI (Greater London) | Index shows positive growth over baseline (138.40) |
| **Singapore** | `singapore-ura-2027q2-rise-2pct` | URA Private Residential Property Index (All Types) | HPI increases $\ge 2.0\%$ over baseline (201.20) |
| **Sydney** | `sydney-abs-2027q2-exceed-1500k` | ABS Cat 6432.0 Total Value of Dwellings | Median dwelling value exceeds 1,500,000 AUD |

---

## How It Works

### Architecture Flow

```
Official Sovereign Housing Data (FHFA, UK HPI, URA, ABS)
                           ↓
              Deterministic Ingestion & Normalizer
                           ↓
        Authorized Resolver Instruction (Cryptographic)
                           ↓
         HedgeHouse Solana Core Program (Anchor/Rust)
                           ↓
        Deterministic Settlement & Collateral Distribution
```

### End-to-End User Flow

1. **Connect Wallet:** Connect any standard Solana wallet configured for Solana Testnet.
2. **Claim testUSDC:** Click "Get testUSDC" in the navigation bar or trading interface to receive 100 testUSDC via the server-side faucet.
3. **Select Market:** Select any of the four active metropolitan housing markets (Miami, London, Singapore, Sydney).
4. **Deposit Collateral:** Deposit testUSDC to mint equal quantities of YES and NO position tokens directly into your Associated Token Accounts (ATAs).
5. **Redeem Pairs or Hold:** Redeem matched YES + NO pairs at any time to recover full collateral, or hold through the resolution date for deterministic settlement.

### Trust Boundary Specification

HedgeHouse separates off-chain data verification from on-chain execution:
- **Data Layer:** Official government statistical bureaus (FHFA, HM Land Registry, SingStat/URA, ABS).
- **Resolver Bridge:** Deterministic mathematical rules comparing official published statistics against baseline constants.
- **On-Chain Boundary:** The on-chain Solana program requires an authorized cryptographic signature (`resolver_authority`) to trigger the state transition to `Resolved`. The resolver is not decentralized or trustless; it operates under an explicit authorized institutional resolver model.

---

## Testnet Deployment

The HedgeHouse program, test collateral mint, and market PDAs are deployed and verified on Solana Testnet:

### Core Infrastructure

| Component | Public Address | Explorer |
| :--- | :--- | :--- |
| **Program ID** | `J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi` | [View on Explorer](https://explorer.solana.com/address/J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi?cluster=testnet) |
| **ProgramData PDA** | `HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB` | [View on Explorer](https://explorer.solana.com/address/HHejWjk3wCRcUNPxSLAQH5Nw2MRBGX11aaEtLS3QFpB?cluster=testnet) |
| **Shared testUSDC Mint** | `3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg` | [View on Explorer](https://explorer.solana.com/address/3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg?cluster=testnet) |
| **Deploy Transaction** | `4HappWdPVEkDinicPyF6xXvHMtcvr3y14Bz4Rfb7TxD3o7EKZFKcYrrXmJcNiNNmJqBha3jhw5EMLccJvwoBNe1d` | [View on Explorer](https://explorer.solana.com/tx/4HappWdPVEkDinicPyF6xXvHMtcvr3y14Bz4Rfb7TxD3o7EKZFKcYrrXmJcNiNNmJqBha3jhw5EMLccJvwoBNe1d?cluster=testnet) |

### Active Market Registry

| Market | Market PDA | Vault PDA | YES Mint | NO Mint |
| :--- | :--- | :--- | :--- | :--- |
| **Miami** | [`psSrLZqV...`](https://explorer.solana.com/address/psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg?cluster=testnet) | [`7ZBYv5Jz...`](https://explorer.solana.com/address/7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW?cluster=testnet) | [`26BGWvo4...`](https://explorer.solana.com/address/26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7?cluster=testnet) | [`9gK6Y2wq...`](https://explorer.solana.com/address/9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5?cluster=testnet) |
| **London** | [`51cBJsyu...`](https://explorer.solana.com/address/51cBJsyuBsgBPZJfQMi7NNjZCkuCm3yusbLpVvanCk5d?cluster=testnet) | [`2yWhwfTj...`](https://explorer.solana.com/address/2yWhwfTjtCvXs2qqnoVDmiFLnz9tm8JUxtYEa4A61ADk?cluster=testnet) | [`JB4c2428...`](https://explorer.solana.com/address/JB4c242841sqaQpmgCmTteeKcVrHEeNKsJZUu5Rj4E5a?cluster=testnet) | [`7mRVELcQ...`](https://explorer.solana.com/address/7mRVELcQ4BfduZuW2JSV5DafRdfpb5BVF3V5ST3tcAex?cluster=testnet) |
| **Singapore** | [`FJ1m18Aj...`](https://explorer.solana.com/address/FJ1m18AjKm2UcU4e7vZv62vE3EAgGbgQkQ1BrGjU5kVG?cluster=testnet) | [`BD57n28u...`](https://explorer.solana.com/address/BD57n28uVz6V6NKE1svQfmpanEpW27LHc9J4mRYBaipN?cluster=testnet) | [`3H5FGH1z...`](https://explorer.solana.com/address/3H5FGH1z6JwWX6NYd29yjhap6LHhkyag8nBB1CBeTckF?cluster=testnet) | [`g3jETuja...`](https://explorer.solana.com/address/g3jETujaaa6PPzqJiaCGCyUugQhJ2Pccm1T14pvmDYY?cluster=testnet) |
| **Sydney** | [`38RocohS...`](https://explorer.solana.com/address/38RocohSt3rqvJoPuXcUDFMnLx9FF1434BFUaVAUwauy?cluster=testnet) | [`F4fxizEA...`](https://explorer.solana.com/address/F4fxizEAaj2Go33vjAidJxQrhzyHNxVtuJnxq2TwD9ed?cluster=testnet) | [`4CEtjfij...`](https://explorer.solana.com/address/4CEtjfijonZsPHD9MSxAhkLZwFVsKyr5EYvN1k76vSUF?cluster=testnet) | [`7g86E9uM...`](https://explorer.solana.com/address/7g86E9uMoJs9thZzveriM1YVpm3GCaXfKNejQCauRBNN?cluster=testnet) |

---

## Verified Testnet E2E

All core protocol flows have been independently verified on Solana Testnet with public transactions:

1. **Program Deployment:** SBF bytecode (388,712 bytes) uploaded, initialized, and verified executable.
2. **4/4 Markets Initialized:** Miami, London, Singapore, and Sydney initialized with isolated vaults and SPL mints.
3. **Collateral Deposit (All 4):**
   - Miami Deposit (15 testUSDC): [`3P3RNeAC...`](https://explorer.solana.com/tx/3P3RNeACZe9t3mDgDWpQfPkWhvvUdugW2HfaWe2z1UybXBuNT9bRUuuJZHdzwhSGyummanKUomEFwMV73LebzNhc?cluster=testnet)
   - London Deposit (15 testUSDC): [`CSEAox1g...`](https://explorer.solana.com/tx/CSEAox1gWT86kRFTiDooHZ4ypz68UU5STUayhuu7Gu2qU7mTqobaPzd1mK7ct4uomJvoAkyWhVmf5RnwTkNsHKq?cluster=testnet)
   - Singapore Deposit (15 testUSDC): [`2rxMQtCv...`](https://explorer.solana.com/tx/2rxMQtCvji2FaLek2RoAqfKQxVsDuz2zNnLovQbHZ2nmFxLMysrWcsJzbjb2Y7arJkXZRJN2mwhEycj2aa7UY2NL?cluster=testnet)
   - Sydney Deposit (15 testUSDC): [`2SRnHJBG...`](https://explorer.solana.com/tx/2SRnHJBGdKsFUY2djQnuSXKXHXToeknHfvG2bVdjfEcMmZjC9Tmo5VdDDfik1CcajHvgD1UtRZt9swk2ARvQSMQB?cluster=testnet)
4. **Matched-Pair Redemption (All 4):**
   - Miami Redeem (5 Pairs): [`25vwgVc1...`](https://explorer.solana.com/tx/25vwgVc1Uej9DgEx6nrckYhHcgJEyA5e4Hui6YTicB26UESkQVEbGJx5uzRFqxUSztqwakmGYSGdo7HTyJqBxik8?cluster=testnet)
   - London Redeem (5 Pairs): [`5btBES2S...`](https://explorer.solana.com/tx/5btBES2SfjesQBNtYAoHDsHo5YAQmkgoiCeDVMUDPHy21FvBP8UznHCL9K1dYfvXoC1wKEMKbufMkfGoL7mnVKu5?cluster=testnet)
   - Singapore Redeem (5 Pairs): [`5gnz2agW...`](https://explorer.solana.com/tx/5gnz2agW3tfmFxMqrnxGtThBBt4ZD39Co9KqsWW8mEs3kmCBd5YySiegeW6ieoeu5v3QZYGCiDrdJsHQ7GWykk4s?cluster=testnet)
   - Sydney Redeem (5 Pairs): [`g1dZstgx...`](https://explorer.solana.com/tx/g1dZstgx6nQSaPTe8QTxvKVWSsGTNaeUVjLDFFCNgjpN6VBnLE1kwH2mPpdmSF4dqoNzsdicEwZnoaT5yuxEeXK?cluster=testnet)
5. **Fresh Non-Admin User E2E Verification:**
   - Fresh User Wallet: `o1mUXdBmm9XLx6ToEwxSxr1AL7JbVn5778EXGcuGU8y`
   - Public Faucet Claim (100 testUSDC): [`5bNFNwbQ...`](https://explorer.solana.com/tx/5bNFNwbQLbAhsEcfJ4sTMUgXb8h6cUocM3kfB7hh9ru9YGLL4AYYS2D8pKP4zhcqBJcFCxdkpXmBS8s6KD5pLUuA?cluster=testnet)
   - Autonomous User Deposit (10 testUSDC): [`5CCWABM9...`](https://explorer.solana.com/tx/5CCWABM9t6uCZf5Uug9tQUZyuoUppWbqGEgSVmrKJUxnxMoDUJc5r5H79dij8NMj5pbAZukZB5zWC1Rj56vWxBDX?cluster=testnet)
   - Autonomous User Pair Redeem (5 Pairs): [`52hwFr6Y...`](https://explorer.solana.com/tx/52hwFr6YSpmz8S5jE9wtRy7LGuh1hQEzkpG6NruJHaRPDTeEdfHf2Va6EQvc9NJUxPmsXBmDF57CPMbJm28FXXtM?cluster=testnet)
   - **Zero admin signatures required:** Autonomous permissionless execution confirmed.

---

## Data Sources

HedgeHouse resolves against authoritative sovereign government housing statistics:

1. **Miami:** Federal Housing Finance Agency (FHFA) All-Transactions House Price Index.
   - Frequency: Quarterly
   - Identifier: MSAD 33124 (Miami-Miami Beach-Kendall, FL)
2. **London:** HM Land Registry & Office for National Statistics (UK HPI).
   - Frequency: Monthly
   - Identifier: Greater London Series
3. **Singapore:** Urban Redevelopment Authority (URA) & SingStat.
   - Frequency: Quarterly
   - Identifier: Private Residential Property Price Index (All Types)
4. **Sydney:** Australian Bureau of Statistics (ABS).
   - Frequency: Quarterly
   - Identifier: Cat 6432.0 Total Value of Dwellings (Established House Prices, Greater Sydney)

See [`docs/`](docs/) and [`src/bridge/`](src/bridge/) for detailed provider documentation and schema definitions.

---

## Tech Stack

- **Smart Contract:** Anchor 0.30+ / Rust (`programs/hedgehouse`)
- **Blockchain:** Solana Testnet (`@solana/web3.js`, `@solana/spl-token`)
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Wallet Integration:** Solana Wallet Adapter (Wallet Standard auto-discovery)
- **Deployment:** Vercel (`hedgehouse`)

---

## Repository Structure

```
hedgehouse/
├── programs/
│   └── hedgehouse/           # Core Anchor/Rust Solana smart contract
│       ├── src/
│       │   └── lib.rs        # Deposit, redeem, and settlement instructions
│       └── Cargo.toml
├── apps/
│   └── web/                  # Next.js 14 production web application
│       ├── app/
│       │   ├── api/faucet/   # Server-side testUSDC faucet API route
│       │   ├── market/[id]/  # Individual metropolitan market view
│       │   ├── markets/      # Active market directory
│       │   ├── portfolio/    # Live on-chain SPL token portfolio
│       │   └── page.tsx      # Terminal homepage & institutional hero
│       ├── components/       # Header, Trading Panel, Data Visualizations
│       ├── lib/solana/       # Protocol bindings, IDL, and transaction builders
│       └── scripts/          # E2E on-chain test automation
├── src/                      # Data normalization & resolution engine
│   ├── bridge/               # Provider connectors (FHFA, UK HPI, URA, ABS)
│   ├── types/                # Protocol schemas and market definitions
│   └── index.ts
├── docs/                     # Technical specifications and data dictionaries
├── package.json              # Monorepo scripts and testing entry points
└── Anchor.toml               # Solana Anchor workspace configuration
```

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Solana CLI (optional, for on-chain contract building)

### Installation

```bash
# Clone the repository
git clone https://github.com/huzi0000/hedgehouse.git
cd hedgehouse

# Install root dependencies
npm install

# Install web application dependencies
cd apps/web && npm install && cd ../..
```

### Environment Configuration

In `apps/web/.env.local`:

```ini
NEXT_PUBLIC_SOLANA_CLUSTER=testnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.testnet.solana.com
NEXT_PUBLIC_HEDGEHOUSE_PROGRAM_ID=J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi
NEXT_PUBLIC_TEST_USDC_MINT=3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg

# Optional server-side faucet authority (leave blank in dev to use local deployer keypair)
# TESTNET_FAUCET_KEY=[1,2,3...]
```

### Running Locally

```bash
# Run data provider tests and deterministic resolution unit tests
npm test

# Verify live official housing endpoints
npm run verify

# Start web frontend development server (http://localhost:3000)
npm run web:dev

# Run full Next.js production build
npm run web:build
```

---

## Security & Trust Assumptions

- **Audit Status:** The smart contract has **not** undergone an independent security audit.
- **Testnet Demo:** Deployed strictly on Solana Testnet. Zero real SOL or mainnet USDC is involved.
- **Collateral Value:** testUSDC has zero financial value and is provided solely for protocol testing.
- **Oracle / Resolver Model:** Market resolution uses an authorized cryptographic signer (`resolver_authority`) rather than an automated decentralized oracle network.
- **External Dependencies:** Sovereign government statistical data releases are published according to official institutional schedules and may be subject to revisions per official agency guidelines.
- **Mainnet Deployment:** Mainnet deployment is intentionally out of scope.

---

## Status

**Solana Testnet Demo Operational.**  
All 4 markets, smart contract program, shared testUSDC mint, and public faucet are live and verified on Solana Testnet.
