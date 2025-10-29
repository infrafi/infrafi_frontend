import { formatTokenAmount } from './utils'

// Helper function to convert basis points to percentage with full precision
function basisPointsToPercentage(basisPoints: number): number {
  return Number((basisPoints / 100).toFixed(8))
}

/**
 * Format daily snapshots for TVL chart
 */
export function formatTVLChartData(snapshots: any[], currentProtocol?: any) {
  if (!snapshots || snapshots.length === 0) {
    // If no historical data but we have current state, show current state only
    if (currentProtocol) {
      return [{
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: Math.floor(Date.now() / 1000),
        totalSupplied: Number(formatTokenAmount(BigInt(currentProtocol.totalLiquidity || '0'))),
        totalBorrowed: Math.abs(Number(formatTokenAmount(BigInt(currentProtocol.totalDebt || '0')))),
        totalCollateral: Number(formatTokenAmount(BigInt(currentProtocol.totalCollateralValue || '0'))),
      }]
    }
    return []
  }
  
  const historicalData = snapshots
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.date * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: snapshot.date,
          totalSupplied: Number(formatTokenAmount(BigInt(snapshot.totalLiquidity || '0'))),
          totalBorrowed: Math.abs(Number(formatTokenAmount(BigInt(snapshot.totalDebt || '0')))),
          totalCollateral: Number(formatTokenAmount(BigInt(snapshot.totalCollateralValue || '0'))),
        }
      } catch (error) {
        console.error('Error formatting TVL data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
    .reverse() // Oldest to newest for chart
  
  // Append current protocol state as the most recent data point
  if (currentProtocol) {
    const latestSnapshot = historicalData[historicalData.length - 1]
    const now = Math.floor(Date.now() / 1000)
    
    // Only add current state if it's newer than the latest snapshot (different day)
    if (!latestSnapshot || now - latestSnapshot.timestamp > 3600) { // More than 1 hour difference
      historicalData.push({
        date: 'Now',
        timestamp: now,
        totalSupplied: Number(formatTokenAmount(BigInt(currentProtocol.totalLiquidity || '0'))),
        totalBorrowed: Math.abs(Number(formatTokenAmount(BigInt(currentProtocol.totalDebt || '0')))),
        totalCollateral: Number(formatTokenAmount(BigInt(currentProtocol.totalCollateralValue || '0'))),
      })
    }
  }
  
  return historicalData
}

/**
 * Format daily snapshots for APY chart
 */
export function formatAPYChartData(snapshots: any[], currentProtocol?: any) {
  if (!snapshots || snapshots.length === 0) {
    // If no historical data but we have current state, show current state only
    if (currentProtocol) {
      return [{
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: Math.floor(Date.now() / 1000),
        supplyAPY: basisPointsToPercentage(currentProtocol.supplyAPY || 0),
        borrowAPY: basisPointsToPercentage(currentProtocol.borrowAPY || 0),
        utilization: basisPointsToPercentage(currentProtocol.utilizationRate || 0),
      }]
    }
    return []
  }
  
  const historicalData = snapshots
    .map((snapshot) => {
      try {
        // Ensure timestamp is included for event marker matching
        const timestamp = Number(snapshot.date || snapshot.timestamp || 0)
        return {
          date: new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: timestamp,
          supplyAPY: basisPointsToPercentage(snapshot.supplyAPY || 0), // Convert basis points to percentage
          borrowAPY: basisPointsToPercentage(snapshot.borrowAPY || 0),
          utilization: basisPointsToPercentage(snapshot.utilizationRate || 0),
        }
      } catch (error) {
        console.error('Error formatting APY data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
    .reverse()
  
  // Append current protocol state as the most recent data point
  if (currentProtocol) {
    const latestSnapshot = historicalData[historicalData.length - 1]
    const now = Math.floor(Date.now() / 1000)
    
    // Only add current state if it's newer than the latest snapshot
    if (!latestSnapshot || now - latestSnapshot.timestamp > 3600) {
      historicalData.push({
        date: 'Now',
        timestamp: now,
        supplyAPY: (currentProtocol.supplyAPY || 0) / 100,
        borrowAPY: (currentProtocol.borrowAPY || 0) / 100,
        utilization: (currentProtocol.utilizationRate || 0) / 100,
      })
    }
  }
  
  return historicalData
}

/**
 * Format daily snapshots for activity chart
 * @param snapshots Historical daily snapshots from subgraph
 * @param events Optional events data to aggregate today's activity
 */
export function formatActivityChartData(snapshots: any[], events?: any) {
  const historicalData = snapshots
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.date * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: snapshot.date,
          supplies: snapshot.suppliesCount || 0,
          withdrawals: snapshot.withdrawalsCount || 0,
          borrows: snapshot.borrowsCount || 0,
          repays: snapshot.repaysCount || 0,
          nodeDeposits: snapshot.nodeDepositsCount || 0,
          nodeWithdrawals: snapshot.nodeWithdrawalsCount || 0,
        }
      } catch (error) {
        console.error('Error formatting activity data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
  
  // Aggregate today's events if provided
  if (events) {
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    const todayEnd = Math.floor(Date.now() / 1000)
    
    const todayEvents = {
      supplies: (events.supplyEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
      withdrawals: (events.withdrawEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
      borrows: (events.borrowEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
      repays: (events.repayEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
      nodeDeposits: (events.nodeDepositEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
      nodeWithdrawals: (events.nodeWithdrawalEvents || []).filter((e: any) => {
        const ts = Number(e.timestamp || 0)
        return ts >= todayStart && ts <= todayEnd
      }).length,
    }
    
    // Check if today's data doesn't already exist in snapshots
    const todayDateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const hasTodayData = historicalData.some((item: any) => item.date === todayDateStr)
    
    // Only append if there's activity today and it doesn't already exist
    if (!hasTodayData && Object.values(todayEvents).some(count => count > 0)) {
      historicalData.push({
        date: todayDateStr,
        timestamp: Math.floor(Date.now() / 1000),
        supplies: todayEvents.supplies,
        withdrawals: todayEvents.withdrawals,
        borrows: todayEvents.borrows,
        repays: todayEvents.repays,
        nodeDeposits: todayEvents.nodeDeposits,
        nodeWithdrawals: todayEvents.nodeWithdrawals,
      })
    }
  }
  
  // Sort by timestamp (oldest first, so newest appears on right in chart)
  return historicalData.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
}

/**
 * Format daily snapshots for volume chart
 * @param snapshots Historical daily snapshots from subgraph
 * @param events Optional events data to aggregate today's volume
 */
export function formatVolumeChartData(snapshots: any[], events?: any) {
  const historicalData = snapshots
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.date * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: snapshot.date,
          supplyVolume: Number(formatTokenAmount(BigInt(snapshot.supplyVolume || '0'))),
          withdrawVolume: Number(formatTokenAmount(BigInt(snapshot.withdrawVolume || '0'))),
          borrowVolume: Number(formatTokenAmount(BigInt(snapshot.borrowVolume || '0'))),
          repayVolume: Number(formatTokenAmount(BigInt(snapshot.repayVolume || '0'))),
        }
      } catch (error) {
        console.error('Error formatting volume data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
  
  // Aggregate today's volume from events if provided
  if (events) {
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    const todayEnd = Math.floor(Date.now() / 1000)
    
    const todayVolume = {
      supplyVolume: (events.supplyEvents || [])
        .filter((e: any) => {
          const ts = Number(e.timestamp || 0)
          return ts >= todayStart && ts <= todayEnd
        })
        .reduce((sum: number, e: any) => sum + Number(formatTokenAmount(BigInt(e.amount || '0'))), 0),
      withdrawVolume: (events.withdrawEvents || [])
        .filter((e: any) => {
          const ts = Number(e.timestamp || 0)
          return ts >= todayStart && ts <= todayEnd
        })
        .reduce((sum: number, e: any) => sum + Number(formatTokenAmount(BigInt(e.amount || '0'))), 0),
      borrowVolume: (events.borrowEvents || [])
        .filter((e: any) => {
          const ts = Number(e.timestamp || 0)
          return ts >= todayStart && ts <= todayEnd
        })
        .reduce((sum: number, e: any) => sum + Number(formatTokenAmount(BigInt(e.amount || '0'))), 0),
      repayVolume: (events.repayEvents || [])
        .filter((e: any) => {
          const ts = Number(e.timestamp || 0)
          return ts >= todayStart && ts <= todayEnd
        })
        .reduce((sum: number, e: any) => sum + Number(formatTokenAmount(BigInt(e.amount || '0'))), 0),
    }
    
    // Check if today's data doesn't already exist in snapshots
    const todayDateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const hasTodayData = historicalData.some((item: any) => item.date === todayDateStr)
    
    // Only append if there's volume today and it doesn't already exist
    if (!hasTodayData && Object.values(todayVolume).some(vol => vol > 0)) {
      historicalData.push({
        date: todayDateStr,
        timestamp: Math.floor(Date.now() / 1000),
        supplyVolume: todayVolume.supplyVolume,
        withdrawVolume: todayVolume.withdrawVolume,
        borrowVolume: todayVolume.borrowVolume,
        repayVolume: todayVolume.repayVolume,
      })
    }
  }
  
  // Sort by timestamp (oldest first, so newest appears on right in chart)
  return historicalData.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
}

/**
 * Format interest rate snapshots for detailed APY chart
 * @param snapshots Array of interest rate snapshots from subgraph
 * @param startTime Optional unix timestamp to filter snapshots (only include data after this time)
 */
export function formatInterestRateChartData(snapshots: any[], startTime?: number) {
  let filtered = snapshots
  
  // Filter by time range if provided
  if (startTime) {
    filtered = snapshots.filter(s => Number(s.timestamp) >= startTime)
  }
  
  return filtered
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.timestamp * 1000).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: Number(snapshot.timestamp),
          supplyAPY: basisPointsToPercentage(snapshot.supplyAPY),
          borrowAPY: basisPointsToPercentage(snapshot.borrowAPY),
          utilization: basisPointsToPercentage(snapshot.utilizationRate),
          totalSupplied: Number(formatTokenAmount(BigInt(snapshot.totalLiquidity))),
          totalBorrowed: Number(formatTokenAmount(BigInt(snapshot.totalDebt))),
        }
      } catch (error) {
        console.error('Error formatting interest rate data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
    .reverse() // Oldest to newest
}

/**
 * Format interest rate snapshots for Index chart (borrow/supply indices)
 * @param snapshots Array of interest rate snapshots from subgraph
 * @param startTime Optional unix timestamp to filter snapshots (only include data after this time)
 */
export function formatIndexChartData(snapshots: any[], startTime?: number) {
  let filtered = snapshots
  
  // Filter by time range if provided
  if (startTime) {
    filtered = snapshots.filter(s => Number(s.timestamp) >= startTime)
  }
  
  return filtered
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.timestamp * 1000).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: Number(snapshot.timestamp),
          // Convert from 1e18 to decimal with full precision (e.g., 1.05e18 -> 1.05)
          borrowIndex: Number(formatTokenAmount(BigInt(snapshot.borrowIndex))),
          supplyIndex: Number(formatTokenAmount(BigInt(snapshot.supplyIndex))),
        }
      } catch (error) {
        console.error('Error formatting index data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
    .reverse() // Oldest to newest
}

