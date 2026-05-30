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

    const { file_id, mime_type } = await req.json()
    if (!file_id) throw new Error('file_id is required')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: integration } = await supabaseAdmin
      .from('user_integrations')
      .select('access_token_enc')
      .eq('user_id', user.id)
      .eq('provider', 'google_drive')
      .single()

    if (!integration) throw new Error('Google Drive not connected')

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file_id}?alt=media`,
      {
        headers: { Authorization: `Bearer ${integration.access_token_enc}` },
      }
    )

    if (!driveRes.ok) throw new Error('Failed to download file from Google Drive')

    const fileBuffer = await driveRes.arrayBuffer()
    const ext = mime_type?.split('/')?.[1] || 'bin'
    const fileName = `drive-imports/${user.id}/${file_id}.${ext}`
    const contentType = mime_type || 'application/octet-stream'

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('course-files')
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('course-files')
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({ url: publicUrl, fileName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
