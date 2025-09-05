"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Lock, Calendar, Coins, Wallet, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createWallet, getWalletBalances, formatTokenAmount, TokenType } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CreateWalletPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC")
  const [unlockDate, setUnlockDate] = useState("")
  const [unlockTime, setUnlockTime] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [walletName, setWalletName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balances, setBalances] = useState<Record<TokenType, number> | null>(null)
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionSignature, setTransactionSignature] = useState("")

  const tokenOptions = [
    { value: "SOL", label: "SOL", image: "/coin-logo/icons8-solana-64.png" },
    { value: "USDC", label: "USDC", image: "/coin-logo/icons8-usdc-64.png" },
    { value: "BONK", label: "BONK (Coming Soon)", image: "/coin-logo/bonk-logo.png", disabled: true },
    { value: "USDT", label: "USDT (Coming Soon)", image: "/coin-logo/icons8-tether-64.png", disabled: true },
    { value: "JUP", label: "JUP (Coming Soon)", image: "/coin-logo/jupiter-logo.png", disabled: true },
    { value: "RAY", label: "RAY (Coming Soon)", image: "/coin-logo/raydium-logo.png", disabled: true },
    { value: "USDG", label: "USDG (Coming Soon)", image: "/coin-logo/usdg-logo.png", disabled: true },
  ] as { value: TokenType; label: string; image: string; disabled?: boolean }[]

  useEffect(() => {
    const fetchBalances = async () => {
      if (publicKey) {
        setLoadingBalances(true)
        try {
          const fetchedBalances = await getWalletBalances(publicKey.toBase58())
          setBalances(fetchedBalances)
        } catch (err) {
          console.error("Failed to fetch balances:", err)
        } finally {
          setLoadingBalances(false)
        }
      }
    }
    fetchBalances()
  }, [publicKey])

  const handleCreateWallet = async () => {
    if (!connected || !publicKey || !connection || !signTransaction) {
      setError("Please connect your Solana wallet and ensure it supports signing.")
      return
    }

    setIsCreating(true)
    try {
      const unlockDateTime = new Date(`${unlockDate}T${unlockTime}`)
      const unlockTimestamp = Math.floor(unlockDateTime.getTime() / 1000)
      
      const response = await createWallet(
        publicKey.toBase58(),
        walletName,
        parseFloat(amount),
        selectedToken,
        unlockTimestamp,
        recipientAddress || undefined
      )
      
      const transaction = Transaction.from(Buffer.from(response.transaction, 'base64'))
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature, 'confirmed')
      
      setTransactionSignature(signature)
      setShowSuccessModal(true)
      
      toast({
        title: "Wallet Created",
        description: `Your time-locked wallet has been created successfully.`,
      })
    } catch (error: any) {
      setError(error.message || "Failed to create wallet")
    } finally {
      setIsCreating(false)
    }
  }

  const getUnlockDateTime = () => {
    if (!unlockDate || !unlockTime) return "Not set"
    const dateTime = new Date(`${unlockDate}T${unlockTime}`)
    return dateTime.toLocaleString()
  }

  const getTimeUntilUnlock = () => {
    if (!unlockDate || !unlockTime) return "Not set"
    const unlockDateTime = new Date(`${unlockDate}T${unlockTime}`)
    const now = new Date()
    const diff = unlockDateTime.getTime() - now.getTime()

    if (diff <= 0) return "Already unlocked"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const renderBalanceInfo = () => {
    if (loadingBalances) {
      return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking balance...</div>
    }

    if (balances) {
      if (selectedToken === "SOL") {
        const solBalance = balances["SOL"];
        return <p className="text-sm text-primary">Your balance: {solBalance.toFixed(4)} SOL</p>
      } else {
        const tokenBalance = balances[selectedToken];
        if (tokenBalance > 0) {
          const formattedBalance = formatTokenAmount(tokenBalance, selectedToken)
          return <p className="text-sm text-primary">Your balance: {formattedBalance} {selectedToken}</p>
        }
        return (
          <p className="text-sm text-destructive">
            Note: You must have {selectedToken} in your wallet to create a lock.
          </p>
        )
      }
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "url('/hero-img.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <header className="border-b border-border bg-background/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-sm font-bold text-primary-foreground">VF</span></div>
                <span className="text-xl font-bold text-foreground">VeitFlare</span>
              </div>
            </div>
            <WalletMultiButton className="flex items-center space-x-2 bg-transparent" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 bg-background/30">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Create Time-Locked Wallet</h1>
            <p className="text-muted-foreground text-lg">Secure your assets with customizable time-locks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="animate-fade-in-up bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Lock className="h-5 w-5 text-primary" /><span>Configuration</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="walletName">Wallet Name</Label>
                  <Input id="walletName" placeholder="e.g., University Fund" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as TokenType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tokenOptions.map((token) => (
                        <SelectItem key={token.value} value={token.value} disabled={token.disabled}>
                          <div className="flex items-center space-x-2">
                            <img src={token.image} alt={token.label} className="w-4 h-4" />
                            <span>{token.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="h-5 mt-1">{renderBalanceInfo()}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({selectedToken})</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <Label>Unlock Date & Time</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                    <Input type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address (Optional)</Label>
                  <Input id="recipient" placeholder="Leave empty for self" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="animate-fade-in-up bg-background/80 backdrop-blur-sm" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Wallet Preview</span>
                </CardTitle>
                <CardDescription>Review your time-locked wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wallet Name</span>
                    <span className="font-medium">{walletName || "Unnamed Wallet"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-medium text-primary">
                      {amount || "0.00"} {selectedToken}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unlock Date/Time</span>
                    <span className="font-medium">{getUnlockDateTime()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Until Unlock</span>
                    <span className="font-medium text-accent">{getTimeUntilUnlock()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      <Lock className="h-3 w-3 mr-1" />
                      Time-Locked
                    </span>
                  </div>
                  
                  {connected && publicKey && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your Wallet</span>
                      <span className="font-medium text-muted-foreground">
                        {publicKey.toBase58().substring(0, 6)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-medium text-destructive mb-2">Important Notice</h4>
                  <p className="text-sm text-muted-foreground">
                    Once created, this time-locked wallet cannot be accessed until the unlock date. Please verify all
                    details before confirming.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              onClick={handleCreateWallet}
              disabled={!amount || !walletName || !unlockDate || !unlockTime || !connected || isCreating}
              className="w-full"
            >
              {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Wallet"}
            </Button>
          </div>
        </div>
      </main>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="h-6 w-6 mr-2" />
              Wallet Created Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">Your time-locked wallet has been created on the Solana blockchain.</p>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Transaction Signature:</p>
                <p className="font-mono text-xs break-all mt-1">{transactionSignature}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessModal(false);
              router.push(`/wallet/${transactionSignature}`);
            }}>
              View Wallet Details
            </AlertDialogAction>
            <AlertDialogAction variant="outline" onClick={() => {
              window.open(`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`, '_blank');
            }}>
              View on Explorer
            </AlertDialogAction>
            <AlertDialogAction variant="outline" onClick={() => {
              setShowSuccessModal(false);
              router.push("/dashboard");
            }}>
              Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
