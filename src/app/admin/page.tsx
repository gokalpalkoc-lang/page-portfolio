import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Editor } from "@/components/admin/editor";
import { AdminShell, LoginForm } from "@/components/admin/login-form";
import { authConfig, SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { readContent } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The configuration is read at request time; without this the build would freeze
// whatever the build machine's environment says (usually "Admin is off").
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const config = authConfig();
  if (!config) {
    return (
      <AdminShell
        title="Admin is off"
        description="Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) in the server's environment, then restart it."
      />
    );
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(config, token)) return <LoginForm />;

  return <Editor initialContent={await readContent()} />;
}
