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

    const { thread_id, action }: { thread_id: string; action: 'pin' | 'lock' | 'off-topic' | 'delete' } = await req.json()
    if (!thread_id || !action) throw new Error('thread_id and action are required')

    const validActions = ['pin', 'lock', 'off-topic', 'delete']
    if (!validActions.includes(action)) throw new Error('Invalid action')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: thread } = await supabaseAdmin
      .from('forum_threads')
      .select('*, courses!inner(instructor_id)')
      .eq('id', thread_id)
      .single()

    if (!thread) throw new Error('Thread not found')

    const isInstructor = thread.courses?.instructor_id === user.id
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!isInstructor && profile?.role !== 'admin') {
      throw new Error('Only instructors or admins can moderate threads')
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.from('forum_threads').delete().eq('id', thread_id)
      if (error) throw error

      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'delete_forum_thread',
        entity_type: 'forum_thread',
        entity_id: thread_id,
        metadata: { thread_title: (thread as any).title, course_id: (thread as any).course_id },
      })
    } else {
      const updateData: Record<string, any> = {}
      if (action === 'pin') updateData.is_pinned = !thread.is_pinned
      if (action === 'lock') updateData.is_locked = !thread.is_locked
      if (action === 'off-topic') updateData.is_off_topic = !thread.is_off_topic

      const { error } = await supabaseAdmin.from('forum_threads').update(updateData).eq('id', thread_id)
      if (error) throw error
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
