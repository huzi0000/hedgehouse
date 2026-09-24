# HedgeHouse Security Model & Trust Boundary Analysis

## 1. Trust Architecture & Protocol Separation

HedgeHouse establishes a clear, rigorous separation between **on-chain custody and execution** and **off-chain data ingestion and resolution computation**.

```
+-------------------------------------------------------------------------------+
|                             TRUST BOUNDARY DIAGRAM                            |
|                                                                               |
|  [Off-Chain World]                                                            |
|  • Public Housing Datasets (FHFA, UK Land Registry, URA, ABS)                 |
|  • Phase 0 Resolution Engine (Deterministic mathematical computation)         |
|  • Resolver Agent / Oracle Operator (Keypair holding resolver_authority)     |
|                                                                               |
|  ============================== TRUST BOUNDARY ============================== |
|  The on-chain program TRUSTS the resolver_authority signature for outcome    |
|  accuracy, but TRUSTS NO ONE for collateral custody and accounting.           |
|  ============================================================================ |
|                                                                               |
|  [On-Chain World (Solana Program)]                                            |
|  • Market PDA (State machine & access control)                                |
|  • Collateral Vault PDA (Escrow custody, zero private keys)                   |
|  • YES / NO Mint PDAs (Strict 1:1 matched-pair supply accounting)             |
|  • Token Claim & Burn Mechanisms (Mathematically insolvent-proof)             |
+-------------------------------------------------------------------------------+
```

---

## 2. On-Chain Custody & Protocol Invariants

The on-chain program enforces uncompromising mathematical invariants that protect depositor capital regardless of market state:

### A. Non-Custodial Vault Architecture
- Collateral is escrowed directly into a Program Derived Address (PDA) vault:
  `seeds = [b"vault", market.key().as_ref()]`
- No administrator, creator, or resolver possesses private keys to withdraw vault funds arbitrarily. Funds can only leave the vault via two authorized instruction pathways:
  1. `redeem_pair`: Atomically burns 1 YES + 1 NO to release 1 Collateral.
  2. `claim_winnings`: Atomically burns 1 Winning Token to release 1 Collateral post-resolution.

### B. Matched-Pair Solvency Guarantee
- Every unit of collateral deposited simultaneously mints exactly 1 unit of YES and 1 unit of NO token:
  $$\Delta \text{Vault} = \Delta \text{YES Supply} = \Delta \text{NO Supply}$$
- Total collateral held in the vault always satisfies:
  $$\text{Vault Balance} \ge \min(\text{YES Supply}, \text{NO Supply})$$
- When the market resolves:
  - If outcome is `YES`, the winning supply is at most equal to the vault balance.
  - If outcome is `NO`, the winning supply is at most equal to the vault balance.
- Because losing tokens have zero claim value, the vault can never suffer a deficit or run-on-the-bank scenario.

---

## 3. Off-Chain Ingestion & Resolver Trust Assumption

### The Resolver Authority Role
- In Phase 1 Devnet / Local validation, the market specifies a `resolver_authority` public key upon creation.
- The off-chain worker fetches data from official government agencies (FHFA, UK Land Registry, Singapore URA, ABS), executes the Phase 0 `ResolutionEngine`, and generates a resolution transaction signed by this authority.
- **Trust Assumption:** For Phase 1, market participants trust that the designated `resolver_authority` will execute the deterministic algorithm truthfully and submit the correct outcome byte (`1` for YES, `2` for NO).

### Defense-in-Depth Off-Chain Protections
1. **Deterministic Verification:** The off-chain engine produces cryptographic audit trails (hash of raw observations, calculation steps, and exact dates). Anyone can run `npm run resolve` to verify the oracle's outcome independently.
2. **Refusal to Resolve Prematurely:** The `src/bridge/` strictly refuses to construct resolution transactions if the evaluation is `UNRESOLVED` (`UnresolvedMarketError`).

---

## 4. Threat Matrix & On-Chain Mitigations

| Threat | Attack Vector | Program Mitigation | Status |
| :--- | :--- | :--- | :--- |
| **Unauthorized Resolution** | Attacker calls `resolve_market` with forged outcome | `has_one = resolver_authority` Anchor constraint checks transaction signer matches market configuration. | **Mitigated** |
| **Premature Resolution** | Resolver attempts to settle market before observation period | `require!(clock.unix_timestamp >= market.resolution_timestamp)` enforces deadline on-chain. | **Mitigated** |
| **Duplicate Resolution** | Resolver or attacker attempts to flip outcome after settlement | `require!(market.status == MarketStatus::Active)` makes state transitions strictly irreversible. | **Mitigated** |
| **Post-Resolution Dilution** | User deposits collateral after outcome is known | `deposit_collateral` strictly requires `market.status == MarketStatus::Active`. | **Mitigated** |
| **Premature Claims** | User attempts to withdraw winnings while market is still active | `claim_winnings` strictly requires `market.status == MarketStatus::Resolved`. | **Mitigated** |
| **Losing Token Drain** | Holder of losing tokens calls `claim_winnings` | Program validates `token_mint` equals winning mint (`yes_mint` if YES, `no_mint` if NO); rejects with `InvalidOutcomeForClaim`. | **Mitigated** |
| **Spoofed Token Claims** | Attacker attempts to claim collateral using a third-party token mint | Program verifies `claim_mint == market.yes_mint \|\| claim_mint == market.no_mint`. | **Mitigated** |
| **Vault Drainage via Account Spoofing** | Attacker passes arbitrary vault or collateral mint in accounts | Anchor constraints `constraint = collateral_vault.key() == market.collateral_vault` and PDA bump validation guarantee only genuine vault is targeted. | **Mitigated** |

---

## 5. Path to Phase 2 Decentralization

For future production and mainnet deployments, the single `resolver_authority` model will evolve into:
1. **Optimistic Settlement with Dispute Bonds (UMA / Custom Protocol):**
   - Anyone can propose an outcome by posting a collateral bond.
   - A multi-day dispute window allows counter-parties to challenge fraudulent proposals.
   - Disputed markets escalate to token-holder voting or an advisory council.
2. **Multi-Oracle Consensus (Switchboard / Pyth):**
   - Multiple independent nodes run the Phase 0 data fetching engine in confidential compute environments (TEE) and submit threshold attestations before resolution can be triggered.
