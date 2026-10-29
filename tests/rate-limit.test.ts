import { beforeEach, describe, expect, it } from "vitest";
import { clearFailures, isBlocked, recordFailure, resetRateLimit } from "@/lib/auth/rate-limit";

describe("sign-in rate limit", () => {
  beforeEach(() => resetRateLimit());

  it("blocks an address after five failures, for fifteen minutes", () => {
    const now = 0;
    for (let i = 0; i < 4; i++) recordFailure("1.1.1.1", now);
    expect(isBlocked("1.1.1.1", now)).toBe(false);
    recordFailure("1.1.1.1", now);
    expect(isBlocked("1.1.1.1", now)).toBe(true);
    expect(isBlocked("2.2.2.2", now)).toBe(false);
    expect(isBlocked("1.1.1.1", now + 15 * 60 * 1000)).toBe(false);
  });

  it("forgets an address after a successful sign-in", () => {
    for (let i = 0; i < 5; i++) recordFailure("1.1.1.1");
    clearFailures("1.1.1.1");
    expect(isBlocked("1.1.1.1")).toBe(false);
  });

  it("blocks everyone after thirty failures spread across addresses", () => {
    for (let i = 0; i < 30; i++) recordFailure(`10.0.0.${i}`, 0);
    expect(isBlocked("9.9.9.9", 0)).toBe(true);
  });
});
