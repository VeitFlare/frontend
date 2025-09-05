import { WalletProvider } from "@/context/wallet-context"
import { getUserWallets } from "@/lib/api"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initial wallets data for the context
  const initialWallets = []
  
  return (
    <WalletProvider initialWallets={initialWallets}>
      {children}
    </WalletProvider>
  )
}