import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Menu } from 'lucide-react'

export function CoursePlayerSkeleton() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden animate-in fade-in duration-500">
      {/* Top Bar Skeleton */}
      <header className="h-14 border-b border-border/50 bg-card/40 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-8 h-8 rounded-md" />
          <div className="h-4 w-4 bg-border/50 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-2 w-32 rounded-full hidden sm:block" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="w-8 h-8 rounded-md lg:hidden" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Skeleton */}
        <aside className="w-80 border-r border-border/50 bg-card/20 backdrop-blur-xl flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-border/50 bg-card/40">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {Array.from({ length: 3 }).map((_, mIdx) => (
              <div key={mIdx} className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2 pl-2 border-l-2 border-border/20">
                  {Array.from({ length: 4 }).map((_, lIdx) => (
                    <div key={lIdx} className="flex items-center space-x-3 p-2">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative overflow-hidden p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
