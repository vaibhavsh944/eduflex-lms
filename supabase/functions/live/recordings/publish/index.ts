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

    const { session_id, module_id, title } = await req.json()
    if (!session_id || !module_id || !title) throw new Error('session_id, module_id, and title required')

    const { data: session } = await supabaseAdmin
      .from('live_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (!session) throw new Error('Session not found')
    if (session.instructor_id !== user.id) throw new Error('Not authorized')

    if (!session.recording_url) throw new Error('No recording available for this session')

    const { data: maxOrder } = await supabaseAdmin
      .from('lessons')
      .select('order_index')
      .eq('module_id', module_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0

    const { data: newLesson, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        course_id: session.course_id,
        module_id,
        title,
        content_type: 'video',
        video_url: session.recording_url,
        order_index: nextOrder,
        status: 'published',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ lesson: newLesson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
