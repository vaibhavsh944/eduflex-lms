import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Collect all user data into a JSON archive
    const [
      { data: profile },
      { data: enrollments },
      { data: certificates },
      { data: payments },
      { data: invoices },
      { data: quizAttempts },
      { data: forumThreads },
      { data: forumReplies },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('enrollments').select('*, course:courses(title)').eq('user_id', user.id),
      supabaseAdmin.from('certificates').select('*').eq('user_id', user.id),
      supabaseAdmin.from('payments').select('*').eq('user_id', user.id),
      supabaseAdmin.from('invoices').select('*').eq('user_id', user.id),
      supabaseAdmin.from('quiz_attempts').select('*').eq('user_id', user.id),
      supabaseAdmin.from('forum_threads').select('*').eq('user_id', user.id),
      supabaseAdmin.from('forum_replies').select('*').eq('user_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      enrollments,
      certificates,
      payments,
      invoices,
      quiz_attempts: quizAttempts,
      forum_threads: forumThreads,
      forum_replies: forumReplies,
    }

    const fileName = `data-exports/${user.id}/export-${Date.now()}.json`
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('course-files')
      .upload(fileName, JSON.stringify(exportData, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('course-files')
      .getPublicUrl(fileName)

    // Log to GDPR retention log
    await supabaseAdmin.from('data_retention_logs').insert({
      user_id: user.id,
      action: 'data_exported',
      details: { file_url: publicUrl, exported_at: new Date().toISOString() }
    })

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
