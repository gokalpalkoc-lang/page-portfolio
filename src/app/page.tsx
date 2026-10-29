import type { Metadata } from "next";
import { cache } from "react";
import { Achievements } from "@/components/site/achievements";
import { Intro, ProfileHeader } from "@/components/site/profile";
import { Projects } from "@/components/site/projects";
import { Skills } from "@/components/site/skills";
import { readContent } from "@/lib/content/store";

// Content changes from /admin at any time; read it on every request.
export const dynamic = "force-dynamic";

// One read per request, shared by the metadata and the page.
const getContent = cache(readContent);

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  return {
    title: profile.name,
    description: profile.headline,
    openGraph: { title: profile.name, description: profile.headline, type: "profile" },
  };
}

export default async function HomePage() {
  const content = await getContent();
  const { profile } = content;
  const projects = content.projects.filter((p) => p.visible);
  const sections = content.sections
    .filter((s) => s.visible)
    .map((s) => ({ ...s, items: s.items.filter((i) => i.visible) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <main className="space-y-16 sm:space-y-20">
        <div className="rise space-y-10">
          <ProfileHeader profile={profile} links={content.links} />
          <Intro text={profile.intro} />
        </div>
        {projects.length > 0 && <Projects projects={projects} />}
        {sections.length > 0 && <Achievements sections={sections} />}
        {content.skills.length > 0 && <Skills skills={content.skills} />}
      </main>

      <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6 text-sm text-fg-subtle">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="transition-colors hover:text-fg">
            {profile.email}
          </a>
        )}
      </footer>
    </div>
  );
}
