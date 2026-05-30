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

    const { course_id, action, rejection_reason } = await req.json()
    if (!course_id || !action) return errorResponse('course_id and action are required')
    if (!['approve', 'reject', 'force_publish', 'unpublish'].includes(action)) return errorResponse('Invalid action')

    const adminClient = createSupabaseAdmin()
    const { data: course } = await adminClient
      .from('courses')
      .select('id, title, instructor_id')
      .eq('id', course_id)
      .single()

    if (!course) return errorResponse('Course not found', 404)

    let newStatus: string
    const actionType: string = `course.${action}`

    switch (action) {
      case 'approve':
      case 'force_publish':
        newStatus = 'published'
        break
      case 'reject':
        newStatus = 'rejected'
        break
      case 'unpublish':
        newStatus = 'draft'
        break
      default:
        return errorResponse('Invalid action', 400)
    }

    const updateData: Record<string, unknown> = { status: newStatus }
    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason ?? 'No reason provided'
    }

    const { error: updateError } = await adminClient
      .from('courses')
      .update(updateData)
      .eq('id', course_id)

    if (updateError) return errorResponse(updateError.message, 500)

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: actionType,
      target_type: 'course',
      target_id: course_id,
      target_name: course.title ?? 'Unknown Course',
      details: rejection_reason ? { rejection_reason } : {},
    })

    if (course.instructor_id) {
      const actionLabel = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'force_publish' ? 'force published' : 'unpublished'
      await adminClient.from('notifications').insert({
        user_id: course.instructor_id,
        type: 'course_announcement',
        title: `Course ${actionLabel}`,
        body: `Your course "${course.title}" has been ${actionLabel} by an admin.${rejection_reason ? ` Reason: ${rejection_reason}` : ''}`,
        course_id,
        actor_id: user.id,
      })
    }

    return jsonResponse({ success: true, newStatus })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
