import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { lesson_id } = await req.json()
    if (!lesson_id) {
      const { data: pending } = await supabaseAdmin
        .from('lessons')
        .select('id, title')
        .eq('status', 'published')
        .is('embedding', null)
        .limit(1)

      if (!pending || pending.length === 0) {
        return new Response(JSON.stringify({ processed: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const processed = []
      for (const lesson of pending.slice(0, 5)) {
        await processLesson(supabaseAdmin, lesson.id)
        processed.push(lesson.id)
      }

      return new Response(JSON.stringify({ processed: processed.length, lesson_ids: processed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await processLesson(supabaseAdmin, lesson_id)

    return new Response(JSON.stringify({ success: true, lesson_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function processLesson(supabaseAdmin: any, lessonId: string) {
  const { data: lesson } = await supabaseAdmin
    .from('lessons')
    .select('id, title, content')
    .eq('id', lessonId)
    .single()

  if (!lesson) throw new Error('Lesson not found')

  let plainText = lesson.title || ''
  if (lesson.content) {
    if (typeof lesson.content === 'string') {
      try {
        const parsed = JSON.parse(lesson.content)
        plainText += ' ' + extractTextFromTipTap(parsed)
      } catch {
        plainText += ' ' + lesson.content.replace(/<[^>]*>/g, ' ').substring(0, 8000)
      }
    } else if (typeof lesson.content === 'object') {
      plainText += ' ' + extractTextFromTipTap(lesson.content)
    }
  }

  const text = plainText.substring(0, 8000)

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured')

  const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })

  if (!embedRes.ok) throw new Error('OpenAI embedding API error')

  const embedData = await embedRes.json()
  const embedding = embedData.data[0].embedding

  const { error } = await supabaseAdmin
    .from('lessons')
    .update({ embedding: JSON.stringify(embedding) })
    .eq('id', lessonId)

  if (error) throw error
}

function extractTextFromTipTap(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.text) return node.text + ' '
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromTipTap).join(' ')
  }
  return ''
}
