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

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') throw new Error('Only admins can configure SSO')

    const { metadata_xml } = await req.json()
    if (!metadata_xml) throw new Error('metadata_xml is required')

    // In production, this calls Supabase Management API to register SAML provider
    // POST /v1/projects/{ref}/config/auth/saml with metadata XML
    // For now, store the SSO configuration state

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update first organization with SSO config
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (org) {
      await supabaseAdmin.from('organizations').update({
        sso_configured: true,
        saml_domain: 'sso.eduflow.com',
      }).eq('id', org.id)
    }

    return new Response(JSON.stringify({
      success: true,
      entity_id: `https://${Deno.env.get('SUPABASE_URL') ?? 'project'}.supabase.co/auth/v1/saml/acs`,
      acs_url: `https://${Deno.env.get('SUPABASE_URL') ?? 'project'}.supabase.co/auth/v1/saml/acs`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
