use anchor_lang::prelude::*;

pub const MARKET_SEED: &[u8] = b"market";
pub const VAULT_SEED: &[u8] = b"vault";
pub const YES_MINT_SEED: &[u8] = b"yes_mint";
pub const NO_MINT_SEED: &[u8] = b"no_mint";

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum MarketStatus {
    Open = 0,
    Resolved = 1,
    Cancelled = 2,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum MarketOutcome {
    Unresolved = 0,
    Yes = 1,
    No = 2,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum ComparisonType {
    TargetLtBaseline = 0,
    TargetGtBaseline = 1,
    YoyChangeGt = 2,
    YoyChangeLt = 3,
}

#[account]
#[derive(Default)]
pub struct Market {
    /// Authority that created the market
    pub authority: Pubkey, // 32

    /// Unique 32-byte market identifier
    pub market_id: [u8; 32], // 32

    /// ISO country code (e.g. "US\0\0", "GB\0\0", "SG\0\0", "AU\0\0")
    pub country_code: [u8; 4], // 4

    /// Bounded region identifier (e.g. "33124", "london", "SG", "1GSYD")
    pub region_id: [u8; 32], // 32

    /// Bounded statistical provider identifier (e.g. "FHFA", "UKHPI", "URA", "ABS")
    pub provider_id: [u8; 16], // 16

    /// Bounded series identifier
    pub series_id: [u8; 32], // 32

    /// Baseline period string (e.g. "2025-Q2\0\0\0\0\0\0\0\0\0")
    pub baseline_period: [u8; 16], // 16

    /// Target period string (e.g. "2026-Q2\0\0\0\0\0\0\0\0\0")
    pub target_period: [u8; 16], // 16

    /// Deterministic comparison rule (0=LT, 1=GT, 2=YoY_GT, 3=YoY_LT)
    pub comparison_type: u8, // 1

    /// Threshold in basis points (1 bp = 0.01%, e.g., 200 = 2.00%)
    pub threshold_bps: i32, // 4

    /// SPL Token Mint for YES position tokens
    pub yes_mint: Pubkey, // 32

    /// SPL Token Mint for NO position tokens
    pub no_mint: Pubkey, // 32

    /// Collateral token mint (e.g. Mock USDC)
    pub collateral_mint: Pubkey, // 32

    /// Token account holding deposited collateral
    pub collateral_vault: Pubkey, // 32

    /// Total collateral locked in vault (atomic token units)
    pub total_collateral: u64, // 8

    /// Total matched pairs currently in existence
    pub total_matched_pairs: u64, // 8

    /// Market state machine: Open(0), Resolved(1), Cancelled(2)
    pub status: u8, // 1

    /// Market outcome: Unresolved(0), Yes(1), No(2)
    pub outcome: u8, // 1

    /// Creation timestamp
    pub created_at: i64, // 8

    /// Resolution deadline (Unix timestamp)
    pub resolution_deadline: i64, // 8

    /// Resolution timestamp (0 if unresolved)
    pub resolved_at: i64, // 8

    /// Authorized resolver public key
    pub resolver_authority: Pubkey, // 32

    /// Market PDA bump seed
    pub bump: u8, // 1

    /// Collateral vault PDA bump seed
    pub vault_bump: u8, // 1

    /// YES mint PDA bump seed
    pub yes_mint_bump: u8, // 1

    /// NO mint PDA bump seed
    pub no_mint_bump: u8, // 1
}

impl Market {
    /// Exact space calculation for Market account:
    /// Discriminator: 8
    /// + 32 (authority) + 32 (market_id) + 4 (country_code) + 32 (region_id)
    /// + 16 (provider_id) + 32 (series_id) + 16 (baseline_period) + 16 (target_period)
    /// + 1 (comparison_type) + 4 (threshold_bps) + 32 (yes_mint) + 32 (no_mint)
    /// + 32 (collateral_mint) + 32 (collateral_vault) + 8 (total_collateral)
    /// + 8 (total_matched_pairs) + 1 (status) + 1 (outcome) + 8 (created_at)
    /// + 8 (resolution_deadline) + 8 (resolved_at) + 32 (resolver_authority)
    /// + 1 (bump) + 1 (vault_bump) + 1 (yes_mint_bump) + 1 (no_mint_bump)
    /// Total = 8 + 392 = 400 bytes.
    pub const LEN: usize = 8 + 392;
}
