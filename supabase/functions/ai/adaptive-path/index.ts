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

    const { data: cached } = await supabaseAdmin
      .from('adaptive_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cached) {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      if (cached.generated_at >= thirtyMinAgo) {
        const { data: lesson } = await supabaseAdmin
          .from('lessons')
          .select('title')
          .eq('id', cached.lesson_id)
          .single()

        const { data: course } = await supabaseAdmin
          .from('courses')
          .select('title')
          .eq('id', cached.course_id)
          .single()

        return new Response(JSON.stringify({
          ...cached,
          lesson_name: lesson?.title ?? '',
          course_name: course?.title ?? '',
          cached: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { data: lessonProgress } = await supabaseAdmin
      .from('lesson_progress')
      .select('lesson_id, completed, course_id')
      .eq('user_id', user.id)

    const { data: quizAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('quiz_id, score, passed')
      .eq('user_id', user.id)
      .eq('status', 'graded')
      .order('created_at', { ascending: false })

    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, course:courses(title)')
      .eq('user_id', user.id)

    const context = {
      courses: (enrollments || []).map((e: any) => ({
        course_id: e.course_id,
        name: (e.course as any)?.title ?? '',
        progress_pct: 0,
        quiz_scores: {},
      })),
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ lesson_id: null, reason: 'AI not configured', cached: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: 'You are an adaptive learning assistant. Given a student\'s progress and quiz scores, recommend ONE specific next action. Return JSON only: { lesson_id, course_id, reason }. Reason must be under 20 words.',
        messages: [{ role: 'user', content: JSON.stringify(context) }],
      }),
    })

    if (!aiRes.ok) throw new Error('AI API error')

    const aiData = await aiRes.json()
    const recommendation = JSON.parse(aiData.content[0].text)

    await supabaseAdmin.from('adaptive_recommendations').upsert({
      user_id: user.id,
      lesson_id: recommendation.lesson_id,
      course_id: recommendation.course_id,
      reason: recommendation.reason,
      generated_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ ...recommendation, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
