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

    const userId = user.id

    // 1. Anonymise profile
    await supabaseAdmin
      .from('profiles')
      .update({
        full_name: 'Deleted User',
        email: null,
        avatar_url: null,
        bio: null,
        headline: null,
        website: null,
        twitter_handle: null,
        linkedin_url: null,
        github_username: null,
        referral_code: null,
      })
      .eq('id', userId)

    // 2. Anonymise payments (preserve financial records)
    await supabaseAdmin
      .from('payments')
      .update({ user_email: 'deleted@anonymised.com' })
      .eq('user_id', userId)

    // 3. Delete Supabase Storage files
    const { data: files } = await supabaseAdmin.storage.from('avatars').list(userId)
    for (const file of (files || [])) {
      await supabaseAdmin.storage.from('avatars').remove([`${userId}/${file.name}`])
    }

    // 4. Log to audit
    await supabaseAdmin.from('audit_logs').insert({
      action: 'user.account_deleted',
      actor_id: userId,
      target_id: userId,
      metadata: { email: user.email }
    })

    // 4b. Log to GDPR retention log
    await supabaseAdmin.from('data_retention_logs').insert({
      user_id: userId,
      action: 'account_deleted',
      details: { email: user.email, deleted_at: new Date().toISOString() }
    })

    // 5. Delete auth user (removes login capability) using admin API directly
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteErr) throw new Error('Failed to delete auth user: ' + deleteErr.message)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
