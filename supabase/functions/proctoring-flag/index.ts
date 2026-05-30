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

    const { attempt_id, event_type } = await req.json()
    if (!attempt_id || !event_type) throw new Error('attempt_id and event_type required')
    if (!['tab_switch', 'focus_lost'].includes(event_type)) throw new Error('Invalid event_type')

    // Verify attempt belongs to user
    const { data: attempt } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id, user_id, proctoring_warning_count')
      .eq('id', attempt_id)
      .single()
    if (!attempt) throw new Error('Attempt not found')
    if (attempt.user_id !== user.id) throw new Error('Not your attempt')

    // Insert flag
    const { error: flagErr } = await supabaseAdmin
      .from('proctoring_flags')
      .insert({
        attempt_id,
        event_type
      })
    if (flagErr) throw new Error('Failed to log flag')

    // Increment warning count
    const newCount = (attempt.proctoring_warning_count || 0) + 1
    const { error: updateErr } = await supabaseAdmin
      .from('quiz_attempts')
      .update({ proctoring_warning_count: newCount })
      .eq('id', attempt_id)
    if (updateErr) throw new Error('Failed to update warning count')

    const shouldAutoSubmit = newCount >= 3

    return new Response(JSON.stringify({
      warning_count: newCount,
      should_auto_submit: shouldAutoSubmit
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
