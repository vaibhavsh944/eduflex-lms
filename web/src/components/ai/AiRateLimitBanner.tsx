import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AiRateLimitBannerProps {
  remaining: number;
  limit: number;
  resetsAt?: string;
  onDismiss?: () => void;
  className?: string;
}

export function AiRateLimitBanner({
  remaining,
  limit,
  resetsAt,
  onDismiss,
  className,
}: AiRateLimitBannerProps) {
  const isExhausted = remaining <= 0;
  const usedPct = Math.min(((limit - remaining) / limit) * 100, 100);
  if (!isExhausted && usedPct < 75) return null;

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        isExhausted
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        className,
      )}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              {isExhausted
                ? 'Daily AI limit reached'
                : `${String(remaining)} of ${String(limit)} AI requests remaining`}
            </p>
            <p className="mt-1 text-xs opacity-80">
              {isExhausted
                ? resetsAt
                  ? `Resets at ${new Date(resetsAt).toLocaleTimeString()}`
                  : 'Resets at midnight UTC'
                : `You've used ${String(limit - remaining)} of ${String(limit)} requests today`}
            </p>
            <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-background">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isExhausted ? 'bg-destructive' : 'bg-amber-500',
                )}
                style={{ width: `${String(usedPct)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-xs">
              Dismiss
            </Button>
          )}
          {isExhausted && (
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled>
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
