"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Link, Profile } from "@/lib/content/schema";
import { moveItem, removeItem, replaceItem } from "@/lib/list";
import { buttonClass, Field, Group, ImageField, TextArea, TextInput } from "./fields";

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-hairline/70 hover:text-fg disabled:pointer-events-none disabled:opacity-30";

export function ProfilePanel({
  profile,
  links,
  onProfileChange,
  onLinksChange,
}: {
  profile: Profile;
  links: Link[];
  onProfileChange: (profile: Profile) => void;
  onLinksChange: (links: Link[]) => void;
}) {
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => onProfileChange({ ...profile, [key]: value });

  return (
    <div className="space-y-12">
      <Group title="About you" description="The top of the page: who you are and why you build.">
        <Field label="Photo" as="div" hint="Optional. Shown as a small circle next to your name.">
          <ImageField shape="round" value={profile.photo} onChange={(photo) => set("photo", photo)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={profile.name} onChange={(v) => set("name", v)} maxLength={80} />
          </Field>
          <Field label="Location">
            <TextInput value={profile.location} onChange={(v) => set("location", v)} maxLength={80} placeholder="Istanbul, Turkey" />
          </Field>
        </div>
        <Field label="Headline" hint="One line under your name.">
          <TextInput value={profile.headline} onChange={(v) => set("headline", v)} maxLength={160} />
        </Field>
        <Field label="Public email" hint="Optional. Leave empty to keep your email off the page.">
          <TextInput type="email" value={profile.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
        </Field>
        <Field
          label="Introduction"
          hint="Separate paragraphs with a blank line. The first paragraph is shown larger, as an opening line."
        >
          <TextArea value={profile.intro} onChange={(v) => set("intro", v)} rows={16} maxLength={4000} />
        </Field>
      </Group>

      <Group title="Links" description="Shown under your name, in this order.">
        <ul className="space-y-2">
          {links.map((link, i) => {
            const update = (patch: Partial<Link>) => onLinksChange(replaceItem(links, i, { ...link, ...patch }));
            return (
              <li key={link.id} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <TextInput
                  value={link.label}
                  onChange={(label) => update({ label })}
                  placeholder="Label"
                  aria-label="Link label"
                  className="sm:w-36"
                />
                <TextInput
                  type="url"
                  value={link.url}
                  onChange={(url) => update({ url })}
                  placeholder="https://"
                  aria-label={`${link.label || "Link"} address`}
                />
                <div className="ml-auto flex sm:ml-0">
                  <button
                    type="button"
                    className={iconButton}
                    disabled={i === 0}
                    onClick={() => onLinksChange(moveItem(links, i, -1))}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    disabled={i === links.length - 1}
                    onClick={() => onLinksChange(moveItem(links, i, 1))}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={`${iconButton} hover:text-danger`}
                    onClick={() => onLinksChange(removeItem(links, i))}
                    aria-label={`Delete ${link.label || "link"}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onLinksChange([...links, { id: crypto.randomUUID(), label: "", url: "" }])}
        >
          <Plus className="size-4" aria-hidden />
          Add link
        </button>
      </Group>
    </div>
  );
}
