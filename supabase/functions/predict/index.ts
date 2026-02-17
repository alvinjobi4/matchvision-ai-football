import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { homeTeam, awayTeam, homePlayers, awayPlayers } = await req.json();

    const systemPrompt = `You are MatchVision AI, an expert football/soccer analyst. You analyze team data and player squads to generate match predictions.

You MUST respond with ONLY valid JSON, no markdown, no code blocks, no explanations. The JSON must follow this exact structure:

{
  "matchScore": { "home": <number>, "away": <number>, "confidence": <number 0-100> },
  "winner": "<team name or Draw>",
  "winConfidence": <number 0-100>,
  "stats": {
    "possession": { "home": <number>, "away": <number>, "confidence": <number> },
    "passes": { "home": <number>, "away": <number>, "confidence": <number> },
    "shots": { "home": <number>, "away": <number>, "confidence": <number> },
    "shotsOnTarget": { "home": <number>, "away": <number>, "confidence": <number> },
    "corners": { "home": <number>, "away": <number>, "confidence": <number> },
    "fouls": { "home": <number>, "away": <number>, "confidence": <number> }
  },
  "homeLineup": {
    "formation": "<e.g. 4-3-3>",
    "starting": [{"name": "<player name>", "position": "<GK/DEF/MID/FWD>", "number": <number>}],
    "substitutes": [{"name": "<player name>", "position": "<GK/DEF/MID/FWD>", "number": <number>}]
  },
  "awayLineup": {
    "formation": "<e.g. 4-2-3-1>",
    "starting": [{"name": "<player name>", "position": "<GK/DEF/MID/FWD>", "number": <number>}],
    "substitutes": [{"name": "<player name>", "position": "<GK/DEF/MID/FWD>", "number": <number>}]
  },
  "bestPerformers": {
    "home": [{"name": "<player name>", "rating": <number 1-10>, "reason": "<short reason>"}],
    "away": [{"name": "<player name>", "rating": <number 1-10>, "reason": "<short reason>"}]
  }
}

Rules:
- Use ONLY players from the provided squad lists
- Select 11 starters and up to 7 substitutes per team from the provided players
- Pick top 3 best performers per team
- Possession must add up to 100
- Be realistic based on team strength and player quality
- Confidence values should reflect uncertainty (60-90 range typically)`;

    const userPrompt = `Predict the match: ${homeTeam.name} (Home) vs ${awayTeam.name} (Away)

Home Team Squad (${homeTeam.name}):
${homePlayers.map((p: any) => `- ${p.name} (${p.position}, #${p.number})`).join("\n")}

Away Team Squad (${awayTeam.name}):
${awayPlayers.map((p: any) => `- ${p.name} (${p.position}, #${p.number})`).join("\n")}

Generate a complete match prediction with lineups using ONLY these players.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const prediction = JSON.parse(content);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
