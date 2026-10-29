"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Achievement, Section } from "@/lib/content/schema";
import { moveItem, removeItem, replaceItem } from "@/lib/list";
import { buttonClass, Field, Group, ItemCard, TextArea, TextInput } from "./fields";

export function SectionsPanel({ sections, onChange }: { sections: Section[]; onChange: (sections: Section[]) => void }) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const addSection = () => {
    const section: Section = { id: crypto.randomUUID(), visible: true, title: "", items: [] };
    onChange([...sections, section]);
    setAddedId(section.id);
  };

  return (
    <Group
      title="Achievements"
      description="Sections such as Experience, Education or Awards. Empty or hidden sections are left off the page."
    >
      <ul className="space-y-3">
        {sections.map((section, i) => {
          const update = (patch: Partial<Section>) => onChange(replaceItem(sections, i, { ...section, ...patch }));
          const shown = section.items.filter((item) => item.visible).length;
          return (
            <li key={section.id}>
              <ItemCard
                title={section.title}
                meta={`${shown} of ${section.items.length} shown`}
                visible={section.visible}
                onToggleVisible={() => update({ visible: !section.visible })}
                onMoveUp={i > 0 ? () => onChange(moveItem(sections, i, -1)) : undefined}
                onMoveDown={i < sections.length - 1 ? () => onChange(moveItem(sections, i, 1)) : undefined}
                onDelete={() => onChange(removeItem(sections, i))}
                defaultOpen={section.id === addedId}
              >
                <Field label="Section title">
                  <TextInput value={section.title} onChange={(title) => update({ title })} maxLength={60} />
                </Field>
                <SectionItems items={section.items} onChange={(items) => update({ items })} />
              </ItemCard>
            </li>
          );
        })}
      </ul>
      <button type="button" className={buttonClass} onClick={addSection}>
        <Plus className="size-4" aria-hidden />
        Add section
      </button>
    </Group>
  );
}

function SectionItems({ items, onChange }: { items: Achievement[]; onChange: (items: Achievement[]) => void }) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const add = () => {
    const item: Achievement = {
      id: crypto.randomUUID(),
      visible: true,
      title: "",
      org: "",
      date: "",
      description: "",
      url: "",
    };
    onChange([...items, item]);
    setAddedId(item.id);
  };

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-fg">Entries</p>
      {items.length === 0 && <p className="text-sm text-fg-subtle">No entries yet.</p>}
      <ul className="space-y-2">
        {items.map((item, i) => {
          const update = (patch: Partial<Achievement>) => onChange(replaceItem(items, i, { ...item, ...patch }));
          return (
            <li key={item.id}>
              <ItemCard
                title={item.title}
                meta={item.date}
                visible={item.visible}
                onToggleVisible={() => update({ visible: !item.visible })}
                onMoveUp={i > 0 ? () => onChange(moveItem(items, i, -1)) : undefined}
                onMoveDown={i < items.length - 1 ? () => onChange(moveItem(items, i, 1)) : undefined}
                onDelete={() => onChange(removeItem(items, i))}
                defaultOpen={item.id === addedId}
              >
                <Field label="Title" hint="e.g. Gold medal, Research intern, AP Biology: 5.">
                  <TextInput value={item.title} onChange={(title) => update({ title })} maxLength={120} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Organisation">
                    <TextInput value={item.org} onChange={(org) => update({ org })} maxLength={120} />
                  </Field>
                  <Field label="Date" hint="Free text, e.g. 2025 or Jun – Aug 2025.">
                    <TextInput value={item.date} onChange={(date) => update({ date })} maxLength={60} />
                  </Field>
                </div>
                <Field label="Link" hint="Optional: a certificate, article or the organisation's page.">
                  <TextInput type="url" value={item.url} onChange={(url) => update({ url })} placeholder="https://" />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={item.description}
                    onChange={(description) => update({ description })}
                    rows={3}
                    maxLength={800}
                  />
                </Field>
              </ItemCard>
            </li>
          );
        })}
      </ul>
      <button type="button" className={buttonClass} onClick={add}>
        <Plus className="size-4" aria-hidden />
        Add entry
      </button>
    </div>
  );
}
