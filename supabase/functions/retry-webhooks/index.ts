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

    // Fetch pending deliveries due for retry
    const { data: pending } = await supabaseAdmin
      .from('webhook_deliveries')
      .select('*, webhook_subscriptions!inner(url, secret_hash)')
      .eq('status', 'failed')
      .lte('next_retry_at', new Date().toISOString())
      .limit(50)

    let retried = 0
    for (const delivery of (pending || [])) {
      const sub = (delivery as any).webhook_subscriptions
      if (!sub) continue

      const payloadStr = JSON.stringify(delivery.payload)

      // Compute HMAC
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(sub.secret_hash),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
      )
      const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr))
      const signature = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('')

      let statusCode = 0
      let responseBody = ''
      let status = 'failed'
      let nextRetryAt = null

      try {
        const resp = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-EduFlow-Signature': signature,
            'X-EduFlow-Delivery-Id': delivery.id,
          },
          body: payloadStr,
          signal: AbortSignal.timeout(5000)
        })
        statusCode = resp.status
        responseBody = await resp.text()
        if (statusCode >= 200 && statusCode < 300) {
          status = 'success'
        }
      } catch (err: any) {
        responseBody = err.message
      }

      const attemptCount = (delivery.attempt_count || 0) + 1

      // Exponential backoff: 1min, 5min, 30min then stop
      if (status === 'failed' && attemptCount < 3) {
        const delays = [60000, 300000, 1800000] // 1min, 5min, 30min
        nextRetryAt = new Date(Date.now() + delays[attemptCount - 1]).toISOString()
      }

      await supabaseAdmin
        .from('webhook_deliveries')
        .update({
          status_code: statusCode,
          response_body: responseBody,
          status,
          next_retry_at: nextRetryAt,
          attempt_count: attemptCount,
          delivered_at: status === 'success' ? new Date().toISOString() : delivery.delivered_at
        })
        .eq('id', delivery.id)

      retried++
    }

    return new Response(JSON.stringify({ retried }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
