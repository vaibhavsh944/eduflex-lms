import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createSupabaseAdmin, createSupabaseClient } from "../../_shared/supabase.ts"
import { handleCors, jsonResponse, errorResponse } from "../../_shared/cors.ts"

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabaseClient = createSupabaseClient(req)
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return errorResponse('Not authenticated', 401)

    const { course_id, coupon_code } = await req.json()
    if (!course_id) return errorResponse('course_id is required')

    const supabaseAdmin = createSupabaseAdmin()

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('price, price_type, title')
      .eq('id', course_id)
      .single()

    if (!course) return errorResponse('Course not found', 404)
    if (course.price_type === 'free' || !course.price || course.price === 0) {
      return errorResponse('Course is free')
    }

    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .maybeSingle()

    if (existingEnrollment) return errorResponse('Already enrolled in this course')

    let finalPrice = course.price
    let appliedCouponId: string | null = null

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .single()

      if (!coupon) return errorResponse('Invalid coupon code')

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return errorResponse('Coupon usage limit reached')
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return errorResponse('Coupon has expired')
      }
      if (coupon.course_id && coupon.course_id !== course_id) {
        return errorResponse('Coupon not applicable for this course')
      }

      finalPrice = coupon.discount_type === 'percentage' || coupon.discount_type === 'percent'
        ? course.price * (1 - coupon.discount_value / 100)
        : Math.max(0, course.price - coupon.discount_value)

      appliedCouponId = coupon.id
    }

    const amountInPaise = Math.round(finalPrice * 100)
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''

    if (!razorpayKeyId || !razorpayKeySecret) {
      return errorResponse('Payment gateway not configured', 500)
    }

    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${course_id}_${user.id}_${Date.now()}`,
        notes: { course_id, user_id: user.id },
      }),
    })

    const order = await orderRes.json()
    if (!order.id) {
      console.error('Razorpay order creation failed:', JSON.stringify(order))
      return errorResponse('Failed to create payment order', 502)
    }

    await supabaseAdmin.from('payments').insert({
      user_id: user.id,
      course_id,
      amount: finalPrice,
      currency: 'INR',
      order_id: order.id,
      status: 'pending',
      coupon_id: appliedCouponId,
    })

    return jsonResponse({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    })
  } catch (err) {
    console.error('create-order error:', err)
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
