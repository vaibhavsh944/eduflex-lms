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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { submission_id } = await req.json()
    if (!submission_id) return errorResponse('submission_id required', 400)

    const today = new Date().toISOString().split('T')[0]
    const { count } = await adminClient
      .from('essay_grades')
      .select('id', { count: 'exact', head: true })
      .eq('graded_by', user.id)
      .gte('graded_at', `${today}T00:00:00Z`)
      .lte('graded_at', `${today}T23:59:59Z`)

    if (count && count >= 50) return errorResponse('Daily AI grading limit reached (50/day)', 429)

    const { data: submission } = await adminClient
      .from('assignment_submissions')
      .select('*, assignment:assignments(title, description)')
      .eq('id', submission_id)
      .single()

    if (!submission) return errorResponse('Submission not found', 404)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return errorResponse('AI service not configured', 500)

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are an expert academic grader. Grade the following student submission against the provided rubric. Return ONLY valid JSON: { criteria: [{criterion_id, score, max_score, feedback}], overall_feedback, confidence }. Do not include any text outside the JSON object.',
        messages: [{
          role: 'user',
          content: JSON.stringify({
            assignment: (submission as any).assignment?.title,
            description: (submission as any).assignment?.description,
            submission: ((submission as any).content ?? '').substring(0, 4000),
          }),
        }],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('Anthropic API error:', errText)
      return errorResponse('AI grading failed', 500)
    }

    const aiData = await aiRes.json()
    let gradeResult: any
    try {
      const text = (aiData.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
      gradeResult = JSON.parse(text)
    } catch {
      return errorResponse('Failed to parse AI response', 500)
    }

    await adminClient.from('essay_grades').upsert({
      submission_id,
      graded_by: user.id,
      ai_score: gradeResult.criteria,
      ai_feedback: gradeResult.overall_feedback,
      ai_confidence: gradeResult.confidence,
    })

    return jsonResponse(gradeResult)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
