'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { DollarSign } from 'lucide-react'

export function Header() {
  const { wallet, connectWallet, disconnectWallet, switchNetwork } = useWeb3()

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-white">InfraFi</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-100">
                    {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : ''}
                  </div>
                  <div className={`text-xs ${wallet.isCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
                    {wallet.isCorrectNetwork ? 'OORT Network' : 'Wrong Network'}
                  </div>
                </div>
                
                {!wallet.isCorrectNetwork && (
                  <button
                    onClick={switchNetwork}
                    className="btn btn-primary text-sm"
                  >
                    Switch Network
                  </button>
                )}
                
                <button
                  onClick={disconnectWallet}
                  className="btn btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
