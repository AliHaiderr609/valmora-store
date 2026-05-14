// Simple in-memory token-bucket rate limiter (per IP+route).
// For production at scale, replace with Upstash Redis (drop-in compatible).

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { limit?: number; windowMs?: number } = {}
): { ok: boolean; remaining: number; resetIn: number } {
  const limit = opts.limit ?? 30;
  const windowMs = opts.windowMs ?? 60_000;
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = (elapsed / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = now;
  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, resetIn: windowMs - elapsed };
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens), resetIn: 0 };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}
