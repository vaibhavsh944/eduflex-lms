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

    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    if (!query) throw new Error('q query parameter required')

    const { count } = await supabaseAdmin
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null)

    if (!count || count < 50) {
      const { data: results } = await supabaseAdmin
        .from('lessons')
        .select('id, title, course_id, course:courses(name)')
        .ilike('title', `%${query}%`)
        .eq('status', 'published')
        .limit(10)

      return new Response(JSON.stringify({
        results: (results || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          course_name: (r.course as any)?.name ?? '',
          similarity: null,
        })),
        mode: 'keyword',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured')

    const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
    })

    if (!embedRes.ok) throw new Error('OpenAI embedding API error')

    const embedData = await embedRes.json()
    const embedding = embedData.data[0].embedding

    const { data: results } = await supabaseAdmin.rpc('search_lessons_semantic', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    })

    return new Response(JSON.stringify({
      results: (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        course_name: r.course_name,
        similarity: r.similarity,
      })),
      mode: 'semantic',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
