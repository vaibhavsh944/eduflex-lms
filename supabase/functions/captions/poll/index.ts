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

    const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY') ?? ''

    const { data: jobs } = await supabaseAdmin
      .from('caption_jobs')
      .select('*')
      .eq('status', 'processing')

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ polled: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let completed = 0
    for (const job of jobs) {
      try {
        const res = await fetch(`https://api.assemblyai.com/v2/transcript/${job.assemblyai_id}`, {
          headers: { 'Authorization': ASSEMBLYAI_API_KEY },
        })

        if (!res.ok) {
          await supabaseAdmin.from('caption_jobs').update({ status: 'error', error_message: 'API error' }).eq('id', job.id)
          continue
        }

        const data = await res.json()

        if (data.status === 'completed') {
          const vttRes = await fetch(`https://api.assemblyai.com/v2/transcript/${job.assemblyai_id}/vtt`, {
            headers: { 'Authorization': ASSEMBLYAI_API_KEY },
          })

          if (vttRes.ok) {
            const vttContent = await vttRes.text()
            const fileName = `captions/${job.lesson_id}/captions.vtt`

            const { error: uploadError } = await supabaseAdmin.storage
              .from('lesson-content')
              .upload(fileName, vttContent, { contentType: 'text/vtt', upsert: true })

            if (!uploadError) {
              const { data: publicUrl } = supabaseAdmin.storage
                .from('lesson-content')
                .getPublicUrl(fileName)

              await supabaseAdmin.from('lessons').update({ captions_url: publicUrl?.publicUrl || fileName }).eq('id', job.lesson_id)
              await supabaseAdmin.from('caption_jobs').update({ status: 'completed' }).eq('id', job.id)
              completed++
            }
          }
        } else if (data.status === 'error') {
          await supabaseAdmin.from('caption_jobs').update({
            status: 'error',
            error_message: data.error || 'Unknown error',
          }).eq('id', job.id)
        }
      } catch {
        await supabaseAdmin.from('caption_jobs').update({ status: 'error', error_message: 'Polling error' }).eq('id', job.id)
      }
    }

    return new Response(JSON.stringify({ polled: jobs.length, completed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
