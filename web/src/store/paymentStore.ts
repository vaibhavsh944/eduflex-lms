import { create } from 'zustand'

type PaymentStatus = 'idle' | 'creating-order' | 'awaiting-payment' | 'verifying' | 'success' | 'failed'

interface PaymentStore {
  pendingOrderId: string | null
  pendingCourseId: string | null
  paymentStatus: PaymentStatus
  errorMessage: string | null
  setPendingOrder: (orderId: string, courseId: string) => void
  setPaymentStatus: (s: PaymentStatus) => void
  setErrorMessage: (msg: string | null) => void
  resetPayment: () => void
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  pendingOrderId: null,
  pendingCourseId: null,
  paymentStatus: 'idle',
  errorMessage: null,
  setPendingOrder: (orderId, courseId) => set({ pendingOrderId: orderId, pendingCourseId: courseId }),
  setPaymentStatus: (s) => set({ paymentStatus: s }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  resetPayment: () => set({ pendingOrderId: null, pendingCourseId: null, paymentStatus: 'idle', errorMessage: null }),
}))
