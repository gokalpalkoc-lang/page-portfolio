import { z } from "zod";

// Everything the public page shows lives in one Content document, edited in /admin.
// Array order is display order; `visible: false` keeps an entry in the admin only.

const id = z.string().regex(/^[a-z0-9-]{1,40}$/);
const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1, "Required");

// http(s) only, so a typo can never become a `javascript:` link.
const httpUrl = z.url({ protocol: /^https?$/, message: "Must be a full address starting with https://" });
const optionalUrl = z.union([z.literal(""), httpUrl]);

export const UPLOAD_PATH = /^\/uploads\/[a-z0-9-]+\.(png|jpg|webp|avif|gif)$/;
const imagePath = z.union([z.literal(""), z.string().regex(UPLOAD_PATH)]);

export const PROJECT_STATUSES = ["live", "in-development", "archived"] as const;

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  "in-development": "In development",
  archived: "Archived",
};

export const linkSchema = z.object({
  id,
  label: required(40),
  url: httpUrl,
});

export const projectSchema = z.object({
  id,
  visible: z.boolean(),
  name: required(80),
  tagline: text(160),
  description: text(1200),
  url: optionalUrl,
  status: z.enum(PROJECT_STATUSES),
  tags: z.array(required(40)).max(12),
  image: imagePath,
});

export const achievementSchema = z.object({
  id,
  visible: z.boolean(),
  title: required(120),
  org: text(120),
  date: text(60),
  description: text(800),
  url: optionalUrl,
});

export const sectionSchema = z.object({
  id,
  visible: z.boolean(),
  title: required(60),
  items: z.array(achievementSchema).max(60),
});

export const contentSchema = z.object({
  profile: z.object({
    name: required(80),
    headline: text(160),
    location: text(80),
    photo: imagePath,
    // Paragraphs separated by a blank line.
    intro: text(4000),
    email: z.union([z.literal(""), z.email("Must be a valid email address")]),
  }),
  links: z.array(linkSchema).max(12),
  projects: z.array(projectSchema).max(50),
  sections: z.array(sectionSchema).max(20),
  skills: z.array(required(40)).max(60),
});

export type Content = z.infer<typeof contentSchema>;
export type Profile = Content["profile"];
export type Link = z.infer<typeof linkSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectStatus = Project["status"];
export type Section = z.infer<typeof sectionSchema>;
export type Achievement = z.infer<typeof achievementSchema>;

export function paragraphs(intro: string): string[] {
  return intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Readable location for a validation issue, e.g. "Projects › Operon › Link".
 * `input` is what failed validation, so it is read defensively.
 */
export function describeIssue(input: unknown, issue: z.core.$ZodIssue): string {
  const [area, index, field, subIndex, subField] = issue.path;
  const labels: string[] = [];
  const root = isRecord(input) ? input : {};
  const name = (list: unknown, i: unknown, key: string, fallback: string) => {
    const item = Array.isArray(list) && typeof i === "number" ? list[i] : undefined;
    const value = isRecord(item) ? item[key] : undefined;
    return typeof value === "string" && value.trim() ? value.trim() : `${fallback} ${Number(i) + 1}`;
  };

  switch (area) {
    case "profile":
      labels.push("Profile", fieldLabel(field));
      break;
    case "links":
      labels.push("Profile › Links", name(root.links, index, "label", "Link"), fieldLabel(field));
      break;
    case "projects":
      labels.push("Projects", name(root.projects, index, "name", "Project"), fieldLabel(field));
      break;
    case "sections": {
      labels.push("Achievements", name(root.sections, index, "title", "Section"));
      if (field === "items") {
        const section = Array.isArray(root.sections) && typeof index === "number" ? root.sections[index] : undefined;
        labels.push(name(isRecord(section) ? section.items : undefined, subIndex, "title", "Item"), fieldLabel(subField));
      } else {
        labels.push(fieldLabel(field));
      }
      break;
    }
    case "skills":
      labels.push("Skills");
      break;
    default:
      labels.push(issue.path.join("."));
  }
  return `${labels.filter(Boolean).join(" › ")}: ${issue.message}`;
}

const FIELD_LABELS: Record<string, string> = {
  url: "Link",
  org: "Organisation",
  photo: "Photo",
  image: "Image",
  intro: "Introduction",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function fieldLabel(field: unknown): string {
  if (typeof field !== "string") return "";
  return FIELD_LABELS[field] ?? field.charAt(0).toUpperCase() + field.slice(1);
}
