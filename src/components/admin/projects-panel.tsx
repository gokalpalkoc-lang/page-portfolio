"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PROJECT_STATUSES, STATUS_LABELS, type Project, type ProjectStatus } from "@/lib/content/schema";
import { moveItem, removeItem, replaceItem } from "@/lib/list";
import { buttonClass, Field, Group, ImageField, inputClass, ItemCard, ListInput, TextArea, TextInput } from "./fields";

export function ProjectsPanel({ projects, onChange }: { projects: Project[]; onChange: (projects: Project[]) => void }) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const add = () => {
    const project: Project = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      tagline: "",
      description: "",
      url: "",
      status: "in-development",
      tags: [],
      image: "",
    };
    onChange([...projects, project]);
    setAddedId(project.id);
  };

  return (
    <Group title="Projects" description="Your hub: each project is a card on the page, in this order.">
      <ul className="space-y-3">
        {projects.map((project, i) => {
          const update = (patch: Partial<Project>) => onChange(replaceItem(projects, i, { ...project, ...patch }));
          return (
            <li key={project.id}>
              <ItemCard
                title={project.name}
                meta={STATUS_LABELS[project.status]}
                visible={project.visible}
                onToggleVisible={() => update({ visible: !project.visible })}
                onMoveUp={i > 0 ? () => onChange(moveItem(projects, i, -1)) : undefined}
                onMoveDown={i < projects.length - 1 ? () => onChange(moveItem(projects, i, 1)) : undefined}
                onDelete={() => onChange(removeItem(projects, i))}
                defaultOpen={project.id === addedId}
              >
                <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                  <Field label="Name">
                    <TextInput value={project.name} onChange={(name) => update({ name })} maxLength={80} />
                  </Field>
                  <Field label="Status">
                    <select
                      value={project.status}
                      onChange={(e) => update({ status: e.target.value as ProjectStatus })}
                      className={inputClass}
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Tagline" hint="One sentence: what it is and who it is for.">
                  <TextInput value={project.tagline} onChange={(tagline) => update({ tagline })} maxLength={160} />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={project.description}
                    onChange={(description) => update({ description })}
                    rows={4}
                    maxLength={1200}
                  />
                </Field>
                <Field label="Link" hint="Where the card leads. Leave empty while the project is not public yet.">
                  <TextInput type="url" value={project.url} onChange={(url) => update({ url })} placeholder="https://" />
                </Field>
                <Field label="Tags" hint="Comma-separated, e.g. Next.js, TypeScript.">
                  <ListInput value={project.tags} onChange={(tags) => update({ tags })} separator="," />
                </Field>
                <Field label="Image" as="div" hint="Optional screenshot, shown at the top of the card (16:9 works best).">
                  <ImageField shape="wide" value={project.image} onChange={(image) => update({ image })} />
                </Field>
              </ItemCard>
            </li>
          );
        })}
      </ul>
      <button type="button" className={buttonClass} onClick={add}>
        <Plus className="size-4" aria-hidden />
        Add project
      </button>
    </Group>
  );
}
