// supabase/functions/check-rate-limit/index.ts
var import_server = require("https://deno.land/std@0.168.0/http/server.ts");
var import_supabase_js_2 = require("https://esm.sh/@supabase/supabase-js@2");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
(0, import_server.serve)(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { key, max_count, window_minutes } = await req.json();
    if (!key || !max_count) throw new Error("key and max_count are required");
    const supabaseAdmin = (0, import_supabase_js_2.createClient)(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const windowEnd = new Date(Date.now() + (window_minutes || 1) * 60 * 1e3).toISOString();
    const { data: existing } = await supabaseAdmin.from("rate_limits").select("count, window_end").eq("key", key).maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("rate_limits").insert({ key, count: 1, window_end: windowEnd });
      return new Response(JSON.stringify({ allowed: true, remaining: max_count - 1 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (new Date(existing.window_end) < /* @__PURE__ */ new Date()) {
      await supabaseAdmin.from("rate_limits").update({ count: 1, window_end: windowEnd }).eq("key", key);
      return new Response(JSON.stringify({ allowed: true, remaining: max_count - 1 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (existing.count >= max_count) {
      return new Response(JSON.stringify({ allowed: false, message: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    await supabaseAdmin.from("rate_limits").update({ count: existing.count + 1 }).eq("key", key);
    return new Response(JSON.stringify({ allowed: true, remaining: max_count - existing.count - 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
