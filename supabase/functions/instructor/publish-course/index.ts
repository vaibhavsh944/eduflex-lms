import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errorResponse('Missing authorization header', 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401)

    const { course_id } = await req.json()
    if (!course_id) return errorResponse('course_id required')

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', course_id).single()
    if (!course || course.instructor_id !== user.id) return errorResponse('Course not found or access denied', 403)

    const { count: moduleCount } = await supabase
      .from('modules')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', course_id)

    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', course_id)
      .eq('status', 'published')

    if (!moduleCount || moduleCount === 0) return errorResponse('Course must have at least 1 module', 400)
    if (!lessonCount || lessonCount === 0) return errorResponse('Course must have at least 1 published lesson', 400)

    const { error } = await supabase
      .from('courses')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', course_id)

    if (error) return errorResponse(error.message, 500)

    return jsonResponse({ success: true })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
