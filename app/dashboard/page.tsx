"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, Lock, Unlock, Settings, Coins } from "lucide-react"
import Link from "next/link"
import { WalletCard } from "@/components/wallet-card"
import { WalletCardSkeleton } from "@/components/wallet-card-skeleton"
import { MobileDrawer } from "@/components/mobile-drawer"
import { useToast } from "@/hooks/use-toast"
import { getUserWallets, formatTokenAmount, TokenType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WalletProvider, useWalletContext } from "@/context/wallet-context"

interface Wallet {
  id: string
  name: string
  amount: number
  unlockDate: Date
  status: "locked" | "unlocked"
  createdAt: Date
  totalLockDuration: number
  owner?: string
  recipient?: string
  tokenType?: TokenType
  actualBalance?: number
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(true)
  const [selectedLockedToken, setSelectedLockedToken] = useState<TokenType>('SOL')
  const [walletIdInput, setWalletIdInput] = useState("")
  const { toast } = useToast()

  const { wallets, refreshWallets } = useWalletContext()

  useEffect(() => {
    if (publicKey) {
      const fetchWallets = async () => {
        setLoading(true)
        try {
          const fetchedWallets = await getUserWallets(publicKey.toBase58())
          refreshWallets(fetchedWallets)
        } catch (error) {
          console.error("Failed to fetch wallets:", error)
          toast({
            title: "Error",
            description: "Could not fetch your wallets.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchWallets()
    } else {
      refreshWallets([])
      setLoading(false)
    }
  }, [publicKey, toast, refreshWallets])

  const lockedWallets = wallets.filter((wallet) => wallet.status === "locked")
  const unlockedWallets = wallets.filter((wallet) => wallet.status === "unlocked")

  // Function to manually fetch a wallet by its ID
  const fetchWalletById = async (walletId: string) => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/wallets/${walletId}?ownerPublicKey=${publicKey.toBase58()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch wallet');
      }

      const data = await response.json();
      
      const wallet: Wallet = {
        id: data.wallet.id,
        name: 'Shared Time-Locked Wallet',
        amount: data.wallet.amount,
        unlockDate: new Date(data.wallet.unlockTimestamp * 1000),
        status: data.wallet.isUnlocked ? "unlocked" : "locked",
        createdAt: new Date(),
        totalLockDuration: 0,
        owner: data.wallet.owner,
        recipient: data.wallet.recipient,
        tokenType: data.wallet.tokenType,
        actualBalance: data.wallet.actualBalance,
      };

      // Add the new wallet to the context
      refreshWallets([...wallets, wallet]);
      
      toast({
        title: "Success",
        description: "Wallet added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total values for metrics
  const totalValues = wallets.reduce((acc, wallet) => {
    const tokenType = wallet.tokenType || 'SOL';
    acc[tokenType] = (acc[tokenType] || 0) + wallet.amount;
    return acc;
  }, {} as Record<TokenType, number>);

  const lockedValues = lockedWallets.reduce((acc, wallet) => {
    const tokenType = wallet.tokenType || 'SOL';
    acc[tokenType] = (acc[tokenType] || 0) + wallet.amount;
    return acc;
  }, {} as Record<TokenType, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MobileDrawer wallets={wallets} totalValue={Object.values(totalValues).reduce((a, b) => a + b, 0)} lockedValue={Object.values(lockedValues).reduce((a, b) => a + b, 0)} />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">VF</span>
              </div>
              <span className="text-xl font-bold text-foreground">VeitFlare</span>
            </div>
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                      Manage your application preferences.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <p className="text-muted-foreground">More settings options coming soon!</p>
                  </div>
                </SheetContent>
              </Sheet>
              <WalletMultiButton className="hidden md:block" />
              <Link href="/create">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Wallet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your time-locked Solana wallets</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {/* Total Wallets Card */}
                <Card className="animate-fade-in-up">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Wallets</p>
                        <p className="text-2xl font-bold text-foreground">{wallets.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Locked Wallets Card */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <Lock className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Locked Wallets</p>
                        <p className="text-2xl font-bold text-foreground">{lockedWallets.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Unlocked Wallets Card */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Unlock className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Wallets</p>
                        <p className="text-2xl font-bold text-foreground">{unlockedWallets.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Locked Value Card */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Coins className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Locked Value</p>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-foreground">
                              {formatTokenAmount(lockedValues[selectedLockedToken || 'SOL'] || 0, selectedLockedToken || 'SOL')}
                            </p>
                            <span className="text-sm text-muted-foreground">{selectedLockedToken || 'SOL'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WalletCardSkeleton />
              <WalletCardSkeleton />
            </div>
          ) : (
            <>
              {/* Locked Wallets Section */}
              {lockedWallets.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Time-Locked Wallets</h2>
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                      <Lock className="h-3 w-3 mr-1" />
                      {lockedWallets.length} Locked
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {lockedWallets.map((wallet, index) => (
                      <WalletCard key={wallet.id} wallet={wallet} animationDelay={index * 0.1} />
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocked Wallets Section */}
              {unlockedWallets.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Available Wallets</h2>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      <Unlock className="h-3 w-3 mr-1" />
                      {unlockedWallets.length} Available
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {unlockedWallets.map((wallet, index) => (
                      <WalletCard key={wallet.id} wallet={wallet} animationDelay={index * 0.1} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && wallets.length === 0 && (
                <Card className="animate-fade-in-up">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No wallets yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first time-locked wallet to get started with VeitFlare
                    </p>
                    <Link href="/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Wallet
                      </Button>
                    </Link>
                    <div className="mt-8 pt-6 border-t border-border">
                      <h4 className="text-lg font-semibold text-foreground mb-4">Add Wallet by ID</h4>
                      <p className="text-muted-foreground mb-4">
                        If you have a wallet ID (PDA address) shared with you, you can add it here.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input
                          type="text"
                          value={walletIdInput}
                          onChange={(e) => setWalletIdInput(e.target.value)}
                          placeholder="Enter wallet ID (PDA address)"
                          className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
                        />
                        <Button 
                          onClick={() => fetchWalletById(walletIdInput)}
                          disabled={!walletIdInput || loading}
                        >
                          Add Wallet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
