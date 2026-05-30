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

    const { lessons } = await req.json()
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return errorResponse('lessons array required')
    }

    const courseId = lessons[0].course_id
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (!course || course.instructor_id !== user.id) return errorResponse('Course not found or access denied', 403)

    const updates = lessons.map((l: { id: string; position: number; module_id: string }, i: number) => ({
      id: l.id,
      position: i,
      module_id: l.module_id,
    }))

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const update of updates) {
      const { error } = await adminClient
        .from('lessons')
        .update({ position: update.position, module_id: update.module_id })
        .eq('id', update.id)

      if (error) return errorResponse(error.message, 500)
    }

    return jsonResponse({ success: true })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
