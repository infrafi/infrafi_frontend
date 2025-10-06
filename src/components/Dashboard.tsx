'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { useInfraFi } from '@/hooks/useInfraFi'
import { ProtocolStats } from '@/components/ProtocolStats'
import { SupplyWithdraw } from '@/components/SupplyWithdraw'
import { BorrowRepay } from '@/components/BorrowRepay'
import { UserPosition } from '@/components/UserPosition'
import { NodeManagement } from '@/components/NodeManagement'
import { RevenueSharing } from '@/components/RevenueSharing'

export function Dashboard() {
  const { wallet } = useWeb3()
  const infraFi = useInfraFi()

  return (
    <div className="space-y-8">
      {/* Protocol Overview */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6">Protocol Overview</h2>
        <ProtocolStats protocolStats={infraFi.protocolStats} isLoading={infraFi.isLoading.protocolStats} />
      </div>

      {/* Revenue Sharing Model */}
      <div>
        <RevenueSharing />
      </div>

      {/* User Dashboard */}
      {wallet.isConnected && wallet.isCorrectNetwork && (
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Your Position</h2>
          <UserPosition userPosition={infraFi.userPosition} isLoading={infraFi.isLoading.userPosition} />
        </div>
      )}

      {/* Trading Interface */}
      {wallet.isConnected && wallet.isCorrectNetwork && (
        <div className="grid md:grid-cols-2 gap-8">
          <SupplyWithdraw 
            userPosition={infraFi.userPosition}
            protocolStats={infraFi.protocolStats}
            txState={infraFi.txState}
            onSupply={infraFi.supply}
            onWithdraw={infraFi.withdraw}
          />
          <BorrowRepay 
            userPosition={infraFi.userPosition}
            protocolStats={infraFi.protocolStats}
            txState={infraFi.txState}
            onBorrow={infraFi.borrow}
            onRepay={infraFi.repay}
          />
        </div>
      )}

      {/* Node Management */}
      {wallet.isConnected && wallet.isCorrectNetwork && (
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">My Nodes</h2>
          <NodeManagement 
            userNodes={infraFi.userNodes}
            depositedNodes={infraFi.depositedNodes}
            isLoading={{
              userNodes: infraFi.isLoading.userNodes,
              depositedNodes: infraFi.isLoading.depositedNodes
            }}
            onRefreshNodes={infraFi.refreshUserNodes}
            onRefreshDepositedNodes={infraFi.refreshDepositedNodes}
            onDepositNodes={infraFi.depositNodes}
            onWithdrawNodes={infraFi.withdrawNodes}
            txState={infraFi.txState}
          />
        </div>
      )}

      {/* Connection Prompt */}
      {!wallet.isConnected && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">
            Connect your wallet to start using InfraFi
          </h2>
          <p className="text-gray-500">
            Supply WOORT tokens, borrow against your OORT nodes, and earn yield in the DePIN economy.
          </p>
        </div>
      )}
    </div>
  )
}
