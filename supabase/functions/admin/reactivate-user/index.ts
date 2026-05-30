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
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', user_id)

    if (updateError) return errorResponse(updateError.message, 500)

    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single()

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'user.reactivated',
      target_type: 'user',
      target_id: user_id,
      target_name: targetProfile?.full_name ?? 'Unknown',
    })

    return jsonResponse({ success: true })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
