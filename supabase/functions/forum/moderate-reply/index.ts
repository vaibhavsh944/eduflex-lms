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

    const { reply_id, action }: { reply_id: string; action: 'mark_accepted' | 'unmark_accepted' | 'delete' } = await req.json()
    if (!reply_id || !action) throw new Error('reply_id and action are required')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select('*, forum_threads!inner(course_id, courses!inner(instructor_id))')
      .eq('id', reply_id)
      .single()

    if (!reply) throw new Error('Reply not found')

    const threadInstructorId = (reply as any).forum_threads?.courses?.instructor_id

    if (action === 'mark_accepted' || action === 'unmark_accepted') {
      if (threadInstructorId !== user.id) {
        throw new Error('Only the course instructor can accept answers')
      }
      if (action === 'mark_accepted') {
        await supabaseAdmin
          .from('forum_replies')
          .update({ is_accepted: false })
          .eq('thread_id', (reply as any).thread_id)
          .eq('is_accepted', true)
      }
      const { error } = await supabaseAdmin
        .from('forum_replies')
        .update({ is_accepted: action === 'mark_accepted' })
        .eq('id', reply_id)
      if (error) throw error
    } else if (action === 'delete') {
      const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single()
      if (reply.user_id !== user.id && threadInstructorId !== user.id && profile?.role !== 'admin') {
        throw new Error('Not authorized to delete this reply')
      }
      const { error } = await supabaseAdmin.from('forum_replies').delete().eq('id', reply_id)
      if (error) throw error
    } else {
      throw new Error('Invalid action')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
