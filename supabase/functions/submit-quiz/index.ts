import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { attempt_id, answers, auto_submitted } = await req.json()
    if (!attempt_id || !answers) return errorResponse('attempt_id and answers required', 400)

    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*, quizzes!inner(id, lesson_id, course_id, show_answers_after, passing_threshold)')
      .eq('id', attempt_id)
      .single()
    if (attemptErr || !attempt) return errorResponse('Attempt not found', 404)
    if (attempt.status !== 'in_progress') return errorResponse('Attempt already graded', 400)

    let questions: any[] = []
    if (attempt.question_order && Array.isArray(attempt.question_order) && attempt.question_order.length > 0) {
      const { data: qs } = await supabaseAdmin
        .from('question_bank')
        .select('*')
        .in('id', attempt.question_order)
      questions = qs || []
      questions.sort((a, b) => attempt.question_order.indexOf(a.id) - attempt.question_order.indexOf(b.id))
    } else {
      const { data: qs } = await supabaseAdmin
        .from('quiz_questions')
        .select('*, quiz_options(*)')
        .eq('lesson_id', attempt.lesson_id)
        .order('order_index')
      questions = qs || []
    }

    let earnedPoints = 0
    let totalPoints = 0
    const gradeResults: Record<string, any> = {}

    for (const q of questions) {
      totalPoints += q.points || 1
      const studentAns = answers[q.id]
      let isCorrect = false
      let correctAnswer: any = null

      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const options = q.options || q.quiz_options
        if (options && Array.isArray(options)) {
          const correctOpt = options.find((o: any) => o.is_correct === true)
          correctAnswer = correctOpt?.id || correctOpt?.option_text
          isCorrect = studentAns === correctAnswer
        }
      } else if (q.question_type === 'short_answer') {
        const keywords = q.correct_answer?.keywords || []
        if (keywords.length > 0) {
          isCorrect = keywords.some((k: string) =>
            studentAns?.toLowerCase().includes(k.toLowerCase())
          )
        } else {
          isCorrect = studentAns?.toLowerCase().trim() === (q.correct_answer?.text || '').toLowerCase().trim()
        }
        correctAnswer = q.correct_answer?.text || null
      } else if (q.question_type === 'fill_blank') {
        const blanks = q.correct_answer?.blanks || []
        const studentBlanks = typeof studentAns === 'object' ? studentAns : {}
        isCorrect = blanks.every((blank: any, idx: number) =>
          (blank.accepted || []).some((a: string) =>
            (studentBlanks[idx] || '').toLowerCase().trim() === a.toLowerCase().trim()
          )
        )
        correctAnswer = q.correct_answer
      } else if (q.question_type === 'drag_match') {
        const correctPairs = q.correct_answer?.pairs || []
        const studentPairs = typeof studentAns === 'object' ? studentAns : {}
        isCorrect = correctPairs.every((pair: any) =>
          studentPairs[pair.item] === pair.match
        )
        correctAnswer = q.correct_answer
      }

      if (isCorrect) earnedPoints += q.points || 1

      gradeResults[q.id] = {
        correct: isCorrect,
        correct_answer: correctAnswer,
        explanation: q.explanation
      }
    }

    let scorePct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const rawScore = scorePct

    const penaltyPct = attempt.grace_penalty_pct || 0
    if (penaltyPct > 0) {
      scorePct = scorePct * (1 - penaltyPct / 100)
    }

    const passingThreshold = attempt.quizzes?.passing_threshold ?? 70
    const passed = scorePct >= passingThreshold

    const updateData: Record<string, unknown> = {
      answers,
      score: Math.round(scorePct * 100) / 100,
      max_score: totalPoints,
      passed,
      status: 'graded',
      submitted_at: new Date().toISOString(),
    }
    if (auto_submitted) updateData.auto_submitted = true

    const { error: updateErr } = await supabaseAdmin
      .from('quiz_attempts')
      .update(updateData)
      .eq('id', attempt_id)

    if (updateErr) {
      console.error('Failed to update attempt:', updateErr)
      return errorResponse('Failed to save grading results', 500)
    }

    if (passed) {
      const { error: upsertErr } = await supabaseAdmin
        .from('lesson_progress')
        .upsert({
          user_id: attempt.user_id,
          lesson_id: attempt.lesson_id,
          course_id: attempt.course_id,
          completed: true,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' })

      if (upsertErr) {
        console.error('Failed to upsert lesson progress:', upsertErr)
      }
    }

    return jsonResponse({
      score: Math.round(scorePct * 100) / 100,
      raw_score: Math.round(rawScore * 100) / 100,
      max_score: totalPoints,
      passed,
      grace_penalty_applied: penaltyPct > 0,
      grace_penalty_pct: penaltyPct,
      results: gradeResults,
      auto_submitted: !!auto_submitted
    })

  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
