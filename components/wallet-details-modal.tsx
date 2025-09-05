"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Clock, Lock, Unlock, Copy, ExternalLink, Download, AlertTriangle } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import { SlideToConfirm } from "./slide-to-confirm"
import { useToast } from "@/hooks/use-toast"
import { withdrawFunds, formatTokenAmount, TokenType, TOKEN_INFO } from "@/lib/api"
import { formatReadableDate } from "@/lib/dateUtils"

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

interface WalletDetailsModalProps {
  wallet: Wallet | null
  isOpen: boolean
  onClose: () => void
}

export function WalletDetailsModal({ wallet, isOpen, onClose }: WalletDetailsModalProps) {
  const { toast } = useToast()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  if (!wallet) return null

  const isLocked = wallet.status === "locked"
  const now = new Date()
  const timeElapsed = now.getTime() - wallet.createdAt.getTime()
  const progressPercentage = Math.min((timeElapsed / wallet.totalLockDuration) * 100, 100)
  
  // Format amounts with correct decimals
  const formattedAmount = wallet.tokenType ? formatTokenAmount(wallet.amount, wallet.tokenType) : wallet.amount.toFixed(2)
  const formattedActualBalance = wallet.actualBalance !== undefined ? 
    formatTokenAmount(wallet.actualBalance, 'SOL') : 
    wallet.actualBalance?.toFixed(6)

  const handleWithdraw = async () => {
    if (!wallet?.tokenType) return
    
    setIsWithdrawing(true)
    try {
      const result = await withdrawFunds(wallet.id, wallet.owner || "", wallet.tokenType)
      
      toast({
        title: "Success",
        description: "Funds withdrawn successfully!",
      })
      
      // Close the modal and refresh the wallet data
      setShowWithdrawConfirm(false)
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const copyWalletId = () => {
    navigator.clipboard.writeText(wallet.id)
    toast({
      title: "Copied",
      description: "Wallet ID copied to clipboard",
    })
  }

  const viewOnExplorer = () => {
    // Open Solana explorer in a new tab (devnet)
    const explorerUrl = `https://explorer.solana.com/address/${wallet.id}?cluster=devnet`
    window.open(explorerUrl, '_blank')
  }

  const shareWallet = () => {
    if (!wallet.tokenType) return
    
    // Share wallet details on X (Twitter)
    const walletInfo = `Check out my time-locked wallet on VeitFlare:

Wallet: ${wallet.name}
Amount: ${formattedAmount} ${wallet.tokenType}
Status: ${wallet.status === "locked" ? "🔒 Time-Locked" : "🔓 Available"}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(walletInfo)}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{wallet.name}</DialogTitle>
            <Badge
              variant={isLocked ? "destructive" : "default"}
              className={isLocked ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}
            >
              {isLocked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
              {isLocked ? "Time-Locked" : "Available"}
            </Badge>
          </div>
          <DialogDescription>Detailed information about your time-locked wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {wallet.tokenType && (
                  // Token icon
                  <img 
                    src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${TOKEN_INFO[wallet.tokenType]?.mintAddress}/logo.png`} 
                    alt={wallet.tokenType}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      // Fallback to generic token icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                    }}
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-4xl font-bold text-primary">{formattedAmount} {wallet.tokenType || "SOL"}</p>
                {wallet.actualBalance !== undefined && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Actual SOL Balance: {formattedActualBalance} SOL
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Countdown Timer for Locked Wallets */}
          {isLocked && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Time Remaining</h3>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <CountdownTimer targetDate={wallet.unlockDate} />

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lock Progress</span>
                  <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {wallet.createdAt.toLocaleDateString()}</span>
                  <span>Unlocks: {wallet.unlockDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Wallet Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wallet Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Wallet ID</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-secondary px-2 py-1 rounded truncate max-w-[200px]">{wallet.id}</code>
                  <Button variant="ghost" size="sm" onClick={copyWalletId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Token Type</p>
                <p className="font-medium">{wallet.tokenType || "SOL"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{isLocked ? "Time-Locked" : "Available for Withdrawal"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="font-medium">{formatReadableDate(wallet.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Unlock Date</p>
                <p className="font-medium">{formatReadableDate(wallet.unlockDate)}</p>
              </div>
              {wallet.recipient && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-secondary px-2 py-1 rounded truncate max-w-[200px]">{wallet.recipient}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.recipient || "");
                        toast({
                          title: "Copied",
                          description: "Recipient address copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions</h3>

            {isLocked ? (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Wallet is Time-Locked</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This wallet cannot be accessed until the unlock date. The funds are securely locked on the
                      blockchain.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!showWithdrawConfirm ? (
                  <Button onClick={() => setShowWithdrawConfirm(true)} className="w-full" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <h4 className="font-medium text-destructive mb-2">Confirm Withdrawal</h4>
                      <p className="text-sm text-muted-foreground">
                        You are about to withdraw {formattedAmount} {wallet.tokenType || "SOL"} from this wallet. This action cannot be
                        undone.
                      </p>
                    </div>
                    <SlideToConfirm
                      onConfirm={handleWithdraw}
                      isLoading={isWithdrawing}
                      text="Slide to Withdraw"
                      confirmText="Processing Withdrawal..."
                    />
                    <Button variant="outline" onClick={() => setShowWithdrawConfirm(false)} className="w-full">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={viewOnExplorer}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={shareWallet}>
                <Copy className="h-4 w-4 mr-2" />
                Share on X
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}