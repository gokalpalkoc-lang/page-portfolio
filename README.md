# Portfolio

Taha Gökalp Alkoç's portfolio and project hub, at **https://devtga.com**.

One page: a short introduction, project cards that link to each site (Operon, Scout, …), achievement sections, and skills. Everything on it is edited at **/admin**. No code changes are needed to add a project or an achievement.

## Editing content

Open `/admin` and sign in with the admin password.

- **Profile:** name, headline, location, photo, public email, the introduction, and the links under your name.
- **Projects:** one card per project. Status is *Live*, *In development* or *Archived*. Leave the link empty until a project is public.
- **Achievements:** sections (Experience, Education, Honors & awards, …), each with entries. Add as many sections as you like.
- **Skills:** one per line.

Every entry has an eye button to **hide** it from the site without deleting it, and arrows to reorder. Nothing is published until you press **Save** (or Ctrl/Cmd+S). Saving checks every field first and lists anything that needs fixing.

Each save keeps the previous version in `history/` (the newest 30), so a bad edit can be rolled back by copying a history file over `content.json`.

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD (12+ chars) and SESSION_SECRET (32+ chars)
npm run dev                  # http://localhost:3000, admin at /admin
```

Until the first save, the page shows the starting content in [src/lib/content/seed.ts](src/lib/content/seed.ts). Saved content, history and uploaded images live in `DATA_DIR` (default `./.data`).

`npm run check` runs the typecheck, lint and tests.

## How it works

- Next.js (App Router), the same stack as Operon. The public page renders on each request from one JSON file, validated by the schema in [src/lib/content/schema.ts](src/lib/content/schema.ts).
- The admin is protected by a single password (`ADMIN_PASSWORD`) and a signed, HTTP-only session cookie (`SESSION_SECRET`) that lasts 7 days. Changing the password signs out every session. Sign-in is rate-limited: 5 failures per IP, or 30 in total, per 15 minutes.
- Uploaded images are checked by their content (PNG, JPEG, WebP, AVIF, GIF; no SVG), get random names, and are served from `/uploads/…`.
- Links accept only `http(s)` addresses.

## Deployment

Live at **https://devtga.com**, on the Hetzner server shared with Operon and Scout.

- `./scripts/deploy.sh` ships this folder (without `node_modules`, build output, local data or env files), then builds and restarts the container on the server. It needs the SSH key for `YZ@178.105.242.183`.
- **On the server:** `/opt/portfolio/app` holds the deployed code, and `/opt/portfolio/.env` holds the secrets (format in [deploy/.env.example](deploy/.env.example)). [deploy/docker-compose.yml](deploy/docker-compose.yml) runs the app with a named volume for `/data`, so deploys never touch edited content.
- **HTTPS:** scout's Caddy owns ports 80/443. The portfolio's site block ([deploy/Caddyfile.portfolio](deploy/Caddyfile.portfolio)) is appended to `/opt/scout/deploy/Caddyfile`, and the app joins scout's `deploy_default` network as `portfolio-app`.
