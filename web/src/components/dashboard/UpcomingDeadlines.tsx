import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarClock, PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRelativeTime } from '@/lib/utils'
import type { UpcomingDeadline } from '@/lib/types'

export function UpcomingDeadlines({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center text-lg">
          <CalendarClock className="w-5 h-5 mr-2 text-blue-500" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <p className="text-sm font-medium">No upcoming deadlines.</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {deadlines.map((item) => {
              const due = new Date(item.due_at)
              const now = new Date()
              const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
              
              let colorClass = 'text-green-500'
              if (diffHours < 0) colorClass = 'text-red-500 font-bold'
              else if (diffHours < 24) colorClass = 'text-red-500'
              else if (diffHours < 72) colorClass = 'text-amber-500'

              return (
                <Link 
                  key={item.assignment_id} 
                  to={`/learn/${item.course_id}/assignment/${item.lesson_id}`}
                  className="flex items-start p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.assignment_title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {item.course_title}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${colorClass}`}>
                      {diffHours < 0 ? 'Overdue' : `Due ${formatRelativeTime(item.due_at)}`}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
