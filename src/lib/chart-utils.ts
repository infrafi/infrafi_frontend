import { formatBalance } from './utils'

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
        totalSupplied: Number(formatBalance(BigInt(currentProtocol.totalSupplied || '0'))),
        totalBorrowed: Math.abs(Number(formatBalance(BigInt(currentProtocol.totalBorrowed || '0')))),
        totalCollateral: Number(formatBalance(BigInt(currentProtocol.totalCollateralValue || '0'))),
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
          totalSupplied: Number(formatBalance(BigInt(snapshot.totalSupplied || '0'))),
          totalBorrowed: Math.abs(Number(formatBalance(BigInt(snapshot.totalBorrowed || '0')))),
          totalCollateral: Number(formatBalance(BigInt(snapshot.totalCollateralValue || '0'))),
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
        totalSupplied: Number(formatBalance(BigInt(currentProtocol.totalSupplied || '0'))),
        totalBorrowed: Math.abs(Number(formatBalance(BigInt(currentProtocol.totalBorrowed || '0')))),
        totalCollateral: Number(formatBalance(BigInt(currentProtocol.totalCollateralValue || '0'))),
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
        supplyAPY: (currentProtocol.supplyAPY || 0) / 100,
        borrowAPY: (currentProtocol.borrowAPY || 0) / 100,
        utilization: (currentProtocol.utilizationRate || 0) / 100,
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
          supplyAPY: (snapshot.supplyAPY || 0) / 100, // Convert basis points to percentage
          borrowAPY: (snapshot.borrowAPY || 0) / 100,
          utilization: (snapshot.utilizationRate || 0) / 100,
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
 */
export function formatActivityChartData(snapshots: any[]) {
  if (!snapshots || snapshots.length === 0) return []
  
  return snapshots
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
    .reverse()
}

/**
 * Format daily snapshots for volume chart
 */
export function formatVolumeChartData(snapshots: any[]) {
  if (!snapshots || snapshots.length === 0) return []
  
  return snapshots
    .map((snapshot) => {
      try {
        return {
          date: new Date(snapshot.date * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: snapshot.date,
          supplyVolume: Number(formatBalance(BigInt(snapshot.supplyVolume || '0'))),
          withdrawVolume: Number(formatBalance(BigInt(snapshot.withdrawVolume || '0'))),
          borrowVolume: Number(formatBalance(BigInt(snapshot.borrowVolume || '0'))),
          repayVolume: Number(formatBalance(BigInt(snapshot.repayVolume || '0'))),
        }
      } catch (error) {
        console.error('Error formatting volume data:', error, snapshot)
        return null
      }
    })
    .filter((item) => item !== null)
    .reverse()
}

/**
 * Format interest rate snapshots for detailed APY chart
 */
export function formatInterestRateChartData(snapshots: any[]) {
  return snapshots
    .map((snapshot) => ({
      date: new Date(snapshot.timestamp * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Number(snapshot.timestamp),
      supplyAPY: snapshot.supplyAPY / 100,
      borrowAPY: snapshot.borrowAPY / 100,
      utilization: snapshot.utilizationRate / 100,
      totalSupplied: Number(formatBalance(BigInt(snapshot.totalSupplied))),
      totalBorrowed: Number(formatBalance(BigInt(snapshot.totalBorrowed))),
    }))
    .reverse()
}

