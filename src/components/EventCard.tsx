'use client'

import { formatBalance } from '@/lib/utils'
import { OORT_NETWORK } from '@/config/contracts'
import { ExternalLink, ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, Server } from 'lucide-react'

type EventType = 'supply' | 'withdraw' | 'borrow' | 'repay' | 'nodeDeposit' | 'nodeWithdrawal'

interface EventCardProps {
  type: EventType
  amount?: string
  principalAmount?: string
  interestAmount?: string
  nodeId?: string
  assetValue?: string
  timestamp: string
  transactionHash: string
  explorerUrl?: string
}

const eventConfig: Record<EventType, {
  icon: any
  iconColor: string
  bgColor: string
  title: string
  amountLabel: string
}> = {
  supply: {
    icon: ArrowDownCircle,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-900/20',
    title: 'Supplied',
    amountLabel: 'Amount Supplied'
  },
  withdraw: {
    icon: ArrowUpCircle,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    title: 'Withdrawn',
    amountLabel: 'Amount Withdrawn'
  },
  borrow: {
    icon: TrendingDown,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    title: 'Borrowed',
    amountLabel: 'Amount Borrowed'
  },
  repay: {
    icon: TrendingUp,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    title: 'Repaid',
    amountLabel: 'Amount Repaid'
  },
  nodeDeposit: {
    icon: Server,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    title: 'Node Deposited',
    amountLabel: 'Collateral Value'
  },
  nodeWithdrawal: {
    icon: Server,
    iconColor: 'text-pink-400',
    bgColor: 'bg-pink-900/20',
    title: 'Node Withdrawn',
    amountLabel: 'Node ID'
  }
}

export function EventCard({ type, amount, principalAmount, interestAmount, nodeId, assetValue, timestamp, transactionHash, explorerUrl = OORT_NETWORK.explorer }: EventCardProps) {
  const config = eventConfig[type]
  const Icon = config.icon
  
  const formatTimestamp = (ts: string) => {
    const date = new Date(Number(ts) * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNodeId = (id: string) => {
    if (id.length > 20) {
      return `${id.slice(0, 10)}...${id.slice(-8)}`
    }
    return id
  }

  return (
    <div className={`${config.bgColor} border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-lg bg-gray-800`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-white">{config.title}</h4>
              <span className="text-xs text-gray-500">{formatTimestamp(timestamp)}</span>
            </div>
            
            <div className="space-y-1">
              {amount && (
                <>
                  <p className="text-lg font-bold text-white">
                    {formatBalance(BigInt(amount))} WOORT
                  </p>
                  {type === 'withdraw' && principalAmount && interestAmount && (
                    <p className="text-xs text-gray-400">
                      Principal: {formatBalance(BigInt(principalAmount))} · Interest: {formatBalance(BigInt(interestAmount))} WOORT
                    </p>
                  )}
                </>
              )}
              
              {nodeId && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Node ID</p>
                  <p className="text-sm text-gray-300 font-mono">{formatNodeId(nodeId)}</p>
                </div>
              )}
              
              {assetValue && (
                <p className="text-sm text-gray-400">
                  Value: {formatBalance(BigInt(assetValue))} WOORT
                </p>
              )}
            </div>

            <a
              href={`${explorerUrl}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 mt-2"
            >
              <span>View Transaction</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

