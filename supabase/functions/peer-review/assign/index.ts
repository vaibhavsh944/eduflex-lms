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

    const { assignment_id } = await req.json()
    if (!assignment_id) throw new Error('assignment_id required')

    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignment_id)
      .single()

    if (!assignment) throw new Error('Assignment not found')

    const reviewerCount = assignment.peer_review_count || 3

    const { data: submissions } = await supabaseAdmin
      .from('assignment_submissions')
      .select('id, user_id')
      .eq('assignment_id', assignment_id)

    if (!submissions || submissions.length < 2) {
      throw new Error('Not enough submissions for peer review')
    }

    const shuffled = [...submissions].sort(() => Math.random() - 0.5)
    const reviewLoad: Record<string, number> = {}
    const assignments: { submission_id: string; reviewer_id: string }[] = []

    for (const submission of shuffled) {
      const eligible = shuffled.filter(
        (s) => s.user_id !== submission.user_id && !assignments.some(
          (a) => a.reviewer_id === s.user_id && a.submission_id === submission.id
        )
      )
      eligible.sort((a, b) => (reviewLoad[a.user_id] || 0) - (reviewLoad[b.user_id] || 0))
      const selected = eligible.slice(0, reviewerCount)
      for (const reviewer of selected) {
        assignments.push({ submission_id: submission.id, reviewer_id: reviewer.user_id })
        reviewLoad[reviewer.user_id] = (reviewLoad[reviewer.user_id] || 0) + 1
      }
    }

    if (assignments.length > 0) {
      const { error } = await supabaseAdmin.from('peer_review_assignments').insert(assignments)
      if (error) throw error
    }

    return new Response(JSON.stringify({ assigned: assignments.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
