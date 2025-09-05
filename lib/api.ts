// API service for interacting with the VeitFlare backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type TokenType = 'SOL' | 'USDC' | 'BONK' | 'USDT' | 'JUP' | 'RAY' | 'USDG';

// Token information with decimals
export const TOKEN_INFO: Record<TokenType, { 
  name: string; 
  decimals: number;
  mintAddress: string;
}> = {
  SOL: {
    name: 'Solana',
    decimals: 9,
    mintAddress: 'So11111111111111111111111111111111111111112',
  },
  USDC: {
    name: 'USD Coin',
    decimals: 6,
    mintAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  },
  BONK: {
    name: 'Bonk',
    decimals: 9,
    mintAddress: '38EAcMu2J1TN1aM6jSFfRUf5CHD64MsLDvx7C7k6zsV9',
  },
  USDT: {
    name: 'Tether',
    decimals: 9,
    mintAddress: 'CkUbey4AoxnLu7psBjjgiHshngDaJdRiQt5zbVsy9u76',
  },
  JUP: {
    name: 'Jupiter',
    decimals: 9,
    mintAddress: 'HL91BvakPJeTC4H7PbXEFgef7xcwXPXv1Qan1eaekAfe',
  },
  RAY: {
    name: 'Raydium',
    decimals: 9,
    mintAddress: '5J6jgzzu6RZ5mYPPdikwHH3B8Q4uPKrMPDKkWL4CWSa9',
  },
  USDG: {
    name: 'USDG',
    decimals: 9,
    mintAddress: 'G4GmojHbxac6CVXnJPoVkPGVTAGCCTN27hMGgtqMBget',
  },
};

// Get all token balances for a user
export async function getWalletBalances(ownerPublicKey: string): Promise<Record<TokenType, number>> {
  const response = await fetch(`${API_BASE_URL}/wallets/balances?ownerPublicKey=${ownerPublicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch wallet balances');
  }
  const data = await response.json();
  return data.balances;
}

// Format token amount with correct decimals
export function formatTokenAmount(amount: number, tokenType: TokenType): string {
  const tokenInfo = TOKEN_INFO[tokenType];
  if (!tokenInfo) return amount.toString();
  
  if (tokenType === 'SOL') {
    // For SOL, amount is in lamports, convert to SOL
    const solAmount = amount / Math.pow(10, tokenInfo.decimals);
    return solAmount.toFixed(9).replace(/\.?0+$/, '');
  }
  
  const decimalAmount = amount / Math.pow(10, tokenInfo.decimals);
  return decimalAmount.toFixed(tokenInfo.decimals).replace(/\.?0+$/, '');
}

// Create a new time-locked wallet
export async function createWallet(
  owner: string,
  name: string,
  amount: number,
  tokenType: TokenType,
  unlockTimestamp: number,
  recipientAddress?: string
): Promise<{ transaction: string }> {
  const response = await fetch(`${API_BASE_URL}/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      owner,
      name,
      amount,
      tokenType,
      unlockTimestamp,
      recipientAddress,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create wallet');
  }

  return response.json();
}

// Withdraw funds from a wallet
export async function withdrawFunds(
  recipient: string,
  ownerPublicKey: string,
  tokenType: TokenType
): Promise<{ transaction: string }> {
  const response = await fetch(`${API_BASE_URL}/wallets/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      recipient,
      ownerPublicKey,
      tokenType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to withdraw funds');
  }

  return response.json();
}

// Get all wallets for a user and map to the frontend Wallet type
export async function getUserWallets(ownerPublicKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/wallets?ownerPublicKey=${ownerPublicKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return []; // Handle not found gracefully
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user wallets');
  }

  const text = await response.text();
  if (!text) {
    return []; // Handle empty response body
  }

  const data = JSON.parse(text);
  if (!data.wallets || data.wallets.length === 0) {
    return [];
  }

  // Map the raw backend wallet data to the format the dashboard page expects
  return data.wallets.map((wallet: any) => {
    const unlockDate = new Date(wallet.unlockTimestamp * 1000);
    const createdAt = new Date(); // Placeholder, as backend doesn't provide this
    const totalLockDuration = unlockDate.getTime() - createdAt.getTime();
    
    return {
      id: wallet.id,
      name: wallet.name || 'My Time-Locked Wallet',
      amount: wallet.amount,
      unlockDate: unlockDate,
      status: wallet.isUnlocked ? 'unlocked' : 'locked',
      createdAt: createdAt,
      totalLockDuration: totalLockDuration,
      owner: wallet.owner,
      recipient: wallet.recipient,
      tokenType: wallet.tokenType,
      actualBalance: wallet.actualBalance,
    };
  });
}
