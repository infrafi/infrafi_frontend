'use client'

import { Web3Provider } from '@/contexts/Web3Context'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  return (
    <ApolloProvider>
      <Web3Provider>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </Web3Provider>
    </ApolloProvider>
  )
}