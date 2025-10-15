import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format BigInt values for display (with robust type conversion)
export function formatBalance(value: any, decimals: number = 18): string {
  if (value === undefined || value === null) {
    return "0";
  }
  
  let bigIntValue: bigint;
  try {
    if (typeof value === 'bigint') {
      bigIntValue = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      bigIntValue = BigInt(value);
    } else {
      console.warn('formatBalance: Invalid value type', typeof value, value);
      return "0";
    }
  } catch (error) {
    console.warn('formatBalance: Failed to convert to BigInt', value, error);
    return "0";
  }

  const divisor = BigInt(10 ** decimals);
  const whole = bigIntValue / divisor;
  const fraction = bigIntValue % divisor;
  const wholeNum = Number(whole); // Convert for comparison with numbers
  
  if (wholeNum >= 1000000) {
    return `${(wholeNum / 1000000).toFixed(8)}M`;
  } else if (wholeNum >= 1000) {
    return `${(wholeNum / 1000).toFixed(8)}K`;
  } else if (whole === 0n && fraction === 0n) {
    return "0.00000000";
  } else if (whole === 0n) {
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const significant = fractionStr.replace(/0+$/, '');
    if (significant.length === 0) return "0.00000000";
    return `0.${significant.slice(0, 8)}`;
  }
  
  // Format with 8 decimal places for testing precision
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const decimalPart = fractionStr.slice(0, 8);
  return `${whole}.${decimalPart}`;
}

// Convert BigInt to plain decimal string (for input fields)
export function bigIntToDecimal(value: any, decimals: number = 18): string {
  if (value === undefined || value === null) {
    return "0";
  }
  
  let bigIntValue: bigint;
  try {
    if (typeof value === 'bigint') {
      bigIntValue = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      bigIntValue = BigInt(value);
    } else {
      console.warn('bigIntToDecimal: Invalid value type', typeof value, value);
      return "0";
    }
  } catch (error) {
    console.warn('bigIntToDecimal: Failed to convert to BigInt', value, error);
    return "0";
  }

  const divisor = BigInt(10 ** decimals);
  const whole = bigIntValue / divisor;
  const fraction = bigIntValue % divisor;
  
  if (fraction === 0n) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  
  return `${whole}.${trimmedFraction}`;
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
  return `${(basisPoints / 100).toFixed(8)}%`;
}

// Format utilization percentage
export function formatUtilization(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(8)}%`;
}

// Calculate health factor
export function calculateHealthFactor(collateralValue: bigint, debtValue: bigint, liquidationThreshold: number = 85): number {
  if (debtValue === BigInt(0)) return Infinity;
  
  const adjustedCollateral = collateralValue * BigInt(liquidationThreshold) / BigInt(100);
  return Number(adjustedCollateral) / Number(debtValue);
}

// Validate amount input
export function validateAmount(amount: string, maxAmount: any, decimals: number = 18): { isValid: boolean; error?: string } {
  if (!amount || amount === '0') {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  try {
    const parsedAmount = parseBalance(amount, decimals);
    
    // Convert maxAmount to BigInt safely
    let maxBigInt: bigint;
    if (typeof maxAmount === 'bigint') {
      maxBigInt = maxAmount;
    } else if (typeof maxAmount === 'string' || typeof maxAmount === 'number') {
      maxBigInt = BigInt(maxAmount);
    } else {
      console.warn('validateAmount: Invalid maxAmount type', typeof maxAmount, maxAmount);
      return { isValid: false, error: 'Invalid maximum amount' };
    }
    
    if (parsedAmount > maxBigInt) {
      return { isValid: false, error: 'Amount exceeds maximum' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid amount format' };
  }
}
