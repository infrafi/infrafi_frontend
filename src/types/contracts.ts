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
  id: number;
  owner: string;
  stakedAmount: bigint;
  rewards: bigint;
  isActive: boolean;
}

export interface TransactionState {
  isLoading: boolean;
  error: string | null;
}

export type TransactionFunction = (amount: string) => Promise<void>;
