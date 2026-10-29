"use client";

import { ExternalLink, Loader2, LogOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { logout, saveContent } from "@/app/admin/actions";
import type { Content } from "@/lib/content/schema";
import { buttonClass, Field, Group, ListInput, primaryButtonClass } from "./fields";
import { ProfilePanel } from "./profile-panel";
import { ProjectsPanel } from "./projects-panel";
import { SectionsPanel } from "./sections-panel";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface SaveError {
  message: string;
  issues: string[];
}

export function Editor({ initialContent }: { initialContent: Content }) {
  const [content, setContent] = useState(initialContent);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<SaveError | null>(null);
  const [tab, setTab] = useState<TabId>("profile");
  const [saving, startSaving] = useTransition();

  const dirty = useMemo(() => JSON.stringify(content) !== savedJson, [content, savedJson]);

  const save = useCallback(() => {
    const snapshot = content;
    startSaving(async () => {
      const result = await saveContent(snapshot);
      if (result.ok) {
        setSavedJson(JSON.stringify(snapshot));
        setSavedAt(result.savedAt);
        setError(null);
      } else {
        setError({ message: result.error, issues: result.issues ?? [] });
      }
    });
  }, [content]);

  // Ctrl/Cmd+S saves.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !saving) save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dirty, saving, save]);

  // The browser asks before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const status = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : savedAt
        ? `Saved at ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "Up to date";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-hairline bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3">
          <p className="font-serif text-lg tracking-tight">Portfolio admin</p>
          <p aria-live="polite" className={`text-sm ${dirty && !saving ? "text-warn" : "text-fg-subtle"}`}>
            {status}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener" className={buttonClass}>
              <ExternalLink className="size-3.5" aria-hidden />
              View site
            </a>
            <button type="button" onClick={save} disabled={!dirty || saving} className={primaryButtonClass}>
              {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              Save
            </button>
            <form
              action={logout}
              onSubmit={(event) => {
                if (dirty && !confirm("Sign out without saving your changes?")) event.preventDefault();
              }}
            >
              <button type="submit" className={buttonClass} aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Editor sections" className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pt-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`shrink-0 border-b-2 px-3 pt-1 pb-2.5 text-sm font-medium transition-colors ${
                tab === id ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-24">
        {error && (
          <div role="alert" className="mb-8 rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm">
            <p className="font-medium text-danger">{error.message}</p>
            {error.issues.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
                {error.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "profile" && (
          <ProfilePanel
            profile={content.profile}
            links={content.links}
            onProfileChange={(profile) => setContent((c) => ({ ...c, profile }))}
            onLinksChange={(links) => setContent((c) => ({ ...c, links }))}
          />
        )}
        {tab === "projects" && (
          <ProjectsPanel projects={content.projects} onChange={(projects) => setContent((c) => ({ ...c, projects }))} />
        )}
        {tab === "achievements" && (
          <SectionsPanel sections={content.sections} onChange={(sections) => setContent((c) => ({ ...c, sections }))} />
        )}
        {tab === "skills" && (
          <Group title="Skills" description="Shown as a row of tags near the end of the page.">
            <Field label="Skills" hint="One per line, in the order you want them shown.">
              <ListInput
                value={content.skills}
                onChange={(skills) => setContent((c) => ({ ...c, skills }))}
                separator={"\n"}
                rows={14}
              />
            </Field>
          </Group>
        )}
      </main>
    </div>
  );
}
