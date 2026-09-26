use crate::errors::HedgeHouseError;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.as_ref()],
        bump = market.bump,
        has_one = resolver_authority @ HedgeHouseError::UnauthorizedResolver,
    )]
    pub market: Account<'info, Market>,

    /// Must match market.resolver_authority
    pub resolver_authority: Signer<'info>,
}

pub fn process_resolve_market(ctx: Context<ResolveMarket>, outcome: u8) -> Result<()> {
    let market = &mut ctx.accounts.market;

    // Must be currently Open
    require!(
        market.status == MarketStatus::Open as u8,
        HedgeHouseError::MarketAlreadyResolved
    );

    // Outcome must be Yes (1) or No (2)
    require!(
        outcome == MarketOutcome::Yes as u8 || outcome == MarketOutcome::No as u8,
        HedgeHouseError::InvalidOutcome
    );

    let clock = Clock::get()?;

    market.status = MarketStatus::Resolved as u8;
    market.outcome = outcome;
    market.resolved_at = clock.unix_timestamp;

    msg!(
        "Market {} resolved to outcome: {} by resolver authority: {}",
        market.key(),
        if outcome == MarketOutcome::Yes as u8 {
            "YES"
        } else {
            "NO"
        },
        ctx.accounts.resolver_authority.key()
    );

    Ok(())
}
