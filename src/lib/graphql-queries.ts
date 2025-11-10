import { gql } from '@apollo/client'

/**
 * Query protocol-wide statistics
 */
export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    protocol(id: "1") {
      totalLiquidity
      totalDebt
      totalCollateralValue
      totalNodesDeposited
      supplyAPY
      borrowAPY
      utilizationRate
      totalUsers
      totalLenders
      totalBorrowers
      lastUpdateTimestamp
    }
  }
`

/**
 * Query user position and activity
 */
export const GET_USER_POSITION = gql`
  query GetUserPosition($address: ID!) {
    user(id: $address) {
      address
      totalSupplied
      totalSupplyInterest
      totalBorrowed
      totalBorrowInterest
      collateralValue
      depositedNodesCount
      isLender
      isBorrower
      firstInteractionTimestamp
      lastInteractionTimestamp
    }
  }
`

/**
 * Query user complete activity timeline
 * Uses both user entity (if exists) and direct event queries as fallback
 */
export const GET_USER_TIMELINE = gql`
  query GetUserTimeline($address: ID!, $first: Int = 100) {
    user(id: $address) {
      address
      
      supplyEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
      }
      
      withdrawEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        principalAmount
        interestAmount
        timestamp
        blockNumber
        transactionHash
      }
      
      borrowEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
      }
      
      repayEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
      }
      
      nodeDeposits(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        nodeId
        nodeType
        assetValue
        timestamp
        blockNumber
        transactionHash
      }
      
      nodeWithdrawals(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        nodeId
        nodeType
        timestamp
        blockNumber
        transactionHash
      }
    }
    
    # Fallback: Query events directly if user entity doesn't exist or has no events
    supplyEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    withdrawEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      principalAmount
      interestAmount
      timestamp
      blockNumber
      transactionHash
    }
    
    borrowEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    repayEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    nodeDepositEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      nodeId
      nodeType
      assetValue
      timestamp
      blockNumber
      transactionHash
    }
    
    nodeWithdrawalEvents(
      where: { user: $address }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      nodeId
      nodeType
      timestamp
      blockNumber
      transactionHash
    }
  }
`

/**
 * Query recent protocol events
 */
export const GET_RECENT_EVENTS = gql`
  query GetRecentEvents($first: Int = 10) {
    supplyEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    borrowEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    nodeDepositEvents(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        address
      }
      nodeId
      nodeType
      assetValue
      timestamp
      transactionHash
    }
  }
`

/**
 * Query interest rate history for charts
 */
export const GET_INTEREST_RATE_HISTORY = gql`
  query GetInterestRateHistory($first: Int = 100) {
    interestRateSnapshots(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      supplyAPY
      borrowAPY
      utilizationRate
      borrowIndex
      supplyIndex
      totalLiquidity
      totalDebt
      blockNumber
    }
  }
`

/**
 * Query daily snapshots for historical charts
 */
export const GET_DAILY_SNAPSHOTS = gql`
  query GetDailySnapshots($days: Int = 30) {
    dailySnapshots(
      first: $days
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      totalLiquidity
      totalDebt
      totalCollateralValue
      supplyAPY
      borrowAPY
      utilizationRate
      activeUsers
      activeLenders
      activeBorrowers
      totalNodesDeposited
      suppliesCount
      withdrawalsCount
      borrowsCount
      repaysCount
      nodeDepositsCount
      nodeWithdrawalsCount
      supplyVolume
      withdrawVolume
      borrowVolume
      repayVolume
    }
  }
`

/**
 * Query user's deposited nodes
 */
export const GET_USER_NODES = gql`
  query GetUserNodes($address: ID!) {
    user(id: $address) {
      address
      depositedNodesCount
      nodeDeposits(orderBy: timestamp, orderDirection: desc) {
        id
        nodeId
        nodeType
        assetValue
        timestamp
        transactionHash
      }
    }
  }
`

/**
 * Query top lenders
 */
export const GET_TOP_LENDERS = gql`
  query GetTopLenders($first: Int = 10) {
    users(
      where: { isLender: true }
      first: $first
      orderBy: totalSupplied
      orderDirection: desc
    ) {
      address
      totalSupplied
      totalSupplyInterest
      supplyEvents(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`

/**
 * Query top borrowers
 */
export const GET_TOP_BORROWERS = gql`
  query GetTopBorrowers($first: Int = 10) {
    users(
      where: { isBorrower: true }
      first: $first
      orderBy: totalBorrowed
      orderDirection: desc
    ) {
      address
      totalBorrowed
      totalBorrowInterest
      collateralValue
      depositedNodesCount
    }
  }
`

/**
 * Query all events within a time range for chart markers
 */
export const GET_EVENTS_IN_RANGE = gql`
  query GetEventsInRange($startTime: Int!, $first: Int = 1000) {
    supplyEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    withdrawEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    borrowEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    repayEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      amount
      timestamp
      transactionHash
    }
    
    nodeDepositEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      nodeId
      nodeType
      assetValue
      timestamp
      transactionHash
    }
    
    nodeWithdrawalEvents(
      where: { timestamp_gte: $startTime }
      first: $first
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user {
        address
      }
      nodeId
      nodeType
      timestamp
      transactionHash
    }
  }
`

