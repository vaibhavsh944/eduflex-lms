import { format } from 'date-fns'
import { Download, ExternalLink, Mail, IndianRupee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge'
import { ROUTES } from '@/lib/constants'

interface PaymentHistoryRowProps {
  payment: {
    id: string
    amount: number
    currency: string
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    invoice_url?: string | null
    created_at: string
    course?: { id: string; title: string } | null
  }
}

export function PaymentHistoryRow({ payment }: PaymentHistoryRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b last:border-b-0">
      <div className="flex flex-wrap items-center gap-4 min-w-0">
        <div className="min-w-0 max-w-[200px]">
          <p className="font-semibold text-sm truncate">
            {payment.course?.title || 'Deleted Course'}
          </p>
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(payment.created_at), 'MMM d, yyyy')}
        </div>
        <div className="text-sm font-mono flex items-center gap-0.5 whitespace-nowrap">
          <IndianRupee className="h-3 w-3" />
          {Number(payment.amount).toFixed(2)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PaymentStatusBadge status={payment.status} />
        {payment.invoice_url && (
          <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <Download className="h-3 w-3 mr-1" />
              Invoice
            </Button>
          </a>
        )}
        {payment.status === 'paid' && payment.course && (
          <Link to={ROUTES.LEARN_COURSE(payment.course.id)}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Course
            </Button>
          </Link>
        )}
        {payment.status === 'paid' && (
          <a
            href={`mailto:support@eduflow.com?subject=Refund%20Request%3A%20${encodeURIComponent(payment.course?.title || 'Course')}&body=Payment%20ID%3A%20${payment.id}%0ACourse%3A%20${encodeURIComponent(payment.course?.title || 'N/A')}`}
          >
            <Button variant="ghost" size="sm">
              <Mail className="h-3 w-3 mr-1" />
              Request Refund
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
