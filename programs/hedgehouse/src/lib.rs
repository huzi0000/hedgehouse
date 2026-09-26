use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

pub use errors::*;
pub use instructions::*;
pub use state::*;

declare_id!("J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi");

#[program]
pub mod hedgehouse {
    use super::*;

    /// Initializes a new generic housing market, collateral vault, and YES/NO position mints.
    pub fn create_market(ctx: Context<CreateMarket>, params: CreateMarketParams) -> Result<()> {
        process_create_market(ctx, params)
    }

    /// Deposits collateral and mints matched 1 YES + 1 NO position tokens.
    pub fn deposit_collateral(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
        process_deposit_collateral(ctx, amount)
    }

    /// Burns a matched pair of 1 YES + 1 NO position tokens to redeem 1 collateral before resolution.
    pub fn redeem_pair(ctx: Context<RedeemPair>, amount: u64) -> Result<()> {
        process_redeem_pair(ctx, amount)
    }

    /// Resolves an open market to YES or NO. Only callable by resolver_authority.
    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: u8) -> Result<()> {
        process_resolve_market(ctx, outcome)
    }

    /// Burns winning position tokens to claim collateral after market resolution.
    pub fn claim_winnings(ctx: Context<ClaimWinnings>, amount: u64) -> Result<()> {
        process_claim_winnings(ctx, amount)
    }
}
