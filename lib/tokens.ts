// Curated registry of top ERC-20 tokens per chain.
// Each entry maps an on-chain token to the CoinGecko ID we already fetch
// in the dashboard, so wallet balances can be priced without extra API calls.
//
// Wrapped tokens (WETH, WBTC, cbETH) are intentionally mapped to their
// underlying CoinGecko ID — they trade at the same price and the underlying
// is more likely to be present in the top-coins list the UI fetches.

import type { Address } from "viem";

export type TokenEntry = {
  symbol: string;
  address: Address;
  decimals: number;
  coinGeckoId: string;
};

export type NativeEntry = {
  symbol: string;
  decimals: number;
  coinGeckoId: string;
};

// Native (gas) token for each supported chain.
export const NATIVE_BY_CHAIN: Record<number, NativeEntry> = {
  1: { symbol: "ETH", decimals: 18, coinGeckoId: "ethereum" },
  42161: { symbol: "ETH", decimals: 18, coinGeckoId: "ethereum" },
  8453: { symbol: "ETH", decimals: 18, coinGeckoId: "ethereum" },
  10: { symbol: "ETH", decimals: 18, coinGeckoId: "ethereum" },
  137: { symbol: "MATIC", decimals: 18, coinGeckoId: "matic-network" },
};

export const TOKENS_BY_CHAIN: Record<number, TokenEntry[]> = {
  // Ethereum mainnet
  1: [
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, coinGeckoId: "tether" },
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, coinGeckoId: "usd-coin" },
    { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, coinGeckoId: "dai" },
    { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, coinGeckoId: "bitcoin" },
    { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, coinGeckoId: "chainlink" },
    { symbol: "UNI", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, coinGeckoId: "uniswap" },
    { symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18, coinGeckoId: "aave" },
    { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18, coinGeckoId: "shiba-inu" },
    { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18, coinGeckoId: "pepe" },
    { symbol: "MATIC", address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", decimals: 18, coinGeckoId: "matic-network" },
  ],

  // Arbitrum One
  42161: [
    { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, coinGeckoId: "tether" },
    { symbol: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, coinGeckoId: "usd-coin" },
    { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "WBTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8, coinGeckoId: "bitcoin" },
    { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, coinGeckoId: "arbitrum" },
    { symbol: "LINK", address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", decimals: 18, coinGeckoId: "chainlink" },
  ],

  // Base
  8453: [
    { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, coinGeckoId: "usd-coin" },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "cbETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, coinGeckoId: "dai" },
  ],

  // Optimism
  10: [
    { symbol: "USDT", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, coinGeckoId: "tether" },
    { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, coinGeckoId: "usd-coin" },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "OP", address: "0x4200000000000000000000000000000000000042", decimals: 18, coinGeckoId: "optimism" },
    { symbol: "DAI", address: "0xDA10009cBd5D07dD0CeCc66161FC93D7c9000da1", decimals: 18, coinGeckoId: "dai" },
  ],

  // Polygon
  137: [
    { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, coinGeckoId: "tether" },
    { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, coinGeckoId: "usd-coin" },
    { symbol: "DAI", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, coinGeckoId: "dai" },
    { symbol: "WETH", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, coinGeckoId: "ethereum" },
    { symbol: "WBTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8, coinGeckoId: "bitcoin" },
    { symbol: "LINK", address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", decimals: 18, coinGeckoId: "chainlink" },
  ],
};
