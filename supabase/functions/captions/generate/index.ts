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
    if (!lesson_id) throw new Error('lesson_id required')

    const { data: lesson } = await supabaseAdmin
      .from('lessons')
      .select('id, video_url')
      .eq('id', lesson_id)
      .single()

    if (!lesson) throw new Error('Lesson not found')
    if (!lesson.video_url) throw new Error('No video URL found for this lesson')

    const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY') ?? ''
    if (!ASSEMBLYAI_API_KEY) throw new Error('AssemblyAI API key not configured')

    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ASSEMBLYAI_API_KEY,
      },
      body: JSON.stringify({
        audio_url: lesson.video_url,
        language_detection: true,
        format_text: true,
      }),
    })

    if (!transcriptRes.ok) throw new Error('AssemblyAI API error')

    const transcriptData = await transcriptRes.json()

    await supabaseAdmin.from('caption_jobs').insert({
      lesson_id,
      assemblyai_id: transcriptData.id,
      status: 'processing',
    })

    return new Response(JSON.stringify({
      transcript_id: transcriptData.id,
      status: 'processing',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
