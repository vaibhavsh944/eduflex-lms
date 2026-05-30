import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function EnrolledCourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-5 flex-1 flex flex-col space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </div>
  )
}
