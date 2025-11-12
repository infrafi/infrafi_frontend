import { Eip1193Provider } from 'ethers'

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
    okxwallet?: Eip1193Provider & {
      isOkxWallet?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}

export {}

