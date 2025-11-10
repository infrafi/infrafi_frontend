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

  // Handle negative values
  const isNegative = bigIntValue < 0n;
  const absValue = isNegative ? -bigIntValue : bigIntValue;
  const sign = isNegative ? '-' : '';

  const divisor = BigInt(10 ** decimals);
  const whole = absValue / divisor;
  const fraction = absValue % divisor;
  const wholeNum = Number(whole); // Convert for comparison with numbers
  
  if (wholeNum >= 1000000) {
    return `${sign}${(wholeNum / 1000000).toFixed(8)}M`;
  } else if (wholeNum >= 1000) {
    return `${sign}${(wholeNum / 1000).toFixed(8)}K`;
  } else if (whole === 0n && fraction === 0n) {
    return isNegative ? "-0.00000000" : "0.00000000";
  } else if (whole === 0n) {
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const significant = fractionStr.replace(/0+$/, '');
    if (significant.length === 0) return isNegative ? "-0.00000000" : "0.00000000";
    return `${sign}0.${significant.slice(0, 8)}`;
  }
  
  // Format with 8 decimal places for testing precision
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const decimalPart = fractionStr.slice(0, 8);
  return `${sign}${whole}.${decimalPart}`;
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
// Format APY from basis points (contract returns basis points: 10000 = 100%)
export function formatAPY(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

// Format utilization percentage from basis points (contract returns basis points: 10000 = 100%)
export function formatUtilization(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

// Format token amounts with full precision (contract returns wei: 18 decimals)
export function formatTokenAmount(value: any, decimals: number = 18): string {
  if (value === undefined || value === null) {
    return "0.000000000000000000";
  }
  
  let bigIntValue: bigint;
  try {
    if (typeof value === 'bigint') {
      bigIntValue = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      bigIntValue = BigInt(value);
    } else {
      console.warn('formatTokenAmount: Invalid value type', typeof value, value);
      return "0.000000000000000000";
    }
  } catch (error) {
    console.warn('formatTokenAmount: Failed to convert to BigInt', value, error);
    return "0.000000000000000000";
  }

  const divisor = BigInt(10 ** decimals);
  const whole = bigIntValue / divisor;
  const fraction = bigIntValue % divisor;
  
  if (fraction === 0n) {
    return `${whole}.000000000000000000`;
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  return `${whole}.${fractionStr}`;
}

// Calculate health factor
export function calculateHealthFactor(collateralValue: bigint, debtValue: bigint, liquidationThreshold: number = 85): number {
  if (debtValue === BigInt(0)) return Infinity;
  
  const adjustedCollateral = collateralValue * BigInt(liquidationThreshold) / BigInt(100);
  return Number(adjustedCollateral) / Number(debtValue);
}

// Calculate LTV (Loan-to-Value) ratio
export function calculateLTV(collateralValue: bigint, debtValue: bigint): number {
  if (collateralValue === BigInt(0)) return 0;
  if (debtValue === BigInt(0)) return 0;
  
  // LTV = (Debt / Collateral) * 100
  // Use Number conversion for percentage calculation
  return (Number(debtValue) / Number(collateralValue)) * 100;
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
