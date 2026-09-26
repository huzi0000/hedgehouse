use crate::errors::HedgeHouseError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct RedeemPair<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.as_ref()],
        bump = market.bump,
        has_one = collateral_vault @ HedgeHouseError::InvalidVault,
        has_one = yes_mint @ HedgeHouseError::InvalidTokenMint,
        has_one = no_mint @ HedgeHouseError::InvalidTokenMint,
    )]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_collateral.mint == market.collateral_mint @ HedgeHouseError::MismatchedCollateralMint,
        constraint = user_collateral.owner == user.key()
    )]
    pub user_collateral: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = collateral_vault.key() == market.collateral_vault @ HedgeHouseError::InvalidVault,
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = yes_mint.key() == market.yes_mint @ HedgeHouseError::InvalidTokenMint,
    )]
    pub yes_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = no_mint.key() == market.no_mint @ HedgeHouseError::InvalidTokenMint,
    )]
    pub no_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_yes.mint == market.yes_mint @ HedgeHouseError::InvalidTokenMint,
        constraint = user_yes.owner == user.key()
    )]
    pub user_yes: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_no.mint == market.no_mint @ HedgeHouseError::InvalidTokenMint,
        constraint = user_no.owner == user.key()
    )]
    pub user_no: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn process_redeem_pair(ctx: Context<RedeemPair>, amount: u64) -> Result<()> {
    require!(amount > 0, HedgeHouseError::ZeroAmount);

    let market = &mut ctx.accounts.market;

    // Allowed while market is Open (before resolution)
    require!(
        market.status == MarketStatus::Open as u8,
        HedgeHouseError::MarketNotOpen
    );

    require!(
        market.total_collateral >= amount,
        HedgeHouseError::InsufficientCollateral
    );

    // 1. Burn equal YES tokens from user
    let burn_yes_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.yes_mint.to_account_info(),
            from: ctx.accounts.user_yes.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::burn(burn_yes_ctx, amount)?;

    // 2. Burn equal NO tokens from user
    let burn_no_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.no_mint.to_account_info(),
            from: ctx.accounts.user_no.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::burn(burn_no_ctx, amount)?;

    // 3. Return collateral to user from vault (signed by Market PDA)
    let market_id = market.market_id;
    let bump = market.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[MARKET_SEED, market_id.as_ref(), &[bump]]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.collateral_vault.to_account_info(),
            to: ctx.accounts.user_collateral.to_account_info(),
            authority: market.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    // 4. Update accounting safely
    market.total_collateral = market
        .total_collateral
        .checked_sub(amount)
        .ok_or(HedgeHouseError::ArithmeticOverflow)?;

    market.total_matched_pairs = market
        .total_matched_pairs
        .checked_sub(amount)
        .ok_or(HedgeHouseError::ArithmeticOverflow)?;

    msg!(
        "Redeemed matched pair of {} tokens for {} collateral. Remaining collateral: {}",
        amount,
        amount,
        market.total_collateral
    );

    Ok(())
}
