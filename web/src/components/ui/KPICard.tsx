import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  change?: number | null;
  changeLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  icon,
  label,
  value,
  change,
  changeLabel,
  isLoading,
  className,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== null && change !== undefined && change >= 0;
  const isNeutral = change === null || change === undefined;

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon && (
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              {icon}
            </div>
          )}
        </div>
        {!isNeutral && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={isPositive ? 'text-emerald-500' : 'text-destructive'}>
              {isPositive ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground"> {changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
