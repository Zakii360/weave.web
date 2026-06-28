// =====================================================================
//  WEAVE.WEB — SUPABASE EDGE FUNCTION v2
//  Route: /functions/v1/GROQAI  (kept same URL for drop-in compatibility)
//
//  Now uses Anthropic Claude (claude-haiku-4-5) for far superior
//  weave.web code generation. Falls back to Groq if no Anthropic key.
//
//  Env vars needed in Supabase Dashboard → Settings → Edge Functions:
//    ANTHROPIC_API_KEY   ← primary (recommended)
//    GROQ_API_KEY        ← fallback
// =====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")
const GROQ_KEY      = Deno.env.get("GROQ_API_KEY")

// ── Anthropic handler ─────────────────────────────────────────────────

async function callAnthropic(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":            "application/json",
      "x-api-key":               ANTHROPIC_KEY!,
      "anthropic-version":       "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [
        { role: "user", content: prompt }
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic error: ${response.status}`)
  }

  return data.content?.[0]?.text ?? ""
}

// ── Groq fallback ─────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model:    "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq error: ${response.status}`)
  }

  return data.choices?.[0]?.message?.content ?? ""
}

// ── Main handler ──────────────────────────────────────────────────────

Deno.serve(async (req) => {

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let result: string

    if (ANTHROPIC_KEY) {
      result = await callAnthropic(prompt)
    } else if (GROQ_KEY) {
      result = await callGroq(prompt)
    } else {
      throw new Error("No AI API key configured. Set ANTHROPIC_API_KEY or GROQ_API_KEY in Supabase secrets.")
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("Edge function error:", err)
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
