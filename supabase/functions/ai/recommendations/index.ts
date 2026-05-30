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
      .from('course_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cached) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      if (cached.generated_at >= oneHourAgo) {
        const courseIds = cached.course_ids as string[]
        const { data: courses } = await supabaseAdmin
          .from('courses')
          .select('*')
          .in('id', courseIds)

        return new Response(JSON.stringify({ recommendations: courses || [], cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { data: completedCourses } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, course:courses(title)')
      .eq('user_id', user.id)

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('goals, preferred_language')
      .eq('id', user.id)
      .single()

    const enrolledIds = (completedCourses || []).map((e: any) => e.course_id)
    const { data: availableCourses } = await supabaseAdmin
      .from('courses')
      .select('id, title, description, category')
      .eq('status', 'published')
      .not('id', 'in', `(${enrolledIds.join(',')})`)
      .limit(20)

    if (!availableCourses || availableCourses.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    if (!ANTHROPIC_API_KEY) {
      const shuffled = [...availableCourses].sort(() => Math.random() - 0.5)
      return new Response(JSON.stringify({ recommendations: shuffled.slice(0, 5) }), {
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
        system: 'You are a course recommendation engine. Return ONLY a JSON array of exactly 5 course IDs from the available_courses list, ordered by relevance. Return: ["id1","id2","id3","id4","id5"]. No other text.',
        messages: [{ role: 'user', content: JSON.stringify({
          completed: (completedCourses || []).map((e: any) => (e.course as any)?.title),
          goals: (profile as any)?.goals || '',
          available_courses: availableCourses,
        }) }],
      }),
    })

    if (!aiRes.ok) throw new Error('AI API error')

    const aiData = await aiRes.json()
    const courseIds: string[] = JSON.parse(aiData.content[0].text)

    const { data: recommended } = await supabaseAdmin
      .from('courses')
      .select('*')
      .in('id', courseIds.slice(0, 5))

    await supabaseAdmin.from('course_recommendations').upsert({
      user_id: user.id,
      course_ids: JSON.stringify(courseIds.slice(0, 5)),
      generated_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ recommendations: recommended || [], cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
