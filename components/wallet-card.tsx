"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Calendar, Lock, Unlock, Eye, Download, MoreHorizontal, Copy } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import { WalletDetailsModal } from "./wallet-details-modal"
import { ErrorModal } from "./error-modal" // Import the new ErrorModal
import { useToast } from "@/hooks/use-toast"
import { withdrawFunds, formatTokenAmount, TokenType, TOKEN_INFO } from "@/lib/api"
import { formatReadableDate } from "@/lib/dateUtils"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWalletContext } from "@/context/wallet-context"

interface Wallet {
  id: string
  name: string
  amount: number
  unlockDate: Date
  status: "locked" | "unlocked"
  createdAt: Date
  totalLockDuration: number
  owner: string
  recipient: string
  tokenType: TokenType
  actualBalance?: number
}

interface WalletCardProps {
  wallet: Wallet
  animationDelay?: number
}

export function WalletCard({ wallet, animationDelay = 0 }: WalletCardProps) {
  const { toast } = useToast()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<{ title: string; description: string } | null>(null)
  const { updateWalletStatus } = useWalletContext()

  const isLocked = wallet.status === "locked"
  const now = new Date()
  const timeElapsed = now.getTime() - wallet.createdAt.getTime()
  const progressPercentage = Math.min((timeElapsed / wallet.totalLockDuration) * 100, 100)
  
  const formattedAmount = formatTokenAmount(wallet.amount, wallet.tokenType)
  const formattedActualBalance = wallet.actualBalance !== undefined ? 
    formatTokenAmount(wallet.actualBalance, 'SOL') : undefined

  // Check if wallet should be unlocked based on current time
  useEffect(() => {
    if (isLocked && wallet.unlockDate && new Date() >= wallet.unlockDate) {
      updateWalletStatus(wallet.id, "unlocked")
    }
  }, [isLocked, wallet.unlockDate, wallet.id, updateWalletStatus])

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError({
        title: "Wallet Not Connected",
        description: "Please connect your Solana wallet to withdraw.",
      })
      return
    }

    if (wallet.status === "locked") {
      setError({
        title: "Wallet Still Locked",
        description: "You can only withdraw funds after the unlock date.",
      })
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await withdrawFunds(
        publicKey.toBase58(),
        wallet.owner,
        wallet.tokenType
      )

      const transaction = Transaction.from(Buffer.from(response.transaction, 'base64'))
      const signature = await sendTransaction(transaction, connection)

      toast({
        title: "Withdrawal in Progress",
        description: "Waiting for transaction confirmation...",
      })

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

      toast({
        title: "Withdrawal Successful!",
        description: "Your funds have been withdrawn and the dashboard will now refresh.",
      })

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      setError({
        title: "Withdrawal Failed",
        description: error.message || "An error occurred during withdrawal.",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.id)
    toast({
      title: "Copied!",
      description: "Wallet ID copied to clipboard.",
    })
  }

  return (
    <>
      <Card
        className="animate-fade-in-up hover:shadow-lg transition-all duration-300"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        {/* Card content remains the same */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{wallet.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isLocked ? "destructive" : "default"}
                className={isLocked ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}
              >
                {isLocked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                {isLocked ? "Locked" : "Available"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4 mr-2" /> Copy Address
                  </DropdownMenuItem>
                  {!isLocked && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleWithdraw} disabled={isWithdrawing}>
                        <Download className="h-4 w-4 mr-2" /> {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {wallet.tokenType && (
                  <img 
                    src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${TOKEN_INFO[wallet.tokenType]?.mintAddress}/logo.png`} 
                    alt={wallet.tokenType}
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                    }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold text-foreground">{formattedAmount} {wallet.tokenType}</p>
                {formattedActualBalance && (
                  <p className="text-xs text-muted-foreground">
                    SOL Balance: {formattedActualBalance} SOL
                  </p>
                )}
              </div>
            </div>
          </div>

          {isLocked && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Remaining</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <CountdownTimer 
                targetDate={wallet.unlockDate} 
                onExpire={() => updateWalletStatus(wallet.id, "unlocked")} 
              />
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{isLocked ? "Unlocks on" : "Unlocked on"}</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatReadableDate(wallet.unlockDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <WalletDetailsModal wallet={wallet} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ErrorModal 
        isOpen={!!error}
        onClose={() => setError(null)}
        title={error?.title || ""}
        description={error?.description || ""}
      />
    </>
  )
}
