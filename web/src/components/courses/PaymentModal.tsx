import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { CouponInput } from '@/components/payments/CouponInput'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePaymentStore } from '@/store/paymentStore'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface PaymentModalProps {
  courseId:   string
  price:      number
  isOpen:     boolean
  onClose:    () => void
}

export function PaymentModal({ courseId, price, isOpen, onClose }: PaymentModalProps) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)
  const { paymentStatus, errorMessage, setPaymentStatus, setErrorMessage, resetPayment } = usePaymentStore()

  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState<{ type: 'percent' | 'flat'; value: number } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const finalPrice = discount
    ? discount.type === 'percent'
      ? price * (1 - discount.value / 100)
      : Math.max(0, price - discount.value)
    : price

  const handlePayment = useCallback(async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setPaymentStatus('creating-order')
      const { data: order, error: orderError } = await supabase.functions.invoke('payments/create-order', {
        body: { course_id: courseId, coupon_code: couponCode || undefined },
      })
      if (orderError) throw orderError

      setPaymentStatus('awaiting-payment')

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'EduFlow',
        description: 'Course Purchase',
        theme: { color: '#4F46E5' },
        handler: async function (response: any) {
          setPaymentStatus('verifying')
          const { error: verifyError } = await supabase.functions.invoke('payments/verify', {
            body: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          })
          if (verifyError) {
            setPaymentStatus('failed')
            setErrorMessage('Payment verification failed. Please contact support.')
            return
          }
          setPaymentStatus('success')
          setIsSuccess(true)
          qc.invalidateQueries({ queryKey: ['enrollment', courseId] })
          setTimeout(() => navigate(`/learn/${courseId}`), 2000)
        },
        modal: { ondismiss: () => setPaymentStatus('idle') },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setPaymentStatus('failed')
      setErrorMessage(err.message || 'Failed to create order')
    }
  }, [courseId, couponCode, user, navigate, qc, setPaymentStatus, setErrorMessage])

  const handleApplyCoupon = useCallback(async (code: string) => {
    const { data, error } = await supabase.functions.invoke('payments/validate-coupon', {
      body: { coupon_code: code, course_id: courseId },
    })
    if (error || !data?.valid) throw new Error(data?.message || 'Invalid or expired coupon code')
    setCouponCode(code)
    setDiscount(data.discount)
  }, [courseId])

  const handleClose = () => {
    resetPayment()
    setIsSuccess(false)
    onClose()
  }

  const isLoading = paymentStatus === 'creating-order' || paymentStatus === 'verifying'

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                Secure payment via Razorpay
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course price</span>
                  <span>₹{price.toFixed(2)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{(price - finalPrice).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <CouponInput
                onApply={handleApplyCoupon}
                onRemove={() => { setCouponCode(null); setDiscount(null) }}
                appliedCode={couponCode}
                discount={discount}
              />

              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">{errorMessage}</p>
              )}

              <Button className="w-full" size="lg" onClick={handlePayment} disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{paymentStatus === 'creating-order' ? 'Creating order...' : 'Verifying...'}</>
                ) : paymentStatus === 'failed' ? 'Try Again' : `Pay ₹${finalPrice.toFixed(2)}`}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay
              </p>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">Redirecting to course...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
