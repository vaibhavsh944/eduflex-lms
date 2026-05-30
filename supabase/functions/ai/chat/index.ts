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
    if (!user.email) return errorResponse('Invalid user', 400)

    const { messages, lesson_id, course_id } = await req.json()
    if (!messages || !lesson_id || !course_id) return errorResponse('messages, lesson_id, course_id required')

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    if (count && count >= 20) {
      return new Response(JSON.stringify({ error: 'Daily AI limit reached. Resets at midnight UTC.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const [lessonRes, courseRes] = await Promise.all([
      supabase.from('lessons').select('title, content, transcript').eq('id', lesson_id).single(),
      supabase.from('courses').select('title, description').eq('id', course_id).single(),
    ])

    const lesson = lessonRes.data
    const course = courseRes.data

    const systemPrompt = `You are an AI Tutor for the EduFlow learning platform, embedded in the lesson "${lesson?.title ?? 'Unknown'}" from the course "${course?.title ?? 'Unknown'}".

Your role:
- Answer questions about the lesson content clearly and helpfully
- Use the lesson content provided as your primary source
- If a question is unrelated to the lesson or course, gently redirect
- Never make up information not supported by the lesson content
- Keep responses concise unless the student asks for more detail
- Use markdown formatting for code, lists, and emphasis

Lesson content:
${(lesson?.content ?? '(No content)').substring(0, 4000)}
${lesson?.transcript ? `\n\nVideo transcript excerpt:\n${lesson.transcript.substring(0, 2000)}` : ''}`

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return errorResponse('AI service not configured', 500)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return errorResponse('AI service error', 500)
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const reader = response.body?.getReader()
    if (!reader) return errorResponse('Stream error', 500)

    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    let fullResponse = ''

    ;(async () => {
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6))
                if (json.type === 'content_block_delta' && json.delta?.text) {
                  fullResponse += json.delta.text
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: json.delta.text } })}\n\n`))
                }
              } catch { /* skip parse errors */ }
            }
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        console.error('Stream error:', err)
      } finally {
        await writer.close()
      }

      try {
        await adminClient.from('ai_usage').insert({ user_id: user.id, feature: 'tutor_chat', metadata: { lesson_id, course_id } })

        const { data: existing } = await adminClient.from('ai_conversations').select('id, messages').eq('user_id', user.id).eq('lesson_id', lesson_id).maybeSingle()
        if (existing) {
          await adminClient.from('ai_conversations').update({
            messages: [...(existing.messages as any[] ?? []), ...messages, { role: 'assistant', content: fullResponse, created_at: new Date().toISOString() }],
            updated_at: new Date().toISOString(),
          }).eq('id', existing.id)
        } else {
          await adminClient.from('ai_conversations').insert({
            user_id: user.id,
            course_id,
            lesson_id,
            messages: [...messages, { role: 'assistant', content: fullResponse, created_at: new Date().toISOString() }],
          })
        }
      } catch (err) {
        console.error('Failed to persist conversation:', err)
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
