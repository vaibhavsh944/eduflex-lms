import type { SkillRadarPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 142 76% 36%))',
  'hsl(var(--chart-3, 38 92% 50%))',
  'hsl(var(--chart-4, 271 91% 65%))',
  'hsl(var(--chart-5, 0 72% 51%))',
]

function getColor(index: number, score: number) {
  if (score >= 80) return COLORS[index % COLORS.length]
  if (score >= 60) return 'hsl(var(--chart-3, 38 92% 50%))'
  if (score >= 40) return 'hsl(var(--chart-4, 271 91% 65%))'
  return 'hsl(var(--chart-5, 0 72% 51%))'
}

export function SkillBreakdownChart({ data }: { data: SkillRadarPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
          <CardDescription>Your strengths across different subjects.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No skills data yet.</p>
        </CardContent>
      </Card>
    )
  }

  const sorted = [...data].sort((a, b) => b.avg_score - a.avg_score)

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Skill Breakdown</CardTitle>
        <CardDescription>Your strengths across different subjects.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }} barSize={24}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }} tickLine={false} axisLine={false} width={100} />
            <Tooltip
              formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: 13 }}
            />
            <Bar
              dataKey="avg_score"
              radius={[0, 6, 6, 0]}
              label={{ position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500, formatter: (v: number) => `${Math.round(v)}%` }}
            >
              {sorted.map((entry, index) => (
                <Cell key={entry.category} fill={getColor(index, entry.avg_score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
