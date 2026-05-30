import type { WeeklyActivityPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function WeeklyActivityChart({ data }: { data: WeeklyActivityPoint[] }) {
  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Minutes studied per week.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="week_label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            />
            <Bar dataKey="minutes_studied" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Minutes Studied" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
