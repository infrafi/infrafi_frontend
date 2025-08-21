import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format BigInt values for display
export function formatBalance(value: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  if (whole >= 1000000) {
    return `${(Number(whole) / 1000000).toFixed(2)}M`;
  } else if (whole >= 1000) {
    return `${(Number(whole) / 1000).toFixed(2)}K`;
  } else if (whole === 0n && fraction === 0n) {
    return "0";
  } else if (whole === 0n) {
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const significant = fractionStr.replace(/0+$/, '');
    if (significant.length === 0) return "0";
    return `0.${significant.slice(0, 6)}`;
  }
  
  return whole.toString();
}

// Parse user input to BigInt
export function parseBalance(value: string, decimals: number = 18): bigint {
  if (!value || value === '') return BigInt(0);
  
  try {
    const cleanValue = value.replace(/,/g, '');
    const [whole, fraction = ''] = cleanValue.split('.');
    const wholeBigInt = BigInt(whole || '0') * BigInt(10 ** decimals);
    
    if (fraction) {
      const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
      const fractionBigInt = BigInt(fractionPadded);
      return wholeBigInt + fractionBigInt;
    }
    
    return wholeBigInt;
  } catch {
    return BigInt(0);
  }
}

// Format APY percentage
export function formatAPY(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

// Format utilization percentage
export function formatUtilization(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(1)}%`;
}

// Calculate health factor
export function calculateHealthFactor(collateralValue: bigint, debtValue: bigint, liquidationThreshold: number = 85): number {
  if (debtValue === BigInt(0)) return Infinity;
  
  const adjustedCollateral = collateralValue * BigInt(liquidationThreshold) / BigInt(100);
  return Number(adjustedCollateral) / Number(debtValue);
}

// Validate amount input
export function validateAmount(amount: string, maxAmount: bigint, decimals: number = 18): { isValid: boolean; error?: string } {
  if (!amount || amount === '0') {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  try {
    const parsedAmount = parseBalance(amount, decimals);
    if (parsedAmount > maxAmount) {
      return { isValid: false, error: 'Amount exceeds maximum' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid amount format' };
  }
}
