import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { session_id } = await req.json()
    if (!session_id) throw new Error('session_id required')

    const { data: session } = await supabaseAdmin
      .from('live_sessions')
      .select('*, course:courses(title)')
      .eq('id', session_id)
      .single()

    if (!session) throw new Error('Session not found')

    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('user_id, profile:user_id(email, full_name)')
      .eq('course_id', session.course_id)

    if (!enrollments) return new Response(JSON.stringify({ notified: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    for (const enrollment of enrollments) {
      await supabaseAdmin.from('notifications').insert({
        user_id: enrollment.user_id,
        type: 'live_session',
        title: `New live session: ${session.name}`,
        body: `A new live session "${session.name}" has been scheduled for ${session.course?.title ?? 'your course'}.`,
        payload: { session_id: session.id, course_id: session.course_id },
      })
    }

    return new Response(JSON.stringify({ notified: enrollments.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
