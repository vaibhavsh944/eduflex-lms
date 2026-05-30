import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errorResponse('Missing authorization header', 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401)

    const { lesson_id } = await req.json()
    if (!lesson_id) return errorResponse('lesson_id required')

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    if (count && count >= 20) return errorResponse('Daily AI limit reached. Resets at midnight UTC.', 429)

    const { data: lesson } = await supabase.from('lessons').select('title, content, transcript, updated_at').eq('id', lesson_id).single()
    if (!lesson) return errorResponse('Lesson not found', 404)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: cached } = await adminClient.from('lesson_summaries').select('*').eq('lesson_id', lesson_id).maybeSingle()
    if (cached) {
      const lessonUpdated = new Date(lesson.updated_at ?? 0).getTime()
      const summaryGenerated = new Date(cached.generated_at ?? 0).getTime()
      if (summaryGenerated >= lessonUpdated) {
        return jsonResponse({ summary: cached.summary, cached: true })
      }
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return errorResponse('AI service not configured', 500)

    const content = ((lesson.content ?? '') + '\n' + (lesson.transcript ?? '')).substring(0, 6000)

    const prompt = `You are an educational content expert. Summarize the following lesson for a student who wants to review key points.

Structure your response EXACTLY as follows (use these exact headers):

Key Takeaways:
• [3-5 bullet points of the most important facts or skills]

Main Concepts:
• [Concept name]: [one-sentence explanation]
(Repeat for 3-5 concepts)

What to Remember:
[1-2 sentences capturing the single most important takeaway]

Keep the entire summary under 300 words. Be clear and direct.

Lesson title: ${lesson.title}
Lesson content:
${content}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return errorResponse('Summarization failed', 500)
    }

    const result = await response.json()
    const summary = result.content?.[0]?.text ?? ''

    await adminClient.from('lesson_summaries').upsert({
      lesson_id,
      summary,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'lesson_id' })

    await adminClient.from('ai_usage').insert({
      user_id: user.id,
      feature: 'summarizer',
      metadata: { lesson_id },
    })

    return jsonResponse({ summary, cached: false })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
