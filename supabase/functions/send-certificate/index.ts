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

    const { user_id, course_id, user_email } = await req.json()
    if (!user_id || !course_id) return errorResponse('user_id and course_id are required')

    const adminClient = createSupabaseAdmin()

    const { data: certData, error: certError } = await adminClient
      .from('certificates')
      .select('id, certificate_url, pdf_url, verification_code')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle()

    if (certError) return errorResponse(certError.message, 500)

    if (!certData) {
      const { data: newCert, error: insertError } = await adminClient
        .from('certificates')
        .insert({ user_id, course_id })
        .select('id')
        .single()

      if (insertError) return errorResponse(insertError.message, 500)

      await adminClient.from('certificate_queue').upsert({
        user_id,
        course_id,
        queued_at: new Date().toISOString(),
      }, { onConflict: 'user_id, course_id' })

      await adminClient.from('notifications').insert({
        user_id,
        type: 'certificate_issued',
        title: 'Compliance certificate request submitted',
        body: 'Your compliance certificate has been queued for generation.',
        action_url: `/certificates`,
      })

      await adminClient.from('audit_logs').insert({
        actor_id: user.id,
        actor_email: user.email,
        action_type: 'certificate.requested',
        target_type: 'certificate',
        target_id: newCert?.id,
        details: { user_id, course_id, compliance: true },
      })

      return jsonResponse({ success: true, message: 'Certificate queued for generation', certificate_id: newCert?.id })
    }

    await adminClient.from('notifications').insert({
      user_id,
      type: 'certificate_issued',
      title: 'Certificate available',
      body: 'Your compliance certificate is ready.',
      action_url: `/certificates`,
    })

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action_type: 'certificate.sent',
      target_type: 'certificate',
      target_id: certData.id,
      details: { user_id, course_id, compliance: true },
    })

    return jsonResponse({ success: true, certificate: certData })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
