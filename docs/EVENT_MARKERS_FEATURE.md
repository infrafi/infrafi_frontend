# Interest Rate History - Event Markers Feature

## Overview
The Interest Rates History chart now displays event markers that show when specific protocol actions occurred, making it easy to visualize how user activities affect interest rates in real-time.

## Features

### Visual Event Markers
Event markers appear as colored dots on the chart at the time when events occurred:
- **▲ Supply** (Green `#10B981`) - Token deposits into the lending pool
- **▼ Withdraw** (Blue `#3B82F6`) - Token withdrawals from the lending pool
- **● Borrow** (Orange `#F59E0B`) - Borrowing actions
- **◆ Repay** (Purple `#8B5CF6`) - Loan repayment actions
- **■ Node Deposit** (Cyan `#06B6D4`) - DePIN node collateral deposits
- **□ Node Withdraw** (Pink `#EC4899`) - DePIN node collateral withdrawals

### Interactive Features
1. **Time Frame Selector**: Choose from 1H, 6H, 24H, 7D, 30D, or ALL to zoom into specific periods
2. **Toggle Events**: Click "Hide Events" / "Show Events" button to toggle marker visibility
3. **Event Legend**: Shows event counts for each type at the top of the chart
4. **Enhanced Tooltip**: Hover over any data point to see:
   - Current APY rates (Supply, Borrow, Utilization)
   - All events that occurred at that time
   - Event amounts (for token events)

### Smart Event Matching
- Events are automatically matched to the nearest data point (within 1 hour)
- Markers are positioned at 95% of the maximum Y-axis value for visibility
- Multiple events at the same time are grouped in the tooltip

## Technical Implementation

### Architecture
```
Analytics.tsx (Parent Component)
  ↓ Calculates time range
  ↓ Fetches events via useEventsInRange()
  ↓ Passes events to APYChart
  ↓
APYChart.tsx (Chart Component)
  ↓ Matches events to chart data points
  ↓ Renders ReferenceDot markers
  ↓ Custom tooltip with event details
```

### Data Flow
1. **Analytics Component** calculates `startTime` based on selected days (7, 30, or 90)
2. **useEventsInRange Hook** fetches all protocol events from subgraph since `startTime`
3. **APYChart Component** receives chart data and events
4. **Event Processing** matches events to chart data points by timestamp
5. **Rendering** displays markers using Recharts `ReferenceDot` component

### New Files & Changes

#### GraphQL Query (`graphql-queries.ts`)
```graphql
GET_EVENTS_IN_RANGE - Fetches all event types in a time range:
  - supplyEvents
  - withdrawEvents
  - borrowEvents
  - repayEvents
  - nodeDepositEvents
  - nodeWithdrawalEvents
```

#### Hook (`useSubgraph.ts`)
```typescript
useEventsInRange(startTime: number) - Returns grouped events with loading state
```

#### Component (`APYChart.tsx`)
Enhanced with:
- Event marker rendering
- Custom tooltip with event details
- Toggle button for showing/hiding events
- Event legend with counts

#### Utilities (`chart-utils.ts`)
Updated `formatAPYChartData()` to include timestamps for event matching

## Usage

The feature is automatically active on the Analytics page. Users can:

1. **Select Time Range**: The Interest Rates History chart has its own time frame selector with options:
   - **1H** - Last hour (real-time monitoring)
   - **6H** - Last 6 hours (short-term trends)
   - **24H** - Last 24 hours (daily activity)
   - **7D** - Last 7 days (default, weekly overview)
   - **30D** - Last 30 days (monthly trends)
   - **ALL** - All available data
2. **View Events**: Colored dots appear on the chart showing when events occurred
3. **Hover for Details**: Mouse over any point to see rates and events
4. **Toggle Visibility**: Click "Hide Events" to focus on the rate curves only
5. **Review Legend**: See event counts by type in the top-right corner

## Performance Considerations

- Event queries are cached by Apollo Client (2-minute polling)
- Maximum 1000 events fetched per query (configurable)
- Event matching is optimized with O(n) complexity
- Markers use efficient ReferenceDot components from Recharts

## Future Enhancements

Potential improvements:
1. ✅ ~~Time frame selector~~ - IMPLEMENTED (1H, 6H, 24H, 7D, 30D, ALL)
2. Filter events by type (show only borrows, only supplies, etc.)
3. Click events to see transaction details
4. Event clustering for high-frequency periods
5. Vertical reference lines instead of dots
6. Animation when events appear/disappear
7. Export event data to CSV
8. Custom date range picker
9. Compare two time periods side-by-side

## Debugging

If events don't appear:
1. Check subgraph is synced and indexing events
2. Verify event timestamps are within the selected time range
3. Check browser console for event fetching errors
4. Ensure timestamps in chart data and events align
5. Verify Apollo Client configuration

## Developer Notes

### Event Type Configuration
All event styling is defined in the `eventConfig` object in `APYChart.tsx`:
```typescript
const eventConfig = {
  supply: { color: '#10B981', symbol: '▲', label: 'Supply' },
  // ... other types
}
```

Modify this object to customize colors, symbols, or labels.

### Timestamp Matching Window
Events are matched to chart data points within 1 hour (3600 seconds):
```typescript
Math.abs(d.timestamp - timestamp) < 3600
```

Adjust this value if you need tighter or looser matching.

### Marker Positioning
Markers are positioned at 95% of max Y-axis value:
```typescript
const maxY = Math.max(...data.map(d => Math.max(d.supplyAPY, d.borrowAPY, d.utilization))) * 0.95
```

Change the multiplier (0.95) to adjust vertical positioning.

