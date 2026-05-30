import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isPrivateIP(hostname: string): boolean {
  const parts = hostname.split('.')
  if (parts.length !== 4) return false
  const nums = parts.map(Number)
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return false
  if (nums[0] === 10) return true
  if (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31) return true
  if (nums[0] === 192 && nums[1] === 168) return true
  if (nums[0] === 127) return true
  return false
}

async function validateWebhookUrl(urlStr: string): Promise<void> {
  const url = new URL(urlStr)
  if (url.hostname === 'localhost' || url.hostname === '0.0.0.0') {
    throw new Error('Webhook URL resolves to localhost — blocked')
  }
  try {
    const dnsRes = await Deno.resolveDns(url.hostname, 'A')
    for (const ip of dnsRes) {
      if (isPrivateIP(ip)) {
        throw new Error('Webhook URL resolves to a private IP — blocked')
      }
    }
  } catch {
    // If DNS resolution fails, allow through but log
    console.warn(`DNS resolution failed for ${url.hostname}, allowing request`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, payload, org_id } = await req.json()
    if (!event_type || !payload) throw new Error('event_type and payload required')

    // Fetch active subscriptions matching this event type
    const { data: subscriptions } = await supabaseAdmin
      .from('webhook_subscriptions')
      .select('*')
      .contains('events', [event_type])
      .eq('is_active', true)

    const results: any[] = []

    for (const sub of (subscriptions || [])) {
      try {
        const resp = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-EduFlow-Signature': signature,
            'X-EduFlow-Delivery-Id': deliveryId,
          },
          body: payloadStr,
          signal: AbortSignal.timeout(5000)
        })
        statusCode = resp.status
        responseBody = await resp.text()
        deliveryStatus = statusCode >= 200 && statusCode < 300 ? 'success' : 'failed'
        if (deliveryStatus === 'failed') {
          nextRetryAt = new Date(Date.now() + 60000).toISOString() // 1 min
        }
      } catch (err: any) {
        statusCode = 0
        responseBody = err.message
        deliveryStatus = 'failed'
        nextRetryAt = new Date(Date.now() + 60000).toISOString() // 1 min
      }

      // Record delivery
      await supabaseAdmin.from('webhook_deliveries').insert({
        id: deliveryId,
        subscription_id: sub.id,
        event_type,
        payload: { event: event_type, ...payload },
        status_code: statusCode,
        response_body: responseBody,
        status: deliveryStatus as string,
        next_retry_at: nextRetryAt,
        attempt_count: 1,
        delivered_at: new Date().toISOString()
      })

      results.push({ subscription_id: sub.id, status: deliveryStatus, status_code: statusCode })
    }

    return new Response(JSON.stringify({ delivered: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
