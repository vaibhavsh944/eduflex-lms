import { createSupabaseAdmin, createSupabaseClient } from '../../_shared/supabase.ts'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createSupabaseClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { announcement_id } = await req.json()
    if (!announcement_id) return errorResponse('announcement_id is required')

    const adminClient = createSupabaseAdmin()

    const { data: announcement, error: fetchError } = await adminClient
      .from('announcements')
      .select('*')
      .eq('id', announcement_id)
      .single()
    if (fetchError || !announcement) return errorResponse('Announcement not found', 404)

    let recipients: string[] = []
    if (announcement.target_type === 'all') {
      const { data } = await adminClient
        .from('profiles')
        .select('id')
        .eq('status', 'active')
        .in('role', ['student', 'instructor'])
      recipients = data?.map((r) => r.id) ?? []
    } else if (announcement.target_type === 'role') {
      const { data } = await adminClient
        .from('profiles')
        .select('id')
        .eq('status', 'active')
        .eq('role', announcement.target_role)
      recipients = data?.map((r) => r.id) ?? []
    } else if (announcement.target_type === 'course') {
      const { data } = await adminClient
        .from('enrollments')
        .select('user_id')
        .eq('course_id', announcement.target_course_id)
      recipients = data?.map((r) => r.user_id) ?? []
    }

    if (recipients.length > 0) {
      const bodyText = announcement.body?.substring(0, 200) ?? ''
      const notifications = recipients.map((uid: string) => ({
        user_id: uid,
        type: 'course_announcement',
        message: bodyText,
        title: announcement.title,
        body: bodyText,
        course_id: announcement.target_course_id,
        actor_id: user.id,
      }))
      await adminClient.from('notifications').insert(notifications)
    }

    await adminClient.from('announcements').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    }).eq('id', announcement_id)

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'announcement.sent',
      target_type: 'announcement',
      target_id: announcement_id,
      target_name: announcement.title,
      details: { recipient_count: recipients.length, target_type: announcement.target_type },
    })

    return jsonResponse({ success: true, recipient_count: recipients.length })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
