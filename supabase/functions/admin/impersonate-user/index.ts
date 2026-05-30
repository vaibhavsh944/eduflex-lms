import { createSupabaseAdmin, createSupabaseClient } from '../../_shared/supabase.ts'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createSupabaseClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') return errorResponse('Forbidden', 403)

    const { user_id } = await req.json()
    if (!user_id) return errorResponse('user_id is required')

    const adminClient = createSupabaseAdmin()
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .eq('id', user_id)
      .single()

    if (!targetProfile) return errorResponse('Target user not found', 404)

    const crypto = await import('https://deno.land/std@0.208.0/crypto/mod.ts')
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: sessionError } = await adminClient.from('impersonation_sessions').insert({
      admin_id: user.id,
      impersonated_user_id: user_id,
      token,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    })

    if (sessionError) return errorResponse(sessionError.message, 500)

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'user.impersonation_started',
      target_type: 'user',
      target_id: user_id,
      target_name: targetProfile.full_name,
    })

    return jsonResponse({ token, user_id, name: targetProfile.full_name })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
