import { serve } from "https://deno.land/std@0.210.0/http/server.ts"
import { createSupabaseAdmin } from "../../_shared/supabase.ts"
import { handleCors, jsonResponse, errorResponse } from "../../_shared/cors.ts"
import { awardPoints } from "../../_shared/gamification.ts"

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const { user_id, context } = await req.json()
    if (!user_id) return errorResponse('user_id is required')

    const supabase = createSupabaseAdmin()

    const { data: badges } = await supabase
      .from("badges")
      .select("*")
      .neq("trigger_type", "manual")

    if (!badges?.length) {
      return jsonResponse({ awarded: [] })
    }

    const awarded: string[] = []

    for (const badge of badges) {
      const { data: existing } = await supabase
        .from("user_badges")
        .select("id")
        .eq("user_id", user_id)
        .eq("badge_id", badge.id)
        .maybeSingle()

      if (existing) continue

      let earned = false

      switch (badge.trigger_type) {
        case 'lesson_count': {
          const { count } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user_id)
            .eq("completed", true)
          earned = (count ?? 0) >= (badge.trigger_threshold ?? 1)
          break
        }
        case 'course_complete': {
          const { count } = await supabase
            .from("certificates")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user_id)
          earned = (count ?? 0) >= (badge.trigger_threshold ?? 1)
          break
        }
        case 'quiz_score': {
          if (context?.type === 'quiz_pass' && context?.value != null) {
            earned = (context.value ?? 0) >= (badge.trigger_threshold ?? 90)
          }
          break
        }
        case 'streak': {
          if (context?.type === 'streak' && context?.value != null) {
            earned = (context.value ?? 0) >= (badge.trigger_threshold ?? 7)
          }
          break
        }
      }

      if (earned) {
        await supabase.from("user_badges").insert({
          user_id,
          badge_id: badge.id,
        })

        await awardPoints(supabase, user_id, badge.points_value || 50, "badge_earned", "badge", badge.id)

        await supabase.from("notifications").insert({
          user_id,
          type: "badge_earned",
          title: `New Badge: ${badge.name}!`,
          body: badge.description,
          data: { badge_id: badge.id, badge_slug: badge.slug, points: badge.points_value || 50 },
        })

        awarded.push(badge.slug)
      }
    }

    return jsonResponse({ awarded })
  } catch (err) {
    console.error('check-badges error:', err)
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
