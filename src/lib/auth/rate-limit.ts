import "server-only";

// Failed sign-ins, counted in memory over a sliding window: per IP, plus a global
// cap so that guessing spread across many addresses is slowed down too.
// Resets when the server restarts, which is acceptable for a single-admin site.

const WINDOW_MS = 15 * 60 * 1000;
const PER_IP_LIMIT = 5;
const GLOBAL_LIMIT = 30;

const failures = new Map<string, number[]>();
const GLOBAL_KEY = "*";

function recent(key: string, now: number): number[] {
  const kept = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (kept.length) failures.set(key, kept);
  else failures.delete(key);
  return kept;
}

export function isBlocked(ip: string, now = Date.now()): boolean {
  return recent(ip, now).length >= PER_IP_LIMIT || recent(GLOBAL_KEY, now).length >= GLOBAL_LIMIT;
}

export function recordFailure(ip: string, now = Date.now()): void {
  for (const key of [ip, GLOBAL_KEY]) failures.set(key, [...recent(key, now), now]);
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}

/** Test helper. */
export function resetRateLimit(): void {
  failures.clear();
}
