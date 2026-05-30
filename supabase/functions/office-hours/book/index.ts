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

    const { slot_id } = await req.json()
    if (!slot_id) throw new Error('slot_id required')

    const { data: slot, error: selectError } = await supabaseAdmin
      .from('office_hour_slots')
      .select('*')
      .eq('id', slot_id)
      .single()

    if (selectError || !slot) throw new Error('Slot not found')
    if (slot.is_booked) throw new Error('Slot already booked')

    const { error: updateError } = await supabaseAdmin
      .from('office_hour_slots')
      .update({ is_booked: true, student_id: user.id })
      .eq('id', slot_id)
      .eq('is_booked', false)

    if (updateError) throw new Error('Slot was just booked by someone else')

    return new Response(JSON.stringify({ success: true, slot_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
