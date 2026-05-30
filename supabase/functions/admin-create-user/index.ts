import { createSupabaseAdmin, createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'

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

    const { email, password, full_name, role } = await req.json()
    if (!email || !full_name) return errorResponse('email and full_name are required')
    const userRole = role || 'student'
    if (!['student', 'instructor', 'admin'].includes(userRole)) return errorResponse('Invalid role')

    const adminClient = createSupabaseAdmin()

    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: password ?? undefined,
      email_confirm: true,
      user_metadata: { full_name, role: userRole },
    })
    if (createError || !authData?.user) return errorResponse(createError?.message ?? 'Failed to create user', 500)

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'user.admin_created',
      target_type: 'user',
      target_id: authData.user.id,
      target_name: full_name,
      details: { role: userRole, email },
    })

    return jsonResponse({ user_id: authData.user.id, email, full_name, role: userRole })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
