'use client'

import { OortNode } from '@/types/contracts'
import { formatBalance } from '@/lib/utils'
import { Server, RefreshCw, AlertCircle, Info } from 'lucide-react'

interface NodeManagementProps {
  userNodes: OortNode[]
  isLoading: boolean
  onRefresh: () => void
}

export function NodeManagement({ userNodes, isLoading, onRefresh }: NodeManagementProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Node Management</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Loading...' : 'Refresh Nodes'}</span>
        </button>
      </div>

      {/* Beta Warning */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-400">Node Management Beta</p>
            <p className="text-sm mt-1 text-gray-300">
              Node deposit and withdrawal functionality is currently under development. 
              You can view your OORT nodes below by clicking "Refresh Nodes".
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-gray-700 rounded-lg animate-pulse">
              <div className="h-6 bg-gray-600 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : userNodes.length > 0 ? (
        <div className="space-y-4">
          {userNodes.map((node) => (
            <div key={node.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${node.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Node #{node.id}</h4>
                    <p className="text-sm text-gray-400">
                      Status: {node.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Staked Amount</p>
                  <p className="font-medium text-white">
                    {formatBalance(node.stakedAmount)} WOORT
                  </p>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Rewards</p>
                  <p className="text-white">{formatBalance(node.rewards)} WOORT</p>
                </div>
                <div>
                  <p className="text-gray-400">Owner</p>
                  <p className="text-white text-xs font-mono">
                    {node.owner.slice(0, 6)}...{node.owner.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Future functionality placeholder */}
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="flex space-x-2">
                  <button 
                    disabled 
                    className="btn btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deposit as Collateral (Coming Soon)
                  </button>
                  <button 
                    disabled 
                    className="btn btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Withdraw (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Server className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">No Nodes Found</h4>
          <p className="text-gray-500 mb-4">
            No OORT nodes were found for your wallet. Make sure you own nodes on the OORT network.
          </p>
          <button
            onClick={onRefresh}
            className="btn btn-primary"
          >
            Refresh Nodes
          </button>
        </div>
      )}
    </div>
  )
}
