import type { ReactNode } from "react";

export function PageSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-hairline pt-10">
      <h2 id={id} className="font-serif text-2xl tracking-tight text-fg">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
