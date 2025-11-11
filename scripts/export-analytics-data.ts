#!/usr/bin/env ts-node
/**
 * Export Analytics Data Script
 * 
 * Pulls all events and corresponding interest rate data from the subgraph
 * and exports to CSV for debugging and analysis.
 * 
 * Usage:
 *   npm run export-data
 *   npm run export-data -- --days 7
 *   npm run export-data -- --output ./debug-data.csv
 */

import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client'
import fetch from 'cross-fetch'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://34.150.61.246:8000/subgraphs/name/infrafi/infrafi-testnet'
const DEFAULT_DAYS = 30
const DEFAULT_OUTPUT = './analytics-export.csv'

// Parse command line arguments
const args = process.argv.slice(2)
const daysArg = args.find(arg => arg.startsWith('--days='))
const outputArg = args.find(arg => arg.startsWith('--output='))
const DAYS = daysArg ? parseInt(daysArg.split('=')[1]) : DEFAULT_DAYS
const OUTPUT_FILE = outputArg ? outputArg.split('=')[1] : DEFAULT_OUTPUT

// Initialize Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL, fetch }),
  cache: new InMemoryCache(),
})

// GraphQL Queries
const GET_ALL_EVENTS = gql`
  query GetAllEvents($startTime: Int!) {
    supplyEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    withdrawEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    borrowEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    repayEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      amount
      timestamp
      blockNumber
      transactionHash
    }
    
    nodeDepositEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      nodeId
      nodeType
      assetValue
      timestamp
      blockNumber
      transactionHash
    }
    
    nodeWithdrawalEvents(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      user { address }
      nodeId
      nodeType
      assetValue
      timestamp
      blockNumber
      transactionHash
    }
  }
`

const GET_INTEREST_RATE_SNAPSHOTS = gql`
  query GetInterestRateSnapshots($startTime: Int!) {
    interestRateSnapshots(
      where: { timestamp_gte: $startTime }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      timestamp
      blockNumber
      supplyAPY
      borrowAPY
      utilizationRate
      borrowIndex
      supplyIndex
      totalLiquidity
      totalDebt
    }
  }
`

// Types
interface Event {
  id: string
  timestamp: number
  blockNumber: number
  transactionHash: string
  type: string
  user: string
  amount?: string
  nodeId?: string
  nodeType?: string
  assetValue?: string
}

interface RateSnapshot {
  timestamp: number
  blockNumber: number
  supplyAPY: string
  borrowAPY: string
  utilizationRate: string
  borrowIndex: string
  supplyIndex: string
  totalLiquidity: string
  totalDebt: string
}

interface CombinedData {
  blockNumber: number
  timestamp: number
  dateTime: string
  eventType: string
  eventUser: string
  eventAmount: string
  eventTxHash: string
  supplyAPYBefore: string
  borrowAPYBefore: string
  supplyAPYAfter: string
  borrowAPYAfter: string
  supplyAPYChange: string
  borrowAPYChange: string
  utilizationBefore: string
  utilizationAfter: string
  borrowIndexBefore: string
  supplyIndexBefore: string
  borrowIndexAfter: string
  supplyIndexAfter: string
  totalLiquidity: string
  totalDebt: string
  secondsSinceLastEvent: number
}

// Helper Functions
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString()
}

function formatAmount(amount: string | undefined): string {
  if (!amount) return 'N/A'
  try {
    return (Number(amount) / 1e18).toFixed(6)
  } catch {
    return amount
  }
}

function formatPercentage(value: string): string {
  try {
    return (Number(value) / 100).toFixed(4) + '%'
  } catch {
    return value
  }
}

function formatIndex(value: string): string {
  try {
    // Convert from wei (1e18) to decimal with full precision
    const bigIntValue = BigInt(value);
    const divisor = BigInt(10 ** 18);
    const whole = bigIntValue / divisor;
    const fraction = bigIntValue % divisor;
    
    if (fraction === 0n) {
      return `${whole}.000000000000000000`;
    }
    
    const fractionStr = fraction.toString().padStart(18, '0');
    return `${whole}.${fractionStr}`;
  } catch {
    return value
  }
}

function normalizeEvents(data: any): Event[] {
  const events: Event[] = []
  
  // Supply events
  data.supplyEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'Supply',
      user: e.user.address,
      amount: e.amount,
    })
  })
  
  // Withdraw events
  data.withdrawEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'Withdraw',
      user: e.user.address,
      amount: e.amount,
    })
  })
  
  // Borrow events
  data.borrowEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'Borrow',
      user: e.user.address,
      amount: e.amount,
    })
  })
  
  // Repay events
  data.repayEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'Repay',
      user: e.user.address,
      amount: e.amount,
    })
  })
  
  // Node deposit events
  data.nodeDepositEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'NodeDeposit',
      user: e.user.address,
      nodeId: e.nodeId,
      nodeType: e.nodeType,
      assetValue: e.assetValue,
    })
  })
  
  // Node withdrawal events
  data.nodeWithdrawalEvents?.forEach((e: any) => {
    events.push({
      id: e.id,
      timestamp: Number(e.timestamp),
      blockNumber: Number(e.blockNumber),
      transactionHash: e.transactionHash,
      type: 'NodeWithdrawal',
      user: e.user.address,
      nodeId: e.nodeId,
      nodeType: e.nodeType,
      assetValue: e.assetValue,
    })
  })
  
  // Sort by timestamp
  return events.sort((a, b) => a.timestamp - b.timestamp)
}

function findBeforeAndAfterSnapshots(
  event: Event, 
  snapshots: RateSnapshot[]
): { before: RateSnapshot | null; after: RateSnapshot | null } {
  // Find snapshots immediately before and after the event
  // Using block number for precise ordering (more reliable than timestamp)
  
  let before: RateSnapshot | null = null
  let after: RateSnapshot | null = null
  
  for (const snapshot of snapshots) {
    // Before: latest snapshot BEFORE this event (exclude current block)
    // This shows the state before the event was processed
    if (snapshot.blockNumber < event.blockNumber) {
      if (before === null || snapshot.blockNumber > before.blockNumber) {
        before = snapshot
      }
    }
    
    // After: earliest snapshot AT OR AFTER this event (include current block)
    // The snapshot created by this event shows the state after processing
    if (snapshot.blockNumber >= event.blockNumber) {
      if (after === null || snapshot.blockNumber < after.blockNumber) {
        after = snapshot
      }
    }
  }
  
  return { before, after }
}

function combineData(events: Event[], snapshots: RateSnapshot[]): CombinedData[] {
  const combined: CombinedData[] = []
  let lastEventTime = 0
  
  for (const event of events) {
    const { before, after } = findBeforeAndAfterSnapshots(event, snapshots)
    
    const secondsSinceLastEvent = lastEventTime > 0 ? event.timestamp - lastEventTime : 0
    
    // Calculate Supply APY change
    let supplyAPYChange = 'N/A'
    if (before && after) {
      const beforeAPY = Number(before.supplyAPY) / 100
      const afterAPY = Number(after.supplyAPY) / 100
      const change = afterAPY - beforeAPY
      supplyAPYChange = change >= 0 ? `+${change.toFixed(4)}%` : `${change.toFixed(4)}%`
    }
    
    // Calculate Borrow APY change
    let borrowAPYChange = 'N/A'
    if (before && after) {
      const beforeAPY = Number(before.borrowAPY) / 100
      const afterAPY = Number(after.borrowAPY) / 100
      const change = afterAPY - beforeAPY
      borrowAPYChange = change >= 0 ? `+${change.toFixed(4)}%` : `${change.toFixed(4)}%`
    }
    
    combined.push({
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
      dateTime: formatTimestamp(event.timestamp),
      eventType: event.type,
      eventUser: event.user.substring(0, 10) + '...',
      eventAmount: event.amount ? formatAmount(event.amount) : (event.assetValue ? formatAmount(event.assetValue) : 'N/A'),
      eventTxHash: event.transactionHash,
      supplyAPYBefore: before ? formatPercentage(before.supplyAPY) : 'N/A',
      borrowAPYBefore: before ? formatPercentage(before.borrowAPY) : 'N/A',
      supplyAPYAfter: after ? formatPercentage(after.supplyAPY) : 'N/A',
      borrowAPYAfter: after ? formatPercentage(after.borrowAPY) : 'N/A',
      supplyAPYChange: supplyAPYChange,
      borrowAPYChange: borrowAPYChange,
      utilizationBefore: before ? formatPercentage(before.utilizationRate) : 'N/A',
      utilizationAfter: after ? formatPercentage(after.utilizationRate) : 'N/A',
      borrowIndexBefore: before ? formatIndex(before.borrowIndex) : 'N/A',
      supplyIndexBefore: before ? formatIndex(before.supplyIndex) : 'N/A',
      borrowIndexAfter: after ? formatIndex(after.borrowIndex) : 'N/A',
      supplyIndexAfter: after ? formatIndex(after.supplyIndex) : 'N/A',
      totalLiquidity: after ? formatAmount(after.totalLiquidity) : (before ? formatAmount(before.totalLiquidity) : 'N/A'),
      totalDebt: after ? formatAmount(after.totalDebt) : (before ? formatAmount(before.totalDebt) : 'N/A'),
      secondsSinceLastEvent: secondsSinceLastEvent,
    })
    
    lastEventTime = event.timestamp
  }
  
  return combined
}

function exportToCSV(data: CombinedData[], filename: string): void {
  // CSV Headers
  const headers = [
    'Block Number',
    'Timestamp',
    'Date/Time (UTC)',
    'Event Type',
    'User',
    'Amount (WOORT)',
    'Transaction Hash',
    'Supply APY (Before)',
    'Borrow APY (Before)',
    'Supply APY (After)',
    'Borrow APY (After)',
    'Supply APY Change',
    'Borrow APY Change',
    'Utilization (Before)',
    'Utilization (After)',
    'Borrow Index (Before)',
    'Supply Index (Before)',
    'Borrow Index (After)',
    'Supply Index (After)',
    'Total Liquidity',
    'Total Debt',
    'Seconds Since Last Event',
  ]
  
  // Build CSV content
  const csvLines = [headers.join(',')]
  
  for (const row of data) {
    const line = [
      row.blockNumber,
      row.timestamp,
      `"${row.dateTime}"`,
      row.eventType,
      `"${row.eventUser}"`,
      row.eventAmount,
      row.eventTxHash,
      row.supplyAPYBefore,
      row.borrowAPYBefore,
      row.supplyAPYAfter,
      row.borrowAPYAfter,
      row.supplyAPYChange,
      row.borrowAPYChange,
      row.utilizationBefore,
      row.utilizationAfter,
      row.borrowIndexBefore,
      row.supplyIndexBefore,
      row.borrowIndexAfter,
      row.supplyIndexAfter,
      row.totalLiquidity,
      row.totalDebt,
      row.secondsSinceLastEvent,
    ]
    csvLines.push(line.join(','))
  }
  
  // Write to file
  const csvContent = csvLines.join('\n')
  fs.writeFileSync(filename, csvContent, 'utf-8')
}

// Main Function
async function main() {
  console.log('📊 InfraFi Analytics Data Export Tool\n')
  console.log(`Configuration:`)
  console.log(`  - Days: ${DAYS}`)
  console.log(`  - Output: ${OUTPUT_FILE}`)
  console.log(`  - Subgraph: ${SUBGRAPH_URL}\n`)
  
  try {
    // Calculate start time
    const startTime = Math.floor(Date.now() / 1000) - (DAYS * 24 * 60 * 60)
    console.log(`📅 Fetching data from: ${formatTimestamp(startTime)}\n`)
    
    // Fetch events
    console.log('🔄 Fetching events from subgraph...')
    const eventsResult = await client.query({
      query: GET_ALL_EVENTS,
      variables: { startTime },
    })
    
    const events = normalizeEvents(eventsResult.data)
    console.log(`✅ Found ${events.length} events\n`)
    
    // Fetch interest rate snapshots
    console.log('🔄 Fetching interest rate snapshots...')
    const snapshotsResult = await client.query({
      query: GET_INTEREST_RATE_SNAPSHOTS,
      variables: { startTime },
    })
    
    const snapshots: RateSnapshot[] = (snapshotsResult.data as any).interestRateSnapshots.map((s: any) => ({
      timestamp: Number(s.timestamp),
      blockNumber: Number(s.blockNumber),
      supplyAPY: s.supplyAPY,
      borrowAPY: s.borrowAPY,
      utilizationRate: s.utilizationRate,
      borrowIndex: s.borrowIndex || '1000000000000000000', // Default 1e18 if not available
      supplyIndex: s.supplyIndex || '1000000000000000000', // Default 1e18 if not available
      totalLiquidity: s.totalLiquidity,
      totalDebt: s.totalDebt, // Real debt with accrued compound interest from getTotalDebt()
    }))
    console.log(`✅ Found ${snapshots.length} rate snapshots\n`)
    
    // Combine data
    console.log('🔄 Correlating events with rate changes...')
    const combinedData = combineData(events, snapshots)
    console.log(`✅ Processed ${combinedData.length} records\n`)
    
    // Export to CSV
    console.log(`💾 Exporting to ${OUTPUT_FILE}...`)
    exportToCSV(combinedData, OUTPUT_FILE)
    console.log(`✅ Export complete!\n`)
    
    // Summary
    console.log('📊 Summary:')
    console.log(`  - Total Events: ${events.length}`)
    console.log(`  - Total Snapshots: ${snapshots.length}`)
    console.log(`  - Events by Type:`)
    
    const eventCounts = events.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(eventCounts).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`)
    })
    
    console.log(`\n✨ Done! Open ${OUTPUT_FILE} in your spreadsheet application.\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run
main()

