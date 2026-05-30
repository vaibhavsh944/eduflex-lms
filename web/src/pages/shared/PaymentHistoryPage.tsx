import { PageHeader } from '@/components/common/PageHeader'
import { usePayments } from '@/hooks/queries/usePayments'
import { PaymentHistoryRow } from '@/components/payments/PaymentHistoryRow'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IndianRupee, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

export function PaymentHistoryPage() {
  const user = useAuthStore(state => state.user)
  const { data: payments, isLoading } = usePayments(user?.id)

  const paidPayments = payments?.filter(p => p.status === 'paid') || []
  const totalSpent = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const uniqueCourses = new Set(paidPayments.map(p => p.course?.id).filter(Boolean)).size

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <PageHeader title="Payment History" description="Track your purchases and payment activity" />
      </div>

      {paidPayments.length > 0 && (
        <Card className="mb-6 bg-muted/30 border-primary/10">
          <CardContent className="p-4 flex items-center gap-3 text-sm">
            <IndianRupee className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Total spent: ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across {uniqueCourses} {uniqueCourses === 1 ? 'course' : 'courses'}
            </span>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : !payments?.length ? (
        <Card><CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No payments yet</h3>
          <p className="text-muted-foreground mt-2">Your payment history will appear here after you purchase a course.</p>
          <Link to={ROUTES.CATALOG}><Button className="mt-4" variant="outline">Browse Courses</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y">
          {payments.map(payment => (
            <PaymentHistoryRow key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  )
}
