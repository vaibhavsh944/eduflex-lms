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

    const { session_id } = await req.json()
    if (!session_id) throw new Error('session_id required')

    const { data: session } = await supabaseAdmin
      .from('live_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (!session) throw new Error('Session not found')
    if (session.instructor_id !== user.id) throw new Error('Not authorized')

    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY') ?? ''
    const roomRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DAILY_API_KEY}` },
      body: JSON.stringify({
        name: `eduflow-${session_id}`,
        privacy: 'public',
        properties: { enable_recording: 'cloud', auto_join: true },
      }),
    })

    if (!roomRes.ok) throw new Error('Failed to create Daily.co room')

    const roomData = await roomRes.json()
    const dailyRoomUrl = roomData.url

    await supabaseAdmin
      .from('live_sessions')
      .update({ daily_room_url: dailyRoomUrl, started_at: new Date().toISOString() })
      .eq('id', session_id)

    return new Response(JSON.stringify({ daily_room_url: dailyRoomUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
