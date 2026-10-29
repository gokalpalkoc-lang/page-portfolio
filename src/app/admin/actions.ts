"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearFailures, isBlocked, recordFailure } from "@/lib/auth/rate-limit";
import {
  authConfig,
  checkPassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  verifySessionToken,
} from "@/lib/auth/session";
import { contentSchema, describeIssue } from "@/lib/content/schema";
import { writeContent } from "@/lib/content/store";
import { MAX_UPLOAD_BYTES, saveImage, sniffImage } from "@/lib/content/uploads";

// Server Actions are posted to the page that calls them, so the cookie only needs /admin.
const COOKIE_PATH = "/admin";

export interface LoginState {
  error: string | null;
}

type Failure = { ok: false; error: string; issues?: string[] };
export type SaveResult = { ok: true; savedAt: string } | Failure;
export type UploadResult = { ok: true; path: string } | Failure;

const SIGNED_OUT: Failure = {
  ok: false,
  error: "Your session has expired. Open /admin in a new tab, sign in, then save here again.",
};

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const config = authConfig();
  if (!config) return { error: "The admin is not configured on this server." };

  const ip = await clientIp();
  if (isBlocked(ip)) return { error: "Too many attempts. Try again in 15 minutes." };

  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(config, password)) {
    recordFailure(ip);
    return { error: "That password is not right." };
  }

  clearFailures(ip);
  (await cookies()).set(SESSION_COOKIE, createSessionToken(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: COOKIE_PATH });
  redirect("/admin");
}

export async function saveContent(input: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return SIGNED_OUT;

  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some fields need fixing before this can be saved.",
      issues: parsed.error.issues.map((issue) => describeIssue(input, issue)),
    };
  }

  await writeContent(parsed.data);
  revalidatePath("/");
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await isAdmin())) return SIGNED_OUT;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image first." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniffImage(bytes)) return { ok: false, error: "Use a PNG, JPEG, WebP, AVIF or GIF image." };
  return { ok: true, path: await saveImage(bytes) };
}

async function isAdmin(): Promise<boolean> {
  return verifySessionToken(authConfig(), (await cookies()).get(SESSION_COOKIE)?.value);
}

async function clientIp(): Promise<string> {
  // Caddy, the only way in, replaces any client-sent X-Forwarded-For with the real address.
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",").at(-1)?.trim() || "unknown";
}
