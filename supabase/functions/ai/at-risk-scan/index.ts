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

    const { data: lowProgress } = await supabaseAdmin.rpc('get_at_risk_low_progress')
    const { data: inactive } = await supabaseAdmin.rpc('get_at_risk_inactive')
    const { data: declining } = await supabaseAdmin.rpc('get_at_risk_declining_scores')

    let flagsInserted = 0

    const insertFlags = async (users: any[], reason: string) => {
      for (const u of users || []) {
        const { error } = await supabaseAdmin
          .from('at_risk_flags')
          .insert({
            user_id: u.user_id,
            course_id: u.course_id,
            reason,
          })
          .onConflict('user_id, course_id, reason, resolved')
          .ignore()
        if (!error) flagsInserted++
      }
    }

    await insertFlags(lowProgress || [], 'low_progress')
    await insertFlags(inactive || [], 'inactive')
    await insertFlags(declining || [], 'declining_scores')

    return new Response(JSON.stringify({ flags_inserted: flagsInserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
