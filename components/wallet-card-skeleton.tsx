"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WalletCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* Skeleton for CardTitle */}
          <Skeleton className="h-6 w-3/5 rounded-md" />
          {/* Skeleton for Badge */}
          <Skeleton className="h-6 w-1/4 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Skeleton for Amount Display */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center space-x-3">
            {/* Skeleton for Token Icon */}
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              {/* Skeleton for "Amount" label */}
              <Skeleton className="h-4 w-16 mb-2 rounded-md" />
              {/* Skeleton for Amount value */}
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Skeleton for Countdown/Progress section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          {/* Skeleton for Countdown Timer / Progress Bar */}
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-1/4 rounded-md" />
              <Skeleton className="h-3 w-1/6 rounded-md" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* Skeleton for Unlock Date */}
        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
