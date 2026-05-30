import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelDataPoint {
  name: string;
  value: number;
  total: number;
}

interface CompletionFunnelChartProps {
  data: FunnelDataPoint[];
  title?: string;
}

export function CompletionFunnelChart({ data, title = 'Completion Funnel' }: CompletionFunnelChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No completion data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${String(v)}%`} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
                labelFormatter={(label: string) => label}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => {
                  const hue = 220 - (index / data.length) * 40;
                  const fill = `hsl(${String(hue)}, 70%, 50%)`;
                  const fillOpacity = 1 - (index / data.length) * 0.3;
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  return <Cell key={`cell-${String(index)}`} fill={fill} fillOpacity={fillOpacity} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
