import { PageSection } from "./section";

export function Skills({ skills }: { skills: string[] }) {
  return (
    <PageSection id="skills" title="Skills">
      <ul className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <li key={`${i}-${skill}`} className="rounded-full border border-hairline px-3 py-1 text-sm text-fg-muted">
            {skill}
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
