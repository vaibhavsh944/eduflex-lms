import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Level & XP Progress Skeleton */}
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-sm flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-xl" />
        <div className="flex-1 w-full space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-2 w-full mt-4" />
        </div>
        <Skeleton className="h-12 w-full sm:w-32 rounded-lg" />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-border/50 p-6 space-y-4">
          <Skeleton className="h-6 w-48 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-5 rounded-xl border border-border/50 p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
