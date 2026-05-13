// Simple in-memory rate limiter. Good enough for a single-instance deploy
// (Node server, single Vercel/Netlify function instance). For multi-instance
// production, swap to Upstash Redis (@upstash/ratelimit) — same interface.

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
let globalBucket: Bucket = { count: 0, resetAt: 0 };

export type RateLimitConfig = {
  perIp: number;
  windowSec: number;
  globalPerDay: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; reason: "ip" | "global"; resetAt: number };

export function checkRateLimit(
  ip: string,
  cfg: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();

  if (globalBucket.resetAt < now) {
    globalBucket = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
  }
  if (globalBucket.count >= cfg.globalPerDay) {
    return { ok: false, reason: "global", resetAt: globalBucket.resetAt };
  }

  let bucket = ipBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + cfg.windowSec * 1000 };
    ipBuckets.set(ip, bucket);
  }
  if (bucket.count >= cfg.perIp) {
    return { ok: false, reason: "ip", resetAt: bucket.resetAt };
  }

  bucket.count++;
  globalBucket.count++;

  if (ipBuckets.size > 5000) {
    for (const [k, v] of ipBuckets) if (v.resetAt < now) ipBuckets.delete(k);
  }

  return {
    ok: true,
    remaining: cfg.perIp - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  return "unknown";
}
