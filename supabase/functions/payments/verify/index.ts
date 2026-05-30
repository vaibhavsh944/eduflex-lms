import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createSupabaseAdmin, createSupabaseClient } from "../../_shared/supabase.ts"
import { handleCors, jsonResponse, errorResponse } from "../../_shared/cors.ts"

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret)
    const data = new TextEncoder().encode(`${orderId}|${paymentId}`)
    const algorithm = { name: 'HMAC', hash: 'SHA-256' }
    const cryptoKey = crypto.subtle.importKey('raw', key, algorithm, false, ['sign'])
    return cryptoKey
      .then(k => crypto.subtle.sign('HMAC', k, data))
      .then(sig => {
        const expected = Array.from(new Uint8Array(sig))
          .map(b => b.toString(16).padStart(2, '0')).join('')
        return expected === signature
      })
  } catch {
    return false
  }
}

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabaseClient = createSupabaseClient(req)
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return errorResponse('Not authenticated', 401)

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return errorResponse('Missing payment verification parameters')
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''
    if (!razorpayKeySecret) return errorResponse('Payment gateway not configured', 500)

    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret,
    )

    if (!isValid) return errorResponse('Invalid payment signature', 400)

    const supabaseAdmin = createSupabaseAdmin()

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, course:courses(title)')
      .eq('order_id', razorpay_order_id)
      .single()

    if (!payment) return errorResponse('Payment record not found', 404)

    const now = new Date().toISOString()

    await supabaseAdmin.from('payments').update({
      razorpay_payment_id,
      status: 'paid',
      updated_at: now,
    }).eq('id', payment.id)

    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', payment.course_id)
      .maybeSingle()

    if (!existingEnrollment) {
      await supabaseAdmin.from('enrollments').insert({
        user_id: user.id,
        course_id: payment.course_id,
        enrolled_at: now,
      })
    }

    if (payment.coupon_id) {
      await supabaseAdmin.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    await supabaseAdmin.from('user_points').upsert({
      user_id: user.id,
      points: 20,
      last_updated: now,
    }, { onConflict: 'user_id' })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'enrollment_confirmed',
      message: `Payment Successful — You're enrolled in ${(payment.course as any)?.title || 'Course'}!`,
      payload: { course_id: payment.course_id, payment_id: payment.id },
    })

    return jsonResponse({ verified: true, course_id: payment.course_id })
  } catch (err) {
    console.error('verify payment error:', err)
    return errorResponse(err instanceof Error ? err.message : 'Verification failed', 500)
  }
})
