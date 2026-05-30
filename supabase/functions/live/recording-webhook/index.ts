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

    const payload = await req.json()
    const { room_name, recording_id, download_url } = payload

    if (!room_name || !recording_id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: sessions } = await supabaseAdmin
      .from('live_sessions')
      .select('*')
      .ilike('daily_room_url', `%${room_name}%`)

    if (!sessions || sessions.length === 0) throw new Error('No matching session found')

    const session = sessions[0]

    await supabaseAdmin
      .from('live_sessions')
      .update({ recording_url: download_url ?? `https://daily.co/recordings/${recording_id}` })
      .eq('id', session.id)

    await supabaseAdmin.from('notifications').insert({
      user_id: session.instructor_id,
      type: 'recording_ready',
      title: `Recording ready for ${session.name}`,
      body: `Your recording for "${session.name}" is now available.`,
      payload: { session_id: session.id, recording_url: download_url },
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
