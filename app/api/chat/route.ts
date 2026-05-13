import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

type CoinSnapshot = {
  name: string;
  symbol: string;
  price: number;
  change24h: number | null;
};

type Body = {
  question?: string;
  coins?: CoinSnapshot[];
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const RATE_LIMIT = {
  perIp: Number(process.env.CHAT_LIMIT_PER_IP || 3),
  windowSec: Number(process.env.CHAT_WINDOW_SECONDS || 3600),
  globalPerDay: Number(process.env.CHAT_GLOBAL_DAILY_LIMIT || 500),
};

function retryAfterSeconds(resetAt: number): number {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, RATE_LIMIT);
  if (!rl.ok) {
    const wait = retryAfterSeconds(rl.resetAt);
    const mins = Math.ceil(wait / 60);
    const msg =
      rl.reason === "global"
        ? `The demo has hit its daily limit — try again tomorrow, or run flowr locally with your own GROQ_API_KEY.`
        : `You've hit the demo limit of ${RATE_LIMIT.perIp} questions per ${Math.round(RATE_LIMIT.windowSec / 60)} minutes. Try again in ${mins}m, or run flowr locally with your own GROQ_API_KEY.`;
    return NextResponse.json(
      { reply: msg, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(wait),
          "X-RateLimit-Limit": String(RATE_LIMIT.perIp),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "missing question" }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json(
      { reply: "Please keep questions under 500 characters." },
      { status: 200 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "The assistant isn't configured yet — set GROQ_API_KEY in .env.local to enable real answers (free key at console.groq.com).",
      },
      { status: 200 },
    );
  }

  const snapshot = (body.coins || []).slice(0, 8);

  const system = `You are flowr AI, a concise crypto assistant for the flowr dashboard. Keep answers brief (2-4 sentences). Be factual about crypto basics. If asked why a coin moved, hedge appropriately — you don't have today's news, only the price snapshot below. Today's market snapshot (top coins): ${JSON.stringify(snapshot)}.`;

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
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.warn("[flowr/api/chat] groq error", r.status, text);
      return NextResponse.json(
        { reply: "The assistant is unavailable right now — try again in a moment." },
        { status: 200 },
      );
    }

    const data = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json(
      {
        reply: reply || "I'm not sure how to answer that.",
      },
      {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT.perIp),
          "X-RateLimit-Remaining": String(rl.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      },
    );
  } catch (e) {
    console.warn("[flowr/api/chat] fetch failed", (e as Error).message);
    return NextResponse.json(
      { reply: "I'm offline right now — try again in a moment." },
      { status: 200 },
    );
  }
}
