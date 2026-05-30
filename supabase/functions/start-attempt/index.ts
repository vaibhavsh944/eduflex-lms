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

    const { quiz_id } = await req.json()
    if (!quiz_id) return errorResponse('quiz_id required', 400)

    const { data: quiz, error: quizErr } = await supabaseAdmin
      .from('quizzes')
      .select('*, lessons!inner(id, course_id)')
      .eq('id', quiz_id)
      .single()
    if (quizErr || !quiz) return errorResponse('Quiz not found', 404)

    const { count: attemptCount } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .eq('quiz_id', quiz_id)

    if (quiz.max_attempts != null && attemptCount! >= quiz.max_attempts) {
      return jsonResponse({ error: 'ATTEMPTS_EXHAUSTED', attempts_used: attemptCount, max_attempts: quiz.max_attempts }, 403)
    }

    const now = new Date().toISOString()
    let gracePenaltyPct = 0
    let inGracePeriod = false

    const { data: lesson } = await supabaseAdmin
      .from('lessons')
      .select('due_at')
      .eq('id', quiz.lesson_id)
      .single()

    if (lesson?.due_at) {
      const dueDate = new Date(lesson.due_at)
      const nowDate = new Date()
      if (nowDate > dueDate) {
        const diffHours = (nowDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
        if (quiz.grace_period_hours > 0 && diffHours <= quiz.grace_period_hours) {
          gracePenaltyPct = quiz.grace_penalty_pct
          inGracePeriod = true
        } else if (diffHours > quiz.grace_period_hours) {
          return jsonResponse({ error: 'DEADLINE_PASSED' }, 403)
        }
      }
    }

    let questionOrder: string[] = []
    const optionOrders: Record<string, number[]> = {}

    if (quiz.randomise_questions || quiz.randomise_options || quiz.pick_random_count) {
      let pool: any[] = []
      if (quiz.pick_random_count) {
        const { data: bankQuestions } = await supabaseAdmin
          .from('question_bank')
          .select('id, question_type, options')
          .eq('course_id', quiz.lesson?.course_id)
          .order('id')
        pool = bankQuestions || []
      } else {
        const { data: qq } = await supabaseAdmin
          .from('quiz_questions')
          .select('id, type')
          .eq('lesson_id', quiz.lesson_id)
          .order('order_index')
        pool = qq || []
      }

      const arr = [...pool]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }

      const sliced = quiz.pick_random_count ? arr.slice(0, quiz.pick_random_count) : arr
      questionOrder = sliced.map((q: any) => q.id)

      if (quiz.randomise_options) {
        for (const q of sliced) {
          if (q.options && Array.isArray(q.options)) {
            const indices = q.options.map((_: any, i: number) => i)
            for (let i = indices.length - 1; i > 0; i--) {
              const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (i + 1));
              [indices[i], indices[j]] = [indices[j], indices[i]]
            }
            optionOrders[q.id] = indices
          }
        }
      }
    }

    const { data: attempt, error: insertErr } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_id: quiz.lesson_id,
        course_id: quiz.lesson.course_id,
        quiz_id: quiz_id,
        status: 'in_progress',
        started_at: now,
        question_order: questionOrder.length > 0 ? questionOrder : null,
        option_orders: Object.keys(optionOrders).length > 0 ? optionOrders : null,
        grace_penalty_pct: gracePenaltyPct,
        max_attempts: quiz.max_attempts,
      })
      .select('id, started_at')
      .single()
    if (insertErr) return errorResponse('Failed to create attempt', 500)

    return jsonResponse({
      id: attempt.id,
      started_at: attempt.started_at,
      in_grace_period: inGracePeriod,
      grace_penalty_pct: gracePenaltyPct,
      question_order: questionOrder,
    })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
