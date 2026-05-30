import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCalendarProps {
  activityDates: string[]
  currentStreak: number
  longestStreak: number
}

export function StreakCalendar({ activityDates, currentStreak, longestStreak }: StreakCalendarProps) {
  // Get last 7 days as YYYY-MM-DD strings
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Flame className="w-5 h-5 mr-2 text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6 mt-2">
          {last7Days.map((dateStr) => {
            const dateObj = new Date(dateStr)
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            const isActive = activityDates.includes(dateStr)
            const isToday = dateStr === todayStr

            return (
              <div key={dateStr} className="flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors',
                    isActive ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground',
                    isToday && 'ring-2 ring-orange-500 ring-offset-2 ring-offset-background'
                  )}
                >
                  {isActive ? <Flame className="w-4 h-4" /> : dateObj.getDate()}
                </div>
                <span className={cn('text-xs', isToday ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                  {dayName}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center space-x-6 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <p className="text-2xl font-bold font-heading">{currentStreak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
            <p className="text-2xl font-bold font-heading">{longestStreak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
