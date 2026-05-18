# Link Page

A self-hosted, config-driven alternative to Linktree / Beacons.ai. Single-page, mobile-first, no backend — can be deployed anywhere static files are hosted (GitHub Pages, Netlify, etc.).

## Run & Operate

- `pnpm --filter @workspace/linkpage run dev` — start the link page dev server
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, not used by link page)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Link page: Pure HTML + Tailwind CSS (CDN) + Vanilla JS — zero build step required
- Dev server: Vite (just for the preview workflow; not needed for GitHub Pages hosting)

## Where things live

- `artifacts/linkpage/index.html` — the single HTML file (layout, CDN imports)
- `artifacts/linkpage/script.js` — all rendering logic (fetch config → render)
- `artifacts/linkpage/config.json` — **edit this file to customise your page**
- All files live at the artifact root — no `public/` subdirectory

## Architecture decisions

- **Zero build step for end users** — Tailwind via Play CDN and FontAwesome via CDN mean the three output files (index.html, script.js, config.json) work directly on GitHub Pages with no npm/build required.
- **Config-driven rendering** — script.js fetches config.json on load and dynamically builds the entire page, so users never touch HTML or JS.
- **YouTube uploads playlist trick** — the Channel ID's `UC` prefix is replaced with `UU` at runtime to target the uploads playlist, so the latest video always appears automatically.
- **Twitch parent auto-detection** — `window.location.hostname` is always added to the Twitch parent list, so the embed works in Replit preview, GitHub Pages, and any custom domain without manual config changes.

## Product

- Profile card: circular avatar, username, bio
- Configurable link buttons: icon (Font Awesome), title, custom bg/text colors, hover animations
- YouTube embed: always shows latest video via uploads-playlist trick (no manual video ID)
- Twitch embed: official interactive player that shows offline banner when not live
- All content controlled via a single `config.json` file

## Deploying to GitHub Pages

1. Copy `index.html`, `public/script.js`, and `public/config.json` to your GitHub Pages repo root (put script.js and config.json in the same folder as index.html, or adjust the `./script.js` / `./config.json` paths).
2. Update `config.json` with your real profile, links, and streaming IDs.
3. For Twitch embeds, set `streaming.twitch.parent` to your GitHub Pages domain (e.g. `username.github.io`).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Tailwind Play CDN logs a warning in the console about production use — this is cosmetic only; the page works fine. For a fully production build, swap in the Tailwind CLI or PostCSS build.
- The Twitch embed requires the `parent` domain to match the page's hostname. The script always adds `window.location.hostname` automatically, but you still need to add your GitHub Pages domain to `streaming.twitch.parent` for it to work there.
- YouTube Channel IDs must start with `UC`. If yours starts with `@`, look up your Channel ID in YouTube Studio → Settings → Channel → Basic Info.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
