"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coins, Lock, Unlock, Menu, Home, Plus, Settings, User } from "lucide-react"
import Link from "next/link"
import { CountdownTimer } from "./countdown-timer"
import { formatReadableDate } from "@/lib/dateUtils"
import { formatTokenAmount, TokenType } from "@/lib/api"

interface Wallet {
  id: string
  name: string
  amount: number
  unlockDate: Date
  status: "locked" | "unlocked"
  createdAt: Date
  totalLockDuration: number
  tokenType?: TokenType
}

interface MobileDrawerProps {
  wallets: Wallet[]
  totalValue: number
  lockedValue: number
}

export function MobileDrawer({ wallets, totalValue, lockedValue }: MobileDrawerProps) {
  const lockedWallets = wallets.filter((wallet) => wallet.status === "locked")
  const unlockedWallets = wallets.filter((wallet) => wallet.status === "unlocked")

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">VF</span>
            </div>
            <SheetTitle>VeitFlare</SheetTitle>
          </div>
          <SheetDescription>Your time-locked Solana wallet</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="font-semibold">Portfolio Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-sm">{typeof totalValue === 'number' ? totalValue.toFixed(2) : '0.00'} SOL</p>
                  </div>
                </div>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Locked</p>
                    <p className="font-bold text-sm">{typeof lockedValue === 'number' ? lockedValue.toFixed(2) : '0.00'} SOL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="font-semibold">Navigation</h3>
            <div className="space-y-2">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-3" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-3" />
                  Create Wallet
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </div>
          </div>

          <Separator />

          {/* Recent Wallets */}
          {wallets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Recent Wallets</h3>
              <div className="space-y-3">
                {wallets.slice(0, 3).map((wallet) => (
                  <div key={wallet.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{wallet.name}</h4>
                      <Badge
                        variant={wallet.status === "locked" ? "destructive" : "default"}
                        className={`text-xs ${
                          wallet.status === "locked"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {wallet.status === "locked" ? (
                          <Lock className="h-2 w-2 mr-1" />
                        ) : (
                          <Unlock className="h-2 w-2 mr-1" />
                        )}
                        {wallet.status === "locked" ? "Locked" : "Available"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{wallet.tokenType ? formatTokenAmount(wallet.amount, wallet.tokenType) : wallet.amount.toFixed(2)} {wallet.tokenType || 'SOL'}</span>
                      <span className="text-muted-foreground">
                        {wallet.status === "locked" ? "Unlocks" : "Unlocked"}: {formatReadableDate(wallet.unlockDate)}
                      </span>
                    </div>
                    {wallet.status === "locked" && (
                      <div className="mt-2">
                        <CountdownTimer targetDate={wallet.unlockDate} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/create">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Wallet
                </Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}