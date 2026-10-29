"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { Field, inputClass, primaryButtonClass } from "./fields";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <AdminShell title="Admin" description="Sign in to edit your portfolio.">
      <form action={action} className="mt-8 space-y-4">
        <Field label="Password">
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
            className={inputClass}
          />
        </Field>
        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full py-2`}>
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Sign in
        </button>
      </form>
    </AdminShell>
  );
}

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-fg-muted text-pretty">{description}</p>
      {children}
      <Link href="/" className="mt-10 text-sm text-fg-subtle transition-colors hover:text-fg">
        ← Back to the site
      </Link>
    </main>
  );
}
