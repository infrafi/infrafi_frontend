'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { useInfraFi } from '@/hooks/useInfraFi'
import { ProtocolStats } from '@/components/ProtocolStats'
import { SupplyWithdraw } from '@/components/SupplyWithdraw'
import { BorrowRepay } from '@/components/BorrowRepay'
import { UserPosition } from '@/components/UserPosition'
import { NodeManagement } from '@/components/NodeManagement'
import { RevenueSharing } from '@/components/RevenueSharing'
import { Analytics } from '@/components/Analytics'
import { UserInsights } from '@/components/UserInsights'
import { UserTimeline } from '@/components/UserTimeline'
import { PerformanceAnalytics } from '@/components/PerformanceAnalytics'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { TabNavigation, TabId } from '@/components/TabNavigation'
import { BarChart3, Share2, TrendingUp, User, Wallet, Server, Lightbulb, Clock, Building2, UserCircle, Target } from 'lucide-react'

export function Dashboard() {
  const { wallet, connectWallet } = useWeb3()
  const infraFi = useInfraFi()

  const tabs = [
    {
      id: 'protocol' as TabId,
      label: 'Protocol Info',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'user' as TabId,
      label: 'My Dashboard',
      icon: <UserCircle className="w-5 h-5" />,
      badge: wallet.isConnected ? undefined : 'Login',
    },
  ]

  return (
    <TabNavigation tabs={tabs} defaultTab="protocol">
      {(activeTab) => (
        <div className="space-y-6">
          {activeTab === 'protocol' && (
            <>
              {/* Protocol Overview */}
              <CollapsibleSection
                title="Protocol Overview"
                subtitle="View protocol-wide statistics and metrics"
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                defaultOpen={true}
              >
                <ProtocolStats 
                  protocolStats={infraFi.protocolStats} 
                  isLoading={infraFi.isLoading.protocolStats} 
                />
              </CollapsibleSection>

              {/* Revenue Sharing Model */}
              <CollapsibleSection
                title="Revenue Sharing Model"
                subtitle="Learn how protocol revenue is distributed"
                icon={<Share2 className="w-6 h-6 text-white" />}
                defaultOpen={false}
              >
                <RevenueSharing />
              </CollapsibleSection>

              {/* Analytics */}
              <CollapsibleSection
                title="Protocol Analytics"
                subtitle="Historical data and trends"
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                defaultOpen={true}
              >
                <Analytics />
              </CollapsibleSection>
            </>
          )}

          {activeTab === 'user' && (
            <>
              {!wallet.isConnected ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-12 text-center">
                  <UserCircle className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-white mb-3">Connect Your Wallet</h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Please connect your wallet to view your personalized dashboard and interact with the protocol.
                  </p>
                  <button
                    onClick={connectWallet}
                    className="btn-primary px-8 py-3 text-lg inline-flex items-center space-x-2"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>
                </div>
              ) : !wallet.isCorrectNetwork ? (
                <div className="bg-gray-800 border border-yellow-600 rounded-xl shadow-lg p-12 text-center">
                  <h3 className="text-3xl font-bold text-yellow-500 mb-3">Wrong Network</h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Please switch to OORT Testnet (Chain ID: 9700) to interact with the protocol.
                  </p>
                </div>
              ) : (
                <>
                  {/* User Dashboard */}
                  <CollapsibleSection
                    title="Your Position"
                    subtitle="View your current balances and stats"
                    icon={<User className="w-6 h-6 text-white" />}
                    defaultOpen={true}
                  >
                    <UserPosition userPosition={infraFi.userPosition} isLoading={infraFi.isLoading.userPosition} />
                  </CollapsibleSection>

                  {/* Trading Interface */}
                  <CollapsibleSection
                    title="Supply & Borrow"
                    subtitle="Manage your lending and borrowing"
                    icon={<Wallet className="w-6 h-6 text-white" />}
                    defaultOpen={true}
                  >
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
                  </CollapsibleSection>

                  {/* Node Management */}
                  <CollapsibleSection
                    title="My Nodes"
                    subtitle="Manage your node collateral"
                    icon={<Server className="w-6 h-6 text-white" />}
                    defaultOpen={false}
                  >
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
                  </CollapsibleSection>

                          {/* User Insights */}
                          <CollapsibleSection
                            title="Your Insights"
                            subtitle="Personal statistics and performance"
                            icon={<Lightbulb className="w-6 h-6 text-white" />}
                            defaultOpen={false}
                          >
                            <UserInsights address={wallet.address} />
                          </CollapsibleSection>

                          {/* Performance Analytics */}
                          <CollapsibleSection
                            title="Performance Analytics"
                            subtitle="Detailed ROI, profit/loss, and strategy analysis"
                            icon={<Target className="w-6 h-6 text-white" />}
                            defaultOpen={false}
                          >
                            <PerformanceAnalytics address={wallet.address} />
                          </CollapsibleSection>

                          {/* User Timeline */}
                          <CollapsibleSection
                            title="Transaction History"
                            subtitle="Complete activity timeline"
                            icon={<Clock className="w-6 h-6 text-white" />}
                            defaultOpen={false}
                          >
                            <UserTimeline address={wallet.address} />
                          </CollapsibleSection>
                </>
              )}
            </>
          )}
        </div>
      )}
    </TabNavigation>
  )
}
