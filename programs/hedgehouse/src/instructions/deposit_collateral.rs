use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::HedgeHouseError;

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.as_ref()],
        bump = market.bump,
        has_one = collateral_mint @ HedgeHouseError::MismatchedCollateralMint,
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

    pub collateral_mint: Account<'info, Mint>,

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

pub fn handler(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
    require!(amount > 0, HedgeHouseError::ZeroAmount);

    let market = &mut ctx.accounts.market;

    // Must be Open
    require!(
        market.status == MarketStatus::Open as u8,
        HedgeHouseError::MarketNotOpen
    );

    // 1. Transfer collateral from user to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_collateral.to_account_info(),
            to: ctx.accounts.collateral_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // 2. Mint matched pair: 1 YES and 1 NO per unit of collateral deposited
    let market_id = market.market_id;
    let bump = market.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        MARKET_SEED,
        market_id.as_ref(),
        &[bump],
    ]];

    // Mint YES tokens
    let mint_yes_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.yes_mint.to_account_info(),
            to: ctx.accounts.user_yes.to_account_info(),
            authority: market.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_yes_ctx, amount)?;

    // Mint NO tokens
    let mint_no_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.no_mint.to_account_info(),
            to: ctx.accounts.user_no.to_account_info(),
            authority: market.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_no_ctx, amount)?;

    // 3. Update accounting safely
    market.total_collateral = market
        .total_collateral
        .checked_add(amount)
        .ok_or(HedgeHouseError::ArithmeticOverflow)?;

    market.total_matched_pairs = market
        .total_matched_pairs
        .checked_add(amount)
        .ok_or(HedgeHouseError::ArithmeticOverflow)?;

    msg!(
        "Deposited {} collateral, minted {} YES and {} NO tokens. Total collateral: {}",
        amount,
        amount,
        amount,
        market.total_collateral
    );

    Ok(())
}
