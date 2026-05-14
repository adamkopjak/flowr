import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

type Body = {
  headline?: string;
  snippet?: string;
  tags?: string[];
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const RATE_LIMIT = {
  perIp: Number(process.env.NEWS_ANALYZE_LIMIT_PER_IP || 40),
  windowSec: Number(process.env.NEWS_ANALYZE_WINDOW_SECONDS || 3600),
  globalPerDay: Number(process.env.NEWS_ANALYZE_GLOBAL_DAILY_LIMIT || 2000),
};

function neutral(reason: string, status = 200) {
  return NextResponse.json(
    { verdict: "neutral", confidence: 0, reasoning: reason },
    { status },
  );
}

function parseSentiment(text: string): {
  verdict: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
} {
  const m = text && text.match(/\{[\s\S]*\}/);
  if (!m)
    return {
      verdict: "neutral",
      confidence: 0,
      reasoning: "Could not parse AI response.",
    };
  try {
    const j = JSON.parse(m[0]) as {
      verdict?: string;
      confidence?: number;
      reasoning?: string;
    };
    const v = (j.verdict || "").toLowerCase();
    const verdict: "bullish" | "bearish" | "neutral" =
      v === "bullish" || v === "bearish" ? v : "neutral";
    const confidence = Math.max(0, Math.min(100, Number(j.confidence) || 0));
    const reasoning = (j.reasoning || "").toString().slice(0, 240);
    return { verdict, confidence, reasoning };
  } catch {
    return {
      verdict: "neutral",
      confidence: 0,
      reasoning: "Could not parse AI response.",
    };
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, RATE_LIMIT);
  if (!rl.ok) {
    const wait = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    const mins = Math.ceil(wait / 60);
    const msg =
      rl.reason === "global"
        ? "The demo has hit its daily AI limit — try again tomorrow, or run flowr locally with your own GROQ_API_KEY."
        : `Hit the analyze limit (${RATE_LIMIT.perIp} per ${Math.round(
            RATE_LIMIT.windowSec / 60,
          )} min). Try again in ${mins}m.`;
    return NextResponse.json(
      { verdict: "neutral", confidence: 0, reasoning: msg, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(wait),
        },
      },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return neutral("Invalid request body.", 400);
  }

  const headline = (body.headline || "").trim().slice(0, 280);
  const snippet = (body.snippet || "").trim().slice(0, 800);
  const tags = Array.isArray(body.tags) ? body.tags.slice(0, 6) : [];

  if (!headline) return neutral("Missing headline.", 400);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return neutral(
      "AI not configured — set GROQ_API_KEY in .env.local to enable sentiment analysis.",
    );
  }

  const system =
    "You are a crypto markets analyst. Classify the short-term market sentiment of a news story for the assets it references. Respond with ONLY a JSON object (no markdown, no commentary), shaped exactly: {\"verdict\":\"bullish\"|\"bearish\"|\"neutral\",\"confidence\":0-100,\"reasoning\":\"one short sentence\"}.";

  const user = `HEADLINE: ${headline}\nSNIPPET: ${snippet}\nTAGS: ${
    tags.join(", ") || "none"
  }`;

  try {
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.warn("[flowr/api/news/analyze] groq error", r.status, text);
      return neutral("AI is unavailable right now — try again in a moment.");
    }

    const data = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content || "";
    return NextResponse.json(parseSentiment(raw));
  } catch (e) {
    console.warn("[flowr/api/news/analyze] fetch failed", (e as Error).message);
    return neutral("AI is offline right now — try again in a moment.");
  }
}
