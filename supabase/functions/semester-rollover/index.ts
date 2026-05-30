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

    const { source_semester_id, new_name, new_starts_at, new_ends_at, course_ids } = await req.json()
    if (!source_semester_id || !new_name || !new_starts_at || !new_ends_at) {
      throw new Error('source_semester_id, new_name, new_starts_at, new_ends_at are required')
    }

    const { data: newSem, error: semErr } = await supabaseAdmin
      .from('semesters')
      .insert({
        name: new_name,
        starts_at: new_starts_at,
        ends_at: new_ends_at,
        is_active: false,
      })
      .select()
      .single()
    if (semErr) throw new Error('Failed to create semester: ' + semErr.message)

    if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
      const { data: courses } = await supabaseAdmin
        .from('courses')
        .select('id, title, description, instructor_id, category, level, pricing_type, price, org_id, department_id')
        .in('id', course_ids)

      if (courses && courses.length > 0) {
        const shells = courses.map(c => ({
          title: c.title,
          description: c.description,
          instructor_id: c.instructor_id,
          category: c.category,
          level: c.level,
          pricing_type: c.pricing_type,
          price: c.price,
          org_id: c.org_id,
          department_id: c.department_id,
          semester_id: newSem.id,
          status: 'draft' as const,
        }))

        const { error: copyErr } = await supabaseAdmin.from('courses').insert(shells)
        if (copyErr) throw new Error('Failed to copy courses: ' + copyErr.message)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      semester_id: newSem.id,
      course_count: course_ids?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
