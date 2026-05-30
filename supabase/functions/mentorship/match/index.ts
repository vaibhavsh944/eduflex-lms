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

    const { data: menteeProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!menteeProfile) throw new Error('Profile not found')

    const { data: mentors } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .filter('mentorship_prefs->>opted_in', 'eq', 'true')
      .filter('mentorship_prefs->>role', 'in', '("mentor","both")')
      .limit(20)

    if (!mentors || mentors.length === 0) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const shuffled = [...mentors].sort(() => Math.random() - 0.5)
    const top3 = shuffled.slice(0, 3)

    const matches = []
    for (const mentor of top3) {
      const { data: pair } = await supabaseAdmin
        .from('mentorship_pairs')
        .insert({
          mentor_id: mentor.id,
          mentee_id: user.id,
          status: 'pending',
        })
        .select()
        .single()

      if (pair) {
        await supabaseAdmin.from('notifications').insert({
          user_id: mentor.id,
          type: 'mentorship_request',
          title: 'New mentorship request',
          body: `${menteeProfile.full_name} has requested you as a mentor.`,
          payload: { pair_id: pair.id },
        })
        matches.push({ ...pair, mentor })
      }
    }

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
