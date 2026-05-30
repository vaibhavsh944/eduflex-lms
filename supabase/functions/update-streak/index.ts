import { serve } from "https://deno.land/std@0.210.0/http/server.ts"
import { createSupabaseAdmin } from "../_shared/supabase.ts"
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await req.json()
    const user_id = body.user_id
    if (!user_id) return errorResponse('user_id is required')

    const supabase = createSupabaseAdmin()

    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    const { data: streak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle()

    if (streak) {
      const lastDate = streak.last_active_date?.split("T")[0]

      if (lastDate === today) {
        return jsonResponse({
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
          already_checked: true,
        })
      }

      const isConsecutive = lastDate === yesterday
      const current_streak = isConsecutive ? streak.current_streak + 1 : 1
      const longest_streak = Math.max(current_streak, streak.longest_streak)

      await supabase.from("user_streaks").update({
        current_streak,
        longest_streak,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user_id)

      return jsonResponse({ current_streak, longest_streak })
    } else {
      await supabase.from("user_streaks").insert({
        user_id,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
      })

      return jsonResponse({ current_streak: 1, longest_streak: 1 })
    }
  } catch (err) {
    console.error('update-streak error:', err)
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
