export async function awardPoints(supabase: any, user_id: string, points: number, reason: string, reference_type?: string, reference_id?: string) {
  const { error } = await supabase.from("user_points_log").insert({
    user_id,
    points,
    reason,
    reference_type: reference_type || null,
    reference_id: reference_id || null,
  })
  if (error) console.error("awardPoints error:", error)
}
