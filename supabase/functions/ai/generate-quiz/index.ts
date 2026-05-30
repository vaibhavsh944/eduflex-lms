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

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'instructor') return errorResponse('Only instructors can generate quizzes', 403)

    const { lesson_id, num_questions = 5, difficulty = 'mixed', question_types = ['mcq', 'true_false', 'short_answer'] } = await req.json()
    if (!lesson_id) return errorResponse('lesson_id required')

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('feature', 'quiz_gen')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    if (count && count >= 5) return errorResponse('Daily quiz generation limit reached (5/day)', 429)

    const { data: lesson } = await supabase.from('lessons').select('title, content').eq('id', lesson_id).single()
    if (!lesson) return errorResponse('Lesson not found', 404)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return errorResponse('AI service not configured', 500)

    const prompt = `You are an expert educator and assessment designer.

Based on the following lesson content, generate exactly ${num_questions} quiz questions.

Requirements:
- Difficulty: ${difficulty}
- Question types to include: ${question_types.join(', ')}
- Each question must test understanding of the lesson content, not just recall
- Distribute question types as evenly as possible
- For MCQ questions: provide exactly 4 options with exactly 1 correct answer
- For True/False: provide a clear statement
- For Short Answer: provide a model answer for instructor reference

Return ONLY valid JSON, no markdown, no preamble:
{
  "questions": [
    {
      "type": "mcq" | "true_false" | "short_answer",
      "body": "Question text",
      "points": 1,
      "explanation": "Why this is the correct answer",
      "options": [
        { "text": "Option text", "is_correct": false },
        { "text": "Option text", "is_correct": true }
      ],
      "correct_answer": true,
      "sample_answer": "Model answer text"
    }
  ]
}

Lesson content:
${(lesson.content ?? '').substring(0, 5000)}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return errorResponse('Quiz generation failed', 500)
    }

    const result = await response.json()
    let text = result.content?.[0]?.text ?? ''
    text = text.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      const retryResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: 'Your previous response was not valid JSON. Return only valid JSON:\n' + prompt }],
        }),
      })
      const retryResult = await retryResp.json()
      const retryText = (retryResult.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
      try {
        parsed = JSON.parse(retryText)
      } catch {
        return errorResponse('Quiz generation failed after retry', 500)
      }
    }

    await adminClient.from('ai_usage').insert({
      user_id: user.id,
      feature: 'quiz_gen',
      metadata: { lesson_id, num_questions, difficulty },
    })

    return jsonResponse(parsed)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
