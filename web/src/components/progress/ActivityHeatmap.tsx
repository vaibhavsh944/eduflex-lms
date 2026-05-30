import { useMemo } from 'react'
import type { ActivityDay } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfYear, endOfYear, eachDayOfInterval, getDay, differenceInWeeks, startOfWeek, addWeeks } from 'date-fns';

function getColor(count: number) {
  if (count === 0) return 'bg-muted/20 dark:bg-muted/10';
  if (count <= 1) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
  if (count <= 6) return 'bg-emerald-500 dark:bg-emerald-500';
  return 'bg-emerald-600 dark:bg-emerald-400';
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ActivityHeatmap({ data }: { data: ActivityDay[] }) {
  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of data) map.set(d.date, d.count)
    return map
  }, [data])

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date()
    const yearStart = startOfYear(today)
    const firstSun = startOfWeek(yearStart, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: firstSun, end: endOfYear(today) })

    const cols: { date: Date; count: number }[][] = []
    let col: { date: Date; count: number }[] = []
    for (const day of days) {
      col.push({
        date: day,
        count: activityMap.get(format(day, 'yyyy-MM-dd')) ?? 0,
      })
      if (getDay(day) === 6) {
        cols.push(col)
        col = []
      }
    }
    if (col.length > 0) cols.push(col)

    const labels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    cols.forEach((week, i) => {
      const m = week[0]?.date.getMonth() ?? -1
      if (m !== lastMonth) {
        labels.push({ label: format(week[0].date, 'MMM'), weekIndex: i })
        lastMonth = m
      }
    })

    return { weeks: cols, monthLabels: labels }
  }, [activityMap])

  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Your learning activity over the past year.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex ml-8 text-[10px] text-muted-foreground mb-1">
            {monthLabels.map((m, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : `${(m.weekIndex - (monthLabels[i - 1]?.weekIndex ?? 0)) * 14}px` }}>
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1 pt-0">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className="h-[14px] leading-[14px]">{i % 2 === 0 ? d : ''}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={format(day.date, 'yyyy-MM-dd')}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} activities`}
                    className={cn(
                      'w-[14px] h-[14px] rounded-[3px] transition-colors hover:ring-2 hover:ring-ring cursor-pointer',
                      getColor(day.count)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-[14px] h-[14px] rounded-[3px] bg-muted/20 dark:bg-muted/10" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-emerald-200 dark:bg-emerald-900/40" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-emerald-500 dark:bg-emerald-500" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-emerald-600 dark:bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
