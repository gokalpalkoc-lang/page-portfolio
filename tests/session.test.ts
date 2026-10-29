import { afterEach, describe, expect, it, vi } from "vitest";
import { authConfig, checkPassword, createSessionToken, SESSION_MAX_AGE_S, verifySessionToken } from "@/lib/auth/session";

const config = { password: "correct horse battery", secret: "s".repeat(32) };

describe("admin session", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is disabled until both variables are strong enough", () => {
    vi.stubEnv("ADMIN_PASSWORD", "short");
    vi.stubEnv("SESSION_SECRET", "s".repeat(32));
    expect(authConfig()).toBeNull();
    vi.stubEnv("ADMIN_PASSWORD", config.password);
    vi.stubEnv("SESSION_SECRET", "too short");
    expect(authConfig()).toBeNull();
    vi.stubEnv("SESSION_SECRET", config.secret);
    expect(authConfig()).toEqual(config);
  });

  it("checks the password", () => {
    expect(checkPassword(config, config.password)).toBe(true);
    expect(checkPassword(config, "wrong")).toBe(false);
    expect(checkPassword(config, "")).toBe(false);
  });

  it("accepts its own tokens until they expire", () => {
    const now = 1_000_000;
    const token = createSessionToken(config, now);
    expect(verifySessionToken(config, token, now + 1000)).toBe(true);
    expect(verifySessionToken(config, token, now + SESSION_MAX_AGE_S * 1000 + 1)).toBe(false);
  });

  it("rejects tampered, foreign and malformed tokens", () => {
    const token = createSessionToken(config);
    const [expires, signature] = token.split(".");
    const later = String(Number(expires) + 10 ** 9);
    expect(verifySessionToken(config, `${later}.${signature}`)).toBe(false);
    expect(verifySessionToken({ ...config, secret: "x".repeat(32) }, token)).toBe(false);
    for (const bad of [undefined, "", "abc", "1.2.3", `${expires}.`, `.${signature}`]) {
      expect(verifySessionToken(config, bad)).toBe(false);
    }
    expect(verifySessionToken(null, token)).toBe(false);
  });

  it("signs everyone out when the password changes", () => {
    const token = createSessionToken(config);
    expect(verifySessionToken({ ...config, password: "a different password" }, token)).toBe(false);
  });
});
