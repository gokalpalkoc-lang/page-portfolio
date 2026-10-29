import { ArrowUpRight } from "lucide-react";
import type { Achievement, Section } from "@/lib/content/schema";
import { PageSection } from "./section";

export function Achievements({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => (
        <PageSection key={section.id} id={`section-${section.id}`} title={section.title}>
          <ol className="space-y-7">
            {section.items.map((item) => (
              <li key={item.id} className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                <p className="text-sm text-fg-subtle tabular-nums sm:pt-0.5">{item.date}</p>
                <AchievementBody item={item} />
              </li>
            ))}
          </ol>
        </PageSection>
      ))}
    </>
  );
}

function AchievementBody({ item }: { item: Achievement }) {
  const title = (
    <>
      {item.title}
      {item.org && <span className="font-normal text-fg-muted"> · {item.org}</span>}
    </>
  );

  return (
    <div className="min-w-0">
      <h3 className="font-medium text-fg text-pretty">
        {item.url ? (
          <a href={item.url} rel="noopener noreferrer" className="group transition-colors hover:text-accent">
            {title}
            <ArrowUpRight
              className="ml-0.5 inline size-3.5 -translate-y-px text-fg-subtle group-hover:text-accent"
              aria-hidden
            />
          </a>
        ) : (
          title
        )}
      </h3>
      {item.description && (
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted text-pretty">{item.description}</p>
      )}
    </div>
  );
}
