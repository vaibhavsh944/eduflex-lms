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

    const { lesson_id } = await req.json()
    if (!lesson_id) throw new Error('lesson_id required')

    // Fetch competency requirements for this lesson
    const { data: requirements } = await supabaseAdmin
      .from('competency_requirements')
      .select('*, required_quiz:required_quiz_id(id, title)')
      .eq('lesson_id', lesson_id)
      .maybeSingle()

    if (!requirements) {
      // No gate — always unlocked
      return new Response(JSON.stringify({ locked: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch the student's best attempt on the required quiz
    const { data: bestAttempt } = await supabaseAdmin
      .from('quiz_attempts')
      .select('score, passed')
      .eq('user_id', user.id)
      .eq('quiz_id', requirements.required_quiz_id)
      .eq('status', 'graded')
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle()

    const bestScore = bestAttempt?.score ?? null
    const locked = bestScore === null || bestScore < requirements.min_score

    return new Response(JSON.stringify({
      locked,
      required_quiz_id: requirements.required_quiz_id,
      required_quiz_title: (requirements.required_quiz as any)?.title || null,
      min_score: requirements.min_score,
      current_best_score: bestScore
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
