use crate::errors::HedgeHouseError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreateMarketParams {
    pub market_id: [u8; 32],
    pub country_code: [u8; 4],
    pub region_id: [u8; 32],
    pub provider_id: [u8; 16],
    pub series_id: [u8; 32],
    pub baseline_period: [u8; 16],
    pub target_period: [u8; 16],
    pub comparison_type: u8,
    pub threshold_bps: i32,
    pub resolution_deadline: i64,
    pub resolver_authority: Pubkey,
}

#[derive(Accounts)]
#[instruction(params: CreateMarketParams)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = Market::LEN,
        seeds = [MARKET_SEED, params.market_id.as_ref()],
        bump
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub collateral_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
        token::mint = collateral_mint,
        token::authority = market
    )]
    pub collateral_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        seeds = [YES_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = collateral_mint.decimals,
        mint::authority = market
    )]
    pub yes_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        seeds = [NO_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = collateral_mint.decimals,
        mint::authority = market
    )]
    pub no_mint: Box<Account<'info, Mint>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn process_create_market(ctx: Context<CreateMarket>, params: CreateMarketParams) -> Result<()> {
    let clock = Clock::get()?;

    // Validation 1: Periods cannot be identical
    require!(
        params.baseline_period != params.target_period,
        HedgeHouseError::InvalidPeriods
    );

    // Validation 2: Comparison type in range 0..=3
    require!(
        params.comparison_type <= 3,
        HedgeHouseError::InvalidComparisonType
    );

    // Validation 3: Resolution deadline must be in the future
    require!(
        params.resolution_deadline > clock.unix_timestamp,
        HedgeHouseError::InvalidResolutionDeadline
    );

    // Validation 4: Non-empty identifiers
    require!(
        params.market_id != [0u8; 32],
        HedgeHouseError::EmptyMetadata
    );

    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.market_id = params.market_id;
    market.country_code = params.country_code;
    market.region_id = params.region_id;
    market.provider_id = params.provider_id;
    market.series_id = params.series_id;
    market.baseline_period = params.baseline_period;
    market.target_period = params.target_period;
    market.comparison_type = params.comparison_type;
    market.threshold_bps = params.threshold_bps;

    market.yes_mint = ctx.accounts.yes_mint.key();
    market.no_mint = ctx.accounts.no_mint.key();
    market.collateral_mint = ctx.accounts.collateral_mint.key();
    market.collateral_vault = ctx.accounts.collateral_vault.key();

    market.total_collateral = 0;
    market.total_matched_pairs = 0;

    market.status = MarketStatus::Open as u8;
    market.outcome = MarketOutcome::Unresolved as u8;

    market.created_at = clock.unix_timestamp;
    market.resolution_deadline = params.resolution_deadline;
    market.resolved_at = 0;
    market.resolver_authority = params.resolver_authority;

    market.bump = ctx.bumps.market;
    market.vault_bump = ctx.bumps.collateral_vault;
    market.yes_mint_bump = ctx.bumps.yes_mint;
    market.no_mint_bump = ctx.bumps.no_mint;

    msg!(
        "Market created successfully. Market PDA: {}, Resolver: {}",
        market.key(),
        market.resolver_authority
    );

    Ok(())
}
