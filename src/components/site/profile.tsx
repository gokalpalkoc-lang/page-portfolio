import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { paragraphs, type Link, type Profile } from "@/lib/content/schema";

export function ProfileHeader({ profile, links }: { profile: Profile; links: Link[] }) {
  return (
    <header>
      <div className="flex items-center gap-5">
        {profile.photo && (
          <Image
            src={profile.photo}
            alt=""
            width={72}
            height={72}
            unoptimized
            priority
            className="size-16 shrink-0 rounded-full object-cover ring-1 ring-hairline sm:size-[4.5rem]"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl">{profile.name}</h1>
          {profile.headline && <p className="mt-2 text-fg-muted text-pretty">{profile.headline}</p>}
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
        {profile.location && (
          <li className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-fg-subtle" aria-hidden />
            {profile.location}
          </li>
        )}
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-0.5 transition-colors hover:text-accent"
            >
              {link.label}
              <ArrowUpRight
                className="size-3.5 text-fg-subtle transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-accent"
                aria-hidden
              />
            </a>
          </li>
        ))}
        {profile.email && (
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
            >
              <Mail className="size-3.5 text-fg-subtle" aria-hidden />
              Email
            </a>
          </li>
        )}
      </ul>
    </header>
  );
}

export function Intro({ text }: { text: string }) {
  const [lead, ...rest] = paragraphs(text);
  if (!lead) return null;

  return (
    <div className="space-y-5 text-pretty">
      <p className="font-serif text-2xl leading-snug text-fg italic sm:text-[1.65rem]">{lead}</p>
      {rest.map((p, i) => (
        <p key={i} className="text-[1.0625rem] leading-relaxed text-fg-muted">
          {p}
        </p>
      ))}
    </div>
  );
}
