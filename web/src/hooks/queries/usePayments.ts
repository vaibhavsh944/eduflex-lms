import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Payment } from '@/lib/types'
import { useAuthStore } from '@/store/authStore'
import { usePaymentStore } from '@/store/paymentStore'

export function usePayments(userId?: string) {
  const currentUserId = useAuthStore(state => state.user?.id)
  const targetId = userId || currentUserId

  return useQuery({
    queryKey: ['payments', targetId],
    queryFn: async () => {
      if (!targetId) return []
      const { data, error } = await supabase
        .from('payments')
        .select('*, course:courses(id, title, thumbnail_url)')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!targetId,
  })
}

export function useCreateOrder() {
  const { setPendingOrder, setPaymentStatus } = usePaymentStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ courseId, couponCode }: { courseId: string; couponCode?: string }) => {
      setPaymentStatus('creating-order')
      const { data, error } = await supabase.functions.invoke('payments/create-order', {
        body: { course_id: courseId, coupon_code: couponCode },
      })
      if (error) throw error
      setPendingOrder(data.order_id, courseId)
      setPaymentStatus('awaiting-payment')
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useVerifyPayment() {
  const { setPaymentStatus, setErrorMessage, pendingCourseId, resetPayment } = usePaymentStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      setPaymentStatus('verifying')
      const { data, error } = await supabase.functions.invoke('payments/verify', { body: payload })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setPaymentStatus('success')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollment'] })
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] })
    },
    onError: (err: Error) => {
      setPaymentStatus('failed')
      setErrorMessage(err.message || 'Payment verification failed')
    },
  })
}
