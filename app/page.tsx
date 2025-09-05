"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return <LandingPage />
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" style={{ backgroundImage: "url('/hero-img.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="text-center space-y-8 bg-background/80 backdrop-blur-sm p-8 rounded-2xl">
        {/* VF Logo */}
        <div className="animate-fade-in-up">
          <div className="w-24 h-24 mx-auto bg-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-4xl font-bold text-primary-foreground">VF</span>
          </div>
        </div>

        {/* Brand Name */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-4xl font-bold text-foreground">VeitFlare</h1>
          <p className="text-muted-foreground mt-2">Time-Locked Solana Wallet</p>
        </div>

        {/* Loading indicator */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="w-32 h-1 bg-secondary rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "url('/hero-img.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Header */}
      <header className="border-b border-border bg-background/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">VF</span>
              </div>
              <span className="text-xl font-bold text-foreground">VeitFlare</span>
            </div>
            <WalletMultiButton className="flex items-center space-x-2 bg-transparent" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background/50">
        <div className="text-center space-y-8">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
              Secure Your Crypto with
              <span className="text-primary block">Time-Locked Wallets</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-6 max-w-3xl mx-auto text-pretty">
              VeitFlare provides advanced time-locking mechanisms for your Solana assets, ensuring your investments are
              protected from impulsive decisions and market volatility.
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="text-lg px-8 py-6">
                  Create Time-Locked Wallet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center space-y-4 animate-fade-in-up bg-background/80 backdrop-blur-sm" style={{ animationDelay: "0.4s" }}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Secure by Design</h3>
            <p className="text-muted-foreground">
              Built on Solana's robust blockchain with advanced cryptographic security measures.
            </p>
          </Card>

          <Card className="p-8 text-center space-y-4 animate-fade-in-up bg-background/80 backdrop-blur-sm" style={{ animationDelay: "0.6s" }}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Time-Lock Protection</h3>
            <p className="text-muted-foreground">
              Set custom time locks to prevent early withdrawals and protect your long-term investments.
            </p>
          </Card>

          <Card className="p-8 text-center space-y-4 animate-fade-in-up bg-background/80 backdrop-blur-sm" style={{ animationDelay: "0.8s" }}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Experience near-instant transactions with Solana's high-performance blockchain.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
