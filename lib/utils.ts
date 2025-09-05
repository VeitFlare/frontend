import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TOKEN_INFO, TokenType } from '@/lib/api';

// Function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format token amount with correct decimals
export function formatTokenAmount(amount: number, tokenType: TokenType): string {
  const tokenInfo = TOKEN_INFO[tokenType];
  if (!tokenInfo) return amount.toString();
  
  // Convert from raw amount to decimal amount
  const decimalAmount = amount / Math.pow(10, tokenInfo.decimals);
  return decimalAmount.toFixed(tokenInfo.decimals);
}

// Function to convert from decimal amount to raw amount
export function convertToRawAmount(amount: number, tokenType: TokenType): number {
  const tokenInfo = TOKEN_INFO[tokenType];
  if (!tokenInfo) return amount;
  
  // Convert from decimal amount to raw amount
  return Math.round(amount * Math.pow(10, tokenInfo.decimals));
}

// Function to get token icon URL (using generic icons for now)
export function getTokenIcon(tokenType: TokenType): string {
  // In a real app, you would use actual token icons
  const iconMap: Record<TokenType, string> = {
    SOL: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    USDC: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    BONK: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
    USDT: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    JUP: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
    RAY: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    USDG: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/USDGdSUr2b4hx6ABF5pXb17NgxiqPoeE6FGzUvJSHKb/logo.png',
  };
  
  return iconMap[tokenType] || '';
}