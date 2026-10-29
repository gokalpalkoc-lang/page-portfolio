import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { STATUS_LABELS, type Project, type ProjectStatus } from "@/lib/content/schema";
import { PageSection } from "./section";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <PageSection id="projects" title="Projects">
      <ul className="grid gap-4">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      {project.image && (
        <Image
          src={project.image}
          alt=""
          width={1200}
          height={675}
          unoptimized
          className="mb-5 aspect-video w-full rounded-lg object-cover ring-1 ring-hairline"
        />
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h3 className="text-lg font-medium tracking-tight text-fg">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      {project.tagline && <p className="mt-1.5 text-fg text-pretty">{project.tagline}</p>}
      {project.description && (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted text-pretty">{project.description}</p>
      )}
      {(project.tags.length > 0 || project.url) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <p className="text-fg-subtle">{project.tags.join(" · ")}</p>
          {project.url && (
            <span className="inline-flex items-center gap-0.5 font-medium text-accent">
              {hostOf(project.url)}
              <ArrowUpRight
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          )}
        </div>
      )}
    </>
  );

  const frame = "block rounded-2xl border border-hairline bg-surface p-5 sm:p-6";
  if (!project.url) return <article className={frame}>{body}</article>;

  return (
    <a
      href={project.url}
      className={`group ${frame} transition-[border-color,box-shadow] hover:border-hairline-strong hover:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]`}
    >
      {body}
    </a>
  );
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  live: "text-accent",
  "in-development": "text-warn",
  archived: "text-fg-subtle",
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-hairline px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "Visit";
  }
}
