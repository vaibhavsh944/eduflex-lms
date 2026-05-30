import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardStatCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
  colorAccent: 'blue' | 'green' | 'amber' | 'orange'
  className?: string
}

export function DashboardStatCard({ icon, value, label, colorAccent, className }: DashboardStatCardProps) {
  const getColors = () => {
    switch (colorAccent) {
      case 'blue': return 'bg-blue-500/10 text-blue-500'
      case 'green': return 'bg-green-500/10 text-green-500'
      case 'amber': return 'bg-amber-500/10 text-amber-500'
      case 'orange': return 'bg-orange-500/10 text-orange-500'
    }
  }

  return (
    <Card className={cn('p-5 flex items-center space-x-4 border-border/50 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group', className)}>
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110', getColors())}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold font-heading">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
