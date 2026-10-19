import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { analyzePhoto } from "./analyze.ts";
import { validatePhoto } from "./contract.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  const token = req.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json({ error: "Sign in to analyze photos" }, 401);
  const auth = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) return json({ error: "Sign in to analyze photos" }, 401);
  if (Number(req.headers.get("Content-Length") || 0) > 8_100_000) return json({ error: "Photo is too large" }, 413);
  let photo;
  try {
    const text = await req.text();
    if (text.length > 8_100_000) return json({ error: "Photo is too large" }, 413);
    photo = validatePhoto(JSON.parse(text));
  } catch { return json({ error: "Invalid photo request" }, 400); }
  if (!photo) return json({ error: "Provide a valid JPEG, PNG or WebP photo" }, 400);
  return json(await analyzePhoto(photo, Deno.env.get("GEMINI_API_KEY")));
});