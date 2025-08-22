import { BigNumberish } from 'ethers';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  chainId: number | null;
}

export interface ProtocolStats {
  totalSupplied: bigint;
  totalBorrowed: bigint;
  utilizationRate: number;
  supplyAPY: number;
  borrowAPY: number;
}

export interface UserPosition {
  woortBalance: bigint;
  supplied: bigint;
  borrowed: bigint;
  maxBorrowAmount: bigint;
}

export interface OortNode {
  id: bigint; // Changed to bigint since we're using address as ID
  owner: string;
  stakedAmount: bigint; // Original pledge amount
  rewards: bigint; // Total earned rewards
  isActive: boolean;
  // Additional rich data from OORT contract
  nodeAddress: string;
  balance: bigint; // pledge + rewards (total asset value)
  lockedRewards: bigint;
  maxPledge: bigint;
  endTime: number;
  nodeType: number;
  lockTime: number;
}

export interface TransactionState {
  isLoading: boolean;
  error: string | null;
}

export type TransactionFunction = (amount: string) => Promise<void>;
