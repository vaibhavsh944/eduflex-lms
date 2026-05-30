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

    const adminClient = createSupabaseAdmin()

    const { data: users } = await adminClient.from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })

    const { data: courses } = await adminClient.from('courses')
      .select('id, title, category, level, pricing_type, price, status, enrollment_count, rating, created_at')

    const { data: enrollments } = await adminClient.from('enrollments')
      .select('id, user_id, course_id, status, created_at')

    const csvEncode = (val: string | number | null | undefined) => {
      const s = String(val ?? '')
      return `"${s.replace(/"/g, '""')}"`
    }

    const usersCsv = ['name,email,role,status,created_at']
    users?.forEach((u: any) => usersCsv.push([u.full_name, u.email, u.role, u.is_active ? 'active' : 'inactive', u.created_at].map(csvEncode).join(',')))

    const coursesCsv = ['title,category,level,price,status,enrollments,rating,created_at']
    courses?.forEach((c: any) => coursesCsv.push([c.title, c.category, c.level, c.price, c.status, c.enrollment_count, c.rating, c.created_at].map(csvEncode).join(',')))

    const enrollmentsCsv = ['user_id,course_id,status,created_at']
    enrollments?.forEach((e: any) => enrollmentsCsv.push([e.user_id, e.course_id, e.status, e.created_at].map(csvEncode).join(',')))

    const zipContent = [
      { filename: 'users.csv', content: usersCsv.join('\n') },
      { filename: 'courses.csv', content: coursesCsv.join('\n') },
      { filename: 'enrollments.csv', content: enrollmentsCsv.join('\n') },
    ]

    return jsonResponse({ files: zipContent })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
