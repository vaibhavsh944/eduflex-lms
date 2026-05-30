export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'paid' | 'cancelled';
export type DiscountType = 'percentage' | 'flat';

export interface Payment {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  readonly course_id: string;
  readonly order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  coupon_id: string | null;
  discount_applied: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Coupon {
  readonly id: string;
  readonly org_id: string | null;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  course_id: string | null;
  min_order_value: number | null;
  is_active: boolean;
  readonly created_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount_amount?: number;
  final_price?: number;
  reason?: string;
}

export interface InstructorEarning {
  readonly id: string;
  readonly instructor_id: string;
  readonly course_id: string;
  readonly payment_id: string;
  gross_amount: number;
  platform_cut: number;
  instructor_amount: number;
  payout_status: PayoutStatus;
  paid_at: string | null;
  readonly created_at: string;
}

export interface Invoice {
  readonly id: string;
  readonly payment_id: string;
  readonly user_id: string;
  invoice_number: string;
  pdf_url: string;
  tax_amount: number;
  readonly issued_at: string;
}

export interface UserCredit {
  readonly id: string;
  readonly user_id: string;
  amount: number;
  reason: string | null;
  expires_at: string | null;
  used: boolean;
  readonly created_at: string;
}
