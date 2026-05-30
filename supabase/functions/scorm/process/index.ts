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

    const { lesson_id, storage_path } = await req.json()
    if (!lesson_id || !storage_path) throw new Error('lesson_id and storage_path required')

    const { data: fileContent, error: fileError } = await supabaseAdmin
      .storage
      .from('scorm-packages')
      .download(storage_path)

    if (fileError) throw new Error('Failed to download SCORM package')
    if (!fileContent || fileContent.size > 50 * 1024 * 1024) throw new Error('File exceeds 50MB limit')

    const zipBuffer = await fileContent.arrayBuffer()
    const zipBytes = new Uint8Array(zipBuffer)

    const imsmanifestIndex = findStringInBytes(zipBytes, 'imsmanifest.xml')
    if (imsmanifestIndex === -1) throw new Error('imsmanifest.xml not found in SCORM package')

    const manifestContent = extractXMLContent(zipBytes)
    const entryPoint = extractEntryPoint(manifestContent)

    const { error: updateError } = await supabaseAdmin
      .from('scorm_packages')
      .insert({
        lesson_id,
        storage_path,
        manifest_data: { raw: manifestContent.substring(0, 2000) },
        entry_point: entryPoint || 'index.html',
        status: 'ready',
      })

    if (updateError) throw updateError

    return new Response(JSON.stringify({
      success: true,
      entry_point: entryPoint || 'index.html',
      manifest_valid: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function findStringInBytes(bytes: Uint8Array, str: string): number {
  const strBytes = new TextEncoder().encode(str)
  for (let i = 0; i <= bytes.length - strBytes.length; i++) {
    let match = true
    for (let j = 0; j < strBytes.length; j++) {
      if (bytes[i + j] !== strBytes[j]) { match = false; break }
    }
    if (match) return i
  }
  return -1
}

function extractXMLContent(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  return decoder.decode(bytes)
}

function extractEntryPoint(xml: string): string | null {
  const match = xml.match(/<resource[^>]*identifier="[^"]*"[^>]*>\s*<file\s+href="([^"]+)"/i)
  return match ? match[1] : null
}
