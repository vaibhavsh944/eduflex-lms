import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface EngagementSparklineProps {
  data: { date: string; count: number }[]
}

export function EngagementSparkline({ data }: EngagementSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
        No activity data
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--popover))',
            }}
            formatter={(value) => [value, 'Events']}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill="url(#engagementFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
