import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const JUDGE0_API_KEY = Deno.env.get('JUDGE0_API_KEY') ?? ''
    if (!JUDGE0_API_KEY) throw new Error('Judge0 API key not configured')

    const { language, code, test_cases } = await req.json()
    if (!language || !code) throw new Error('language and code required')

    const languageMap: Record<string, number> = {
      javascript: 63, typescript: 63, python: 71, java: 62,
      cpp: 54, go: 60, rust: 73, ruby: 72, php: 68, sql: 82,
    }

    const languageId = languageMap[language]
    if (!languageId) throw new Error(`Unsupported language: ${language}`)

    const results = []
    for (const tc of test_cases || [{ input: '', expected: '' }]) {
      const body = {
        source_code: code,
        language_id: languageId,
        stdin: tc.input ?? '',
        expected_output: tc.expected ?? '',
        cpu_time_limit: 5,
        memory_limit: 128000,
      }

      const res = await fetch('https://judge0.ce.premium.com/submissions?wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JUDGE0_API_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Judge0 API error')

      const result = await res.json()
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: result.stdout ?? result.stderr ?? '',
        passed: result.status?.id === 3 && result.stdout?.trim() === (tc.expected ?? '').trim(),
        status: result.status?.description ?? 'Error',
        stderr: result.stderr ?? null,
      })
    }

    return new Response(JSON.stringify({ results, passed: results.every((r) => r.passed) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
