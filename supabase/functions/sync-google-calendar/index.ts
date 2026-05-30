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

    const { user_id, course_id, event_type, title, start_time, end_time } = await req.json()
    if (!user_id || !event_type) throw new Error('user_id and event_type are required')

    const appSecret = Deno.env.get('PGCRYPTO_APP_SECRET') ?? ''

    const { data: integration, error: integError } = await supabaseAdmin.rpc('get_decrypted_integration', {
      p_user_id: user_id,
      p_provider: 'google_calendar',
      p_app_secret: appSecret,
    })
    if (integError || !integration) throw new Error('Google Calendar not connected')

    const accessToken = integration.access_token_dec

    const event = {
      summary: title || 'EduFlow Event',
      description: `Synced from EduFlow (${event_type})`,
      start: { dateTime: start_time || new Date().toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: end_time || new Date().toISOString(), timeZone: 'Asia/Kolkata' },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }] },
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (res.status === 401) {
      const refreshToken = integration.refresh_token_dec
      if (!refreshToken) throw new Error('No refresh token available')

      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          grant_type: 'refresh_token',
        }),
      })

      const newTokens = await refreshRes.json()
      if (newTokens.access_token) {
        await supabaseAdmin.rpc('upsert_encrypted_integration', {
          p_user_id: user_id,
          p_provider: 'google_calendar',
          p_access_token: newTokens.access_token,
          p_refresh_token: newTokens.refresh_token || null,
          p_scopes: [],
          p_app_secret: appSecret,
        })

        event.reminders = { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }] }
        const retryRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newTokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })

        if (!retryRes.ok) throw new Error('Failed after token refresh: ' + await retryRes.text())
        return new Response(JSON.stringify({ synced: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Google Calendar API error: ${errBody}`)
    }

    return new Response(JSON.stringify({ synced: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
