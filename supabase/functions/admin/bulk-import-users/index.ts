import { createSupabaseAdmin, createSupabaseClient } from '../../_shared/supabase.ts'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'

interface ImportRow {
  name: string
  email: string
  role: string
  password?: string
}

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

    const { users: rawUsers } = await req.json()
    if (!Array.isArray(rawUsers) || rawUsers.length === 0) {
      return errorResponse('users array is required and must be non-empty')
    }

    const adminClient = createSupabaseAdmin()
    const results: { row: number; success: boolean; error?: string }[] = []
    const errors: string[] = []

    for (let i = 0; i < rawUsers.length; i++) {
      const row: ImportRow = rawUsers[i]
      try {
        if (!row.email || !row.name) {
          results.push({ row: i + 1, success: false, error: 'Missing name or email' })
          continue
        }
        if (!['student', 'instructor', 'admin'].includes(row.role)) {
          results.push({ row: i + 1, success: false, error: `Invalid role: ${row.role}` })
          continue
        }

        const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
          email: row.email,
          password: row.password ?? undefined,
          email_confirm: true,
          user_metadata: { full_name: row.name, role: row.role },
        })
        if (createError || !authData.user) {
          results.push({ row: i + 1, success: false, error: createError?.message ?? 'Failed to create user' })
          continue
        }

        results.push({ row: i + 1, success: true })
      } catch (e) {
        results.push({ row: i + 1, success: false, error: String(e) })
      }
    }

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'user.bulk_imported',
      target_type: 'user',
      details: { total: rawUsers.length, success: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results },
    })

    return jsonResponse({ results, success_count: results.filter(r => r.success).length, fail_count: results.filter(r => !r.success).length })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
