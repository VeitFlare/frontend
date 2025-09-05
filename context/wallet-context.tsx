"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Wallet } from "@/app/dashboard/page"

interface WalletContextType {
  wallets: Wallet[]
  updateWalletStatus: (walletId: string, status: "locked" | "unlocked") => void
  refreshWallets: (newWallets: Wallet[]) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children, initialWallets }: { children: ReactNode; initialWallets: Wallet[] }) {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)

  const updateWalletStatus = (walletId: string, status: "locked" | "unlocked") => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.id === walletId ? { ...wallet, status } : wallet
      )
    )
  }

  const refreshWallets = (newWallets: Wallet[]) => {
    setWallets(newWallets)
  }

  return (
    <WalletContext.Provider value={{ wallets, updateWalletStatus, refreshWallets }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}