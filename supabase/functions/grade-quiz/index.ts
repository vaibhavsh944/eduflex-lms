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

    // Admin client needed to read correct answers bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { attempt_id, answers } = await req.json()

    // 1. Fetch Attempt
    const { data: attempt, error: attemptErr } = await supabaseClient
      .from('quiz_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single()

    if (attemptErr || !attempt) throw new Error('Attempt not found')
    if (attempt.status !== 'in_progress') throw new Error('Attempt already graded')

    // 2. Fetch Questions + Options
    const { data: questions } = await supabaseAdmin
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('lesson_id', attempt.lesson_id)

    let earnedPoints = 0
    let totalPoints = 0
    const gradeResults: Record<string, any> = {}

    for (const q of questions) {
      totalPoints += q.points
      const studentAnsId = answers[q.id]
      const correctOpt = q.quiz_options.find((o: any) => o.is_correct)

      const isCorrect = studentAnsId === correctOpt?.id

      if (isCorrect) earnedPoints += q.points

      gradeResults[q.id] = {
        correct: isCorrect,
        correct_option_id: correctOpt?.id,
        explanation: q.explanation
      }
    }

    const scorePct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = scorePct >= 70

    // 3. Update Attempt (bypassing user RLS which prevents UPDATE)
    await supabaseAdmin
      .from('quiz_attempts')
      .update({
        answers,
        score: scorePct,
        max_score: totalPoints,
        passed,
        status: 'graded',
        submitted_at: new Date().toISOString()
      })
      .eq('id', attempt_id)

    // 4. Upsert progress if passed
    if (passed) {
      await supabaseAdmin
        .from('lesson_progress')
        .upsert({
          user_id: attempt.user_id,
          lesson_id: attempt.lesson_id,
          course_id: attempt.course_id,
          completed: true,
          completed_at: new Date().toISOString()
        })
    }

    // 5. Award points based on score
    if (passed) {
      let points = 25 // base pass points
      if (scorePct >= 100) points = 75
      else if (scorePct >= 90) points = 50

      await supabaseAdmin.from('user_points_log').insert({
        user_id: attempt.user_id,
        points,
        reason: 'quiz_passed',
        reference_type: 'quiz',
        reference_id: attempt.lesson_id,
      })

      // Check for badges
      await supabaseAdmin.functions.invoke('gamification/check-badges', {
        body: { user_id: attempt.user_id, context: { type: 'quiz_pass', value: scorePct } },
      }).catch(() => {})
    }

    return new Response(JSON.stringify({ score: scorePct, passed, results: gradeResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
