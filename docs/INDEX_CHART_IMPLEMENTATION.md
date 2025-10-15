# Index History Chart Implementation

## Overview
Added a new "Index History" chart below the "Interest Rates History" chart that displays the borrow index and supply index curves over time. This helps visualize the compound interest accumulation and index growth.

## What Was Added

### 1. Subgraph Updates

#### Schema Changes (`infrafi_backend/schema.graphql`)
Added two new fields to `InterestRateSnapshot`:
```graphql
borrowIndex: BigInt! # Compound-style borrow index (1e18 = 1.0)
supplyIndex: BigInt! # Compound-style supply index (1e18 = 1.0)
```

#### Mapping Changes (`infrafi_backend/src/mapping.ts`)
Updated the snapshot creation to capture index values:
```typescript
let borrowIndex = contract.try_borrowIndex()
let supplyIndex = contract.try_supplyIndex()
snapshot.borrowIndex = borrowIndex.reverted ? BigInt.fromI32(1).times(BigInt.fromI32(10).pow(18)) : borrowIndex.value
snapshot.supplyIndex = supplyIndex.reverted ? BigInt.fromI32(1).times(BigInt.fromI32(10).pow(18)) : supplyIndex.value
```

### 2. Frontend Updates

#### New Component (`IndexChart.tsx`)
- Created a new chart component identical to APYChart in structure
- Displays Borrow Index (orange) and Supply Index (green) curves
- Includes all the same features:
  - Time frame selector (1H, 6H, 24H, 7D, 30D, ALL)
  - Event markers with the same 6 event types
  - Event statistics panel
  - Toggle to show/hide events
  - Custom tooltips with event details

#### GraphQL Query Update (`graphql-queries.ts`)
Updated `GET_INTEREST_RATE_HISTORY` to include:
```graphql
borrowIndex
supplyIndex
```

#### Chart Utilities (`chart-utils.ts`)
Added new formatter:
```typescript
formatIndexChartData(snapshots: any[], startTime?: number)
```
Converts BigInt indices (1e18) to decimal format (e.g., 1.05).

#### Analytics Page (`Analytics.tsx`)
- Imported `IndexChart` component
- Added `formatIndexChartData` to imports
- Positioned chart between APYChart and ActivityChart
- Passes same event data for markers

## Features

### Chart Capabilities
✅ **Dual Index Display**: Shows both borrow and supply indices on the same chart  
✅ **Time Frame Control**: Independent 1H/6H/24H/7D/30D/ALL selector  
✅ **Event Markers**: All 6 event types (supply, withdraw, borrow, repay, node deposit, node withdrawal)  
✅ **Event Statistics**: Shows count breakdown and unmatched events warning  
✅ **Interactive Tooltips**: Displays index values + events at each point  
✅ **Toggle Events**: Show/hide event markers on demand  

### Index Interpretation
- **Starting Value**: Both indices start at 1.0 (represented as 1e18 in the contract)
- **Growth Over Time**: Indices grow as interest accrues
- **Borrow Index**: Tracks accumulated interest on borrowed funds
- **Supply Index**: Tracks accumulated interest on supplied funds
- **Ratio**: The difference shows the protocol's interest rate spread

## Deployment Instructions

### ⚠️ IMPORTANT: Subgraph Must Be Redeployed

Since the schema changed, you **must** redeploy the subgraph:

#### Step 1: Regenerate Subgraph Code
```bash
cd infrafi_backend
npm run codegen
```

This generates TypeScript types for the new fields.

#### Step 2: Build the Subgraph
```bash
npm run build
```

#### Step 3: Deploy to Graph Node
```bash
# For local Graph Node
npm run create-local
npm run deploy-local

# OR for hosted service
npm run deploy
```

#### Step 4: Wait for Sync
The subgraph will need to re-index from block 0 to populate the new `borrowIndex` and `supplyIndex` fields. This may take some time depending on the blockchain size.

### Frontend Deployment

The frontend changes are ready immediately - just rebuild and deploy:

```bash
cd infrafi_frontend
npm run build
npm run start
```

## Verification

After deployment, verify the chart works:

1. **Navigate to Analytics page**
2. **Scroll down** to see "Index History" chart below "Interest Rates History"
3. **Check indices start at ~1.0** (both should be close to 1.000000)
4. **Verify indices grow over time** as interest accrues
5. **Test time frame selector** (1H, 6H, 24H, 7D, 30D, ALL)
6. **Check event markers appear** on the chart
7. **Hover tooltips** should show index values and events
8. **Toggle events** button should hide/show markers

## Technical Notes

### Index Calculation
- Indices are stored as `uint256` with 18 decimals (1e18 = 1.0)
- Frontend divides by 1e18 to get human-readable format
- Example: 1050000000000000000 → 1.05

### Event Matching
- Uses same smart matching algorithm as APYChart
- 12-hour window to find closest data point
- Positions markers at 98% of max index value

### Performance
- Shares same data fetch with APYChart (no extra queries)
- Client-side filtering for time frames (instant)
- Event markers reuse same event data

## Future Enhancements

Potential improvements:
1. Show index growth rate (derivative) as additional line
2. Display yield calculation based on index ratio
3. Compare index growth to expected APY
4. Add index prediction/projection line
5. Export index data to CSV
6. Show cumulative interest earned from indices

## Troubleshooting

### Chart Shows No Data
- Verify subgraph is deployed and synced
- Check browser console for GraphQL errors
- Ensure `borrowIndex` and `supplyIndex` fields exist in subgraph

### Indices Show as 1.0 Always
- Subgraph may not have re-indexed yet
- Check if contract has `borrowIndex()` and `supplyIndex()` methods
- Verify mapping is calling `contract.try_borrowIndex()` correctly

### Events Not Showing
- Same as APYChart troubleshooting
- Check "Event Statistics" panel for counts
- Verify time frame includes event timestamps

### Chart Layout Issues
- Clear browser cache
- Check responsive design on different screen sizes
- Verify Tailwind CSS is loading properly

