import { useQuery } from '@apollo/client/react'
import { 
  GET_PROTOCOL_STATS, 
  GET_USER_TIMELINE,
  GET_USER_POSITION,
  GET_DAILY_SNAPSHOTS,
  GET_INTEREST_RATE_HISTORY,
  GET_EVENTS_IN_RANGE
} from '@/lib/graphql-queries'

/**
 * Hook to fetch protocol statistics from subgraph
 */
export function useProtocolStats() {
  const { data, loading, error, refetch } = useQuery(GET_PROTOCOL_STATS, {
    pollInterval: 60000, // Poll every 60 seconds (less aggressive)
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
    fetchPolicy: 'cache-and-network', // Always fetch fresh data but show cached data immediately
    // No polling - user timeline doesn't change frequently
  })

  const userData = (data as any)?.user
  const directData = data as any
  
  // Helper to merge and deduplicate events by ID
  const mergeEvents = (userEvents: any[], directEvents: any[]) => {
    const eventMap = new Map()
    // Add direct events first (they might include events not yet in user entity)
    directEvents?.forEach((event: any) => {
      if (event.id) eventMap.set(event.id, event)
    })
    // Add user entity events (they take precedence if duplicates exist)
    userEvents?.forEach((event: any) => {
      if (event.id) eventMap.set(event.id, event)
    })
    return Array.from(eventMap.values()).sort((a: any, b: any) => 
      Number(b.timestamp || 0) - Number(a.timestamp || 0)
    )
  }
  
  // Merge events from user entity and direct queries
  const supplyEvents = mergeEvents(userData?.supplyEvents || [], directData?.supplyEvents || [])
  const withdrawEvents = mergeEvents(userData?.withdrawEvents || [], directData?.withdrawEvents || [])
  const borrowEvents = mergeEvents(userData?.borrowEvents || [], directData?.borrowEvents || [])
  const repayEvents = mergeEvents(userData?.repayEvents || [], directData?.repayEvents || [])
  const nodeDeposits = mergeEvents(userData?.nodeDeposits || [], directData?.nodeDepositEvents || [])
  const nodeWithdrawals = mergeEvents(userData?.nodeWithdrawals || [], directData?.nodeWithdrawalEvents || [])

  return {
    user: userData || null,
    supplyEvents,
    withdrawEvents,
    borrowEvents,
    repayEvents,
    nodeDeposits,
    nodeWithdrawals,
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
    fetchPolicy: 'cache-and-network', // Always fetch fresh data but show cached data immediately
    // No polling - user can manually refresh if needed
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
    pollInterval: 120000, // Poll every 2 minutes (less aggressive)
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
    pollInterval: 120000, // Poll every 2 minutes (less aggressive)
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

/**
 * Hook to fetch all events within a time range for chart markers
 */
export function useEventsInRange(startTime: number) {
  const { data, loading, error, refetch } = useQuery(GET_EVENTS_IN_RANGE, {
    variables: { startTime, first: 1000 },
    skip: !startTime,
    pollInterval: 120000, // Poll every 2 minutes
  })

  return {
    events: {
      supplyEvents: (data as any)?.supplyEvents || [],
      withdrawEvents: (data as any)?.withdrawEvents || [],
      borrowEvents: (data as any)?.borrowEvents || [],
      repayEvents: (data as any)?.repayEvents || [],
      nodeDepositEvents: (data as any)?.nodeDepositEvents || [],
      nodeWithdrawalEvents: (data as any)?.nodeWithdrawalEvents || [],
    },
    isLoading: loading,
    error: error?.message || null,
    refetch,
  }
}

