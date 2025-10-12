import { useQuery } from '@apollo/client/react'
import { 
  GET_PROTOCOL_STATS, 
  GET_USER_TIMELINE,
  GET_USER_POSITION,
  GET_DAILY_SNAPSHOTS,
  GET_INTEREST_RATE_HISTORY
} from '@/lib/graphql-queries'

/**
 * Hook to fetch protocol statistics from subgraph
 */
export function useProtocolStats() {
  const { data, loading, error, refetch } = useQuery(GET_PROTOCOL_STATS, {
    pollInterval: 30000, // Poll every 30 seconds
  })

  return {
    protocolStats: (data as any)?.protocol || null,
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Hook to fetch user activity timeline from subgraph
 */
export function useUserTimeline(address: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_USER_TIMELINE, {
    variables: { address: address?.toLowerCase() || '' },
    skip: !address,
    pollInterval: 15000, // Poll every 15 seconds
  })

  const userData = (data as any)?.user

  return {
    user: userData || null,
    supplyEvents: userData?.supplyEvents || [],
    withdrawEvents: userData?.withdrawEvents || [],
    borrowEvents: userData?.borrowEvents || [],
    repayEvents: userData?.repayEvents || [],
    nodeDeposits: userData?.nodeDeposits || [],
    nodeWithdrawals: userData?.nodeWithdrawals || [],
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Hook to fetch user position from subgraph
 */
export function useUserPosition(address: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_USER_POSITION, {
    variables: { address: address?.toLowerCase() || '' },
    skip: !address,
    pollInterval: 15000,
  })

  return {
    userPosition: (data as any)?.user || null,
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Hook to fetch daily snapshots for charts
 */
export function useDailySnapshots(days: number = 30) {
  const { data, loading, error, refetch } = useQuery(GET_DAILY_SNAPSHOTS, {
    variables: { days },
    pollInterval: 60000, // Poll every minute
  })

  return {
    snapshots: (data as any)?.dailySnapshots || [],
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Hook to fetch interest rate history for charts
 */
export function useInterestRateHistory(first: number = 100) {
  const { data, loading, error, refetch } = useQuery(GET_INTEREST_RATE_HISTORY, {
    variables: { first },
    pollInterval: 60000,
  })

  return {
    snapshots: (data as any)?.interestRateSnapshots || [],
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Combined hook for all user data (on-chain + subgraph)
 */
export function useUserData(address: string | null) {
  const position = useUserPosition(address)
  const timeline = useUserTimeline(address)

  return {
    position: position.userPosition,
    timeline: {
      supplyEvents: timeline.supplyEvents,
      withdrawEvents: timeline.withdrawEvents,
      borrowEvents: timeline.borrowEvents,
      repayEvents: timeline.repayEvents,
      nodeDeposits: timeline.nodeDeposits,
      nodeWithdrawals: timeline.nodeWithdrawals,
    },
    isLoading: position.isLoading || timeline.isLoading,
    error: position.error || timeline.error,
    refetch: () => {
      position.refetch()
      timeline.refetch()
    },
  }
}

