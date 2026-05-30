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

    const { coupon_code, course_id } = await req.json()
    if (!coupon_code) return errorResponse('coupon_code is required')

    const supabaseAdmin = createSupabaseAdmin()

    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .single()

    if (!coupon) {
      return jsonResponse({ valid: false, message: 'Invalid coupon code' })
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return jsonResponse({ valid: false, message: 'Coupon usage limit reached' })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return jsonResponse({ valid: false, message: 'Coupon has expired' })
    }

    if (course_id && coupon.course_id && coupon.course_id !== course_id) {
      return jsonResponse({ valid: false, message: 'Coupon not applicable for this course' })
    }

    return jsonResponse({
      valid: true,
      discount: { type: coupon.discount_type, value: coupon.discount_value },
      message: 'Coupon applied successfully',
    })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Validation failed', 500)
  }
})
