import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createSupabaseAdmin } from "../../_shared/supabase.ts"
import { corsHeaders } from "../../_shared/cors.ts"

function verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret)
    const data = new TextEncoder().encode(rawBody)
    const algorithm = { name: 'HMAC', hash: 'SHA-256' }
    return crypto.subtle
      .importKey('raw', key, algorithm, false, ['sign'])
      .then(k => crypto.subtle.sign('HMAC', k, data))
      .then(sig => {
        const expected = Array.from(new Uint8Array(sig))
          .map(b => b.toString(16).padStart(2, '0')).join('')
        return expected === signature
      })
  } catch {
    return Promise.resolve(false)
  }
}

serve(async (req) => {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      console.error('Missing webhook signature or secret')
      return new Response('Unauthorized', { status: 401 })
    }

    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const paymentEntity = event.payload?.payment?.entity

    if (!paymentEntity) {
      console.error('Invalid webhook payload: missing payment entity')
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const razorpayPaymentId = paymentEntity.id
    const razorpayOrderId = paymentEntity.order_id
    const supabaseAdmin = createSupabaseAdmin()

    if (event.event === 'payment.captured') {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('*, course:courses(title)')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (!payment) {
        console.error('Payment record not found for order:', razorpayOrderId)
        return new Response('ok', { status: 200, headers: corsHeaders })
      }

      if (payment.status === 'paid') {
        return new Response('ok', { status: 200, headers: corsHeaders })
      }

      const now = new Date().toISOString()

      await supabaseAdmin.from('payments').update({
        razorpay_payment_id: razorpayPaymentId,
        status: 'paid',
        transaction_id: razorpayPaymentId,
        paid_at: now,
        updated_at: now,
      }).eq('id', payment.id)

      const { data: existingEnrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)
        .maybeSingle()

      if (!existingEnrollment) {
        await supabaseAdmin.from('enrollments').insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          status: 'active',
          enrolled_at: now,
          progress: 0,
        })
      }

      if (payment.coupon_code) {
        const { data: coupon } = await supabaseAdmin
          .from('coupons')
          .select('id')
          .eq('code', payment.coupon_code)
          .single()

        if (coupon) {
          await supabaseAdmin.rpc('increment_coupon_usage', { p_coupon_id: coupon.id })
        }
      }

      await supabaseAdmin.from('user_points_log').insert({
        user_id: payment.user_id,
        points: 20,
        reason: 'course_purchased',
        reference_id: payment.course_id,
      })

      await supabaseAdmin.from('notifications').insert({
        user_id: payment.user_id,
        type: 'enrollment_confirmed',
        title: 'Payment Successful',
        body: `Your enrollment in ${(payment.course as any)?.title || 'Course'} is confirmed.`,
        metadata: { course_id: payment.course_id, payment_id: payment.id },
      })

    } else if (event.event === 'payment.failed') {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id, status')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (payment && payment.status !== 'failed') {
        await supabaseAdmin.from('payments').update({
          razorpay_payment_id: razorpayPaymentId,
          status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', payment.id)
      }
    }

    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('ok', { status: 200, headers: corsHeaders })
  }
})
