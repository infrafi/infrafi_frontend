# InfraFi Frontend

A clean, modern DeFi lending interface for DePIN assets. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Clean Architecture**: Simple, maintainable code structure
- **Web3 Integration**: Connect to OORT network with MetaMask
- **DeFi Functionality**: Supply, withdraw, borrow, and repay WOORT tokens
- **Node Management**: View and manage OORT nodes (beta)
- **Real-time Data**: Live protocol statistics and user positions
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6
- **State Management**: React Context + Custom Hooks
- **Icons**: Lucide React

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Running

```bash
# Development
npm run dev

# Production Build
npm run build
npm start

# Linting
npm run lint
```

## 🔧 Configuration

### Network Settings
- **Chain ID**: 970 (OORT Mainnet)
- **RPC URL**: https://mainnet-rpc.oortech.com
- **Explorer**: https://mainnet-scan.oortech.com

### Contract Addresses
- **NodeVault**: `0x742d35Cc6634C0532925a3b8D557A2AbC7F8c4c2`
- **WOORT**: `0xEAd29460881f38ADA079A38ac3D82E2D088930d9`
- **OORT Node Contract**: `0xDE155823964816d6E67de8eA31DEf95D59aaE2Fb`

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Header.tsx       # Header with wallet connection
│   ├── ProtocolStats.tsx # Protocol overview
│   ├── UserPosition.tsx # User position display
│   ├── SupplyWithdraw.tsx # Supply/withdraw interface
│   ├── BorrowRepay.tsx  # Borrow/repay interface
│   └── NodeManagement.tsx # Node management (beta)
├── contexts/            # React contexts
│   └── Web3Context.tsx  # Web3 wallet connection
├── hooks/               # Custom React hooks
│   └── useInfraFi.ts    # InfraFi protocol hook
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities
├── types/               # TypeScript types
│   └── contracts.ts     # Contract interfaces
└── config/              # Configuration
    └── contracts.ts     # Contract addresses and ABIs
```

## 🎯 Key Components

### Web3Context
Manages wallet connection, network switching, and contract initialization.

### useInfraFi Hook
Central hook for all protocol interactions:
- Fetches protocol statistics
- Manages user positions
- Handles transactions (supply, withdraw, borrow, repay)
- Provides real-time data updates

### Dashboard
Main interface organizing all functionality:
- Protocol overview with key metrics
- User position summary
- Trading interfaces for supply/withdraw and borrow/repay
- Node management (beta)

## 🔐 Security Features

- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error catching and user feedback
- **Network Verification**: Ensures correct network connection
- **Transaction Safety**: Proper allowance checking for ERC20 operations

## 📱 User Interface

### Dark Theme
Professional dark theme optimized for DeFi trading:
- Clean card-based layout
- Consistent spacing and typography
- Accessible color contrast
- Responsive grid system

### Interactive Elements
- Real-time balance updates
- Transaction loading states
- Error message display
- Success feedback

## 🌐 Deployment

The frontend is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify** 
- Any static hosting service

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Test on OORT mainnet
5. Follow the established naming conventions

## 📄 License

Built for the InfraFi protocol - DeFi lending for DePIN assets.
