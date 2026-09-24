# HedgeHouse Solana Core Market Protocol Specification

## 1. Overview & Architecture

HedgeHouse is a decentralized, non-custodial risk market protocol built on Solana for real-world housing market outcomes. The protocol enables participants to mint, trade, and settle binary prediction positions (`YES` and `NO`) collateralized by SPL tokens (typically USDC).

Markets in HedgeHouse are completely agnostic to geographic or institutional details on-chain. The smart contract provides a generic, verifiable binary market model. All domain-specific data normalization, time series tracking, and mathematical outcome evaluations occur in the deterministic Phase 0 resolution engine off-chain.

```
+-----------------------------------------------------------------------------------+
|                              OFF-CHAIN DATA LAYER                                 |
|                                                                                   |
|  [FHFA / UK HPI / URA / ABS]                                                      |
|              |                                                                    |
|              v                                                                    |
|    Phase 0 Fetchers & Normalizers -> HousingObservation                           |
|              |                                                                    |
|              v                                                                    |
|    Phase 0 ResolutionEngine -> ResolutionEvaluation (YES / NO / UNRESOLVED)       |
|              |                                                                    |
|              v (Only if YES or NO)                                                |
|    Phase 0 -> Phase 1 Bridge -> MarketOutcome (1 = YES, 2 = NO)                   |
+-----------------------------------------------------------------------------------+
                                       |
                                       | resolve_market(outcome) signed by resolver_authority
                                       v
+-----------------------------------------------------------------------------------+
|                        ON-CHAIN PROTOCOL (Anchor Program)                         |
|                                                                                   |
|  Market PDA: ["market", identifier]                                               |
|    ├── Collateral Vault PDA: ["vault", market_key] (holds SPL Collateral)         |
|    ├── YES Mint PDA:         ["yes_mint", market_key]                             |
|    └── NO Mint PDA:          ["no_mint", market_key]                              |
|                                                                                   |
|  Instructions:                                                                    |
|    - create_market:      Initializes market PDA, vault, and YES/NO mints          |
|    - deposit_collateral: Deposits N collateral, mints N YES + N NO                |
|    - redeem_pair:        Burns N YES + N NO, returns N collateral (pre-resolution)|
|    - resolve_market:     Transitions Active -> Resolved with outcome (YES/NO)     |
|    - claim_winnings:     Burns N winning tokens, redeems N collateral (post-res)  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Account Structures & PDA Derivation

### Market PDA
Derived using the seeds:
`[b"market", market_identifier.as_bytes()]`

```rust
pub struct Market {
    pub creator: Pubkey,               // 32
    pub resolver_authority: Pubkey,    // 32
    pub collateral_mint: Pubkey,       // 32
    pub collateral_vault: Pubkey,      // 32
    pub yes_mint: Pubkey,              // 32
    pub no_mint: Pubkey,               // 32
    pub market_identifier: String,     // 4 + 64 = 68
    pub resolution_timestamp: i64,     // 8
    pub status: MarketStatus,          // 1
    pub outcome: MarketOutcome,        // 1
    pub comparison_type: ComparisonType, // 1
    pub target_value_bps: i64,         // 8
    pub total_collateral_deposited: u64, // 8
    pub total_collateral_claimed: u64,   // 8
    pub total_pairs_minted: u64,       // 8
    pub total_pairs_redeemed: u64,     // 8
    pub created_at: i64,               // 8
    pub resolved_at: i64,              // 8
    pub bump: u8,                      // 1
    pub vault_bump: u8,                // 1
    pub yes_mint_bump: u8,             // 1
    pub no_mint_bump: u8,              // 1
}
```
**Total Allocated Space:** 400 bytes (8-byte Anchor discriminator + 392 data bytes).

### Collateral Vault PDA
Derived using the seeds:
`[b"vault", market.key().as_ref()]`
Holds deposited collateral under programmatic authority (no private key).

### Position Token Mints (YES / NO)
- YES Mint PDA: `[b"yes_mint", market.key().as_ref()]`
- NO Mint PDA:  `[b"no_mint", market.key().as_ref()]`
Mint authority and freeze authority are both delegated exclusively to the Market PDA.

---

## 3. Core Protocol Lifecycle & Invariants

### 1. Market Creation (`create_market`)
- Initializes the `Market` account with specified metadata, target resolution timestamp, and designated `resolver_authority`.
- Creates the SPL collateral token vault PDA.
- Creates the SPL token mint PDAs for `YES` and `NO` tokens with matching decimal precision (typically 6 decimals matching USDC).
- Status is set to `MarketStatus::Active`, and outcome initialized to `MarketOutcome::Unresolved`.

### 2. Matched Pair Collateralization (`deposit_collateral`)
- A user deposits amount `X` of the collateral token into the Market's collateral vault.
- The program mints exactly `X` `YES` position tokens AND `X` `NO` position tokens to the user's token accounts.
- **Invariant:** At all times prior to resolution:
  $$\text{Vault Collateral} = \text{YES Supply} = \text{NO Supply}$$
- Deposits are strictly prohibited once `status != MarketStatus::Active`.

### 3. Matched Pair Pre-Resolution Redemption (`redeem_pair`)
- A user possessing equal amounts `X` of both `YES` and `NO` position tokens can redeem them at any point while the market is `Active`.
- The program atomically burns `X` `YES` tokens and `X` `NO` tokens from the user's accounts.
- The program releases `X` collateral tokens from the vault to the user.
- **Invariant:** Pre-resolution redemption maintains zero net exposure and zero risk of undercollateralization.

### 4. Market Resolution (`resolve_market`)
- Can **only** be executed by the assigned `resolver_authority`.
- Can **only** be executed when the Solana cluster timestamp `clock.unix_timestamp >= market.resolution_timestamp`.
- Can **only** be called once; state transitions irreversibly from `Active` to `Resolved`.
- Resolves to either `MarketOutcome::Yes` or `MarketOutcome::No`.

### 5. Settlement & Claiming Winnings (`claim_winnings`)
- Post-resolution, winning position token holders submit `W` winning tokens to the contract.
- The program validates that the submitted token corresponds to the winning mint:
  - If outcome is `Yes`, token mint must equal `market.yes_mint`.
  - If outcome is `No`, token mint must equal `market.no_mint`.
- The program burns `W` winning tokens and transfers `W` collateral tokens from the vault to the user.
- Losing tokens are rendered permanently worthless (any claim attempt fails with `InvalidOutcomeForClaim`).
- **Solvency Guarantee:** Because exactly 1 unit of collateral backed 1 unit of YES and 1 unit of NO, total collateral in the vault is mathematically guaranteed to equal the total supply of winning tokens, preventing insolvency.

---

## 4. Off-Chain to On-Chain Integration Bridge

The off-chain resolution system connects directly with the Solana protocol via `src/bridge/resolution_bridge.ts`:

1. Phase 0 providers poll or query the official public statistical bodies (FHFA, HM Land Registry, Singapore URA, ABS).
2. The `ResolutionEngine` computes the mathematical evaluation (`YES`, `NO`, or `UNRESOLVED`).
3. The bridge inspects `ResolutionEvaluation`:
   - If `evaluation.status === 'UNRESOLVED'`, transaction formation is immediately rejected (`UnresolvedMarketError`).
   - If `evaluation.status === 'YES'`, outcome byte is set to `1`.
   - If `evaluation.status === 'NO'`, outcome byte is set to `2`.
4. The instruction payload is signed by the keypair corresponding to `market.resolver_authority` and broadcast to Solana devnet/localnet.
