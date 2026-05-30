import { cn } from '@/lib/utils'

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded'
}

const statusStyles: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusStyles[status])}>
      {status}
    </span>
  )
}
