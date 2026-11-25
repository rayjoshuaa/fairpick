# Project UAES Compliance Record

**Application:** FairPick — the random student picker that's actually fair
**Repository:** https://github.com/rayjoshuaa/fairpick
**Owner:** Ray Joshua (Project Owner)
**UAES version adopted:** UAES-001 v1.0 (with UAES-UI-001 v1.0)
**Compliance level:** 1
**Status:** Approved — UAES adopted for all applications by the Project Owner, 2026-11-01

## Applicable standards

- [x] UAES-001
- [x] UAES-UI-001
- [x] UAES-DEP-001 — Cloudflare Pages Git integration: every push to `main` deploys automatically
- [x] UAES-SEC-001 — baseline: no accounts, no data collection, no secrets; names are rendered as React text (never injected as HTML) and all storage reads are guarded
- [x] UAES-TST-001 — Level 1: type-check + production build verification plus manual testing of success, invalid-input, and failure flows
- [x] UAES-AI-001 — developed by an AI assistant (Thatch) under Project Owner direction; no change is claimed verified without a check
- [ ] UAES-DB-001 — not applicable: no database. Class lists live in the teacher's own browser localStorage (keys `fairpick_draft`, `fairpick_state`, `fairpick_lists`)

## Project-specific stack

- Frontend: React 19 + Vite + TypeScript, Tailwind CSS v4, shadcn/ui (radix-nova, neutral) — the UAES-UI-001 recommended foundation, adopted for the whole Teacher Tools family at v3.0.0 following the ClassTimer+ rebuild. Web Audio API for the chime. (v1.0.0–v2.0.0 were a single self-contained `index.html` with vanilla JS; that build still lives in the sibling `fairpick/` project folder.)
- Backend: None
- Database: None (browser localStorage only)
- Hosting/deployment: Cloudflare Pages, project `fair-pick`, Git-connected to this repository (production branch `main`). For v3.0.0 the Pages build settings change from "no build command, output = repository root" (the v2.0.0 single-file setup) to build command `npm run build`, output `dist`. Live: https://fair-pick.pages.dev (the project name differs from the repo name because the plain `fairpick` subdomain was already taken on Cloudflare)
- Testing: `npm run build` (tsc type-check + Vite production build); manual flow tests (pick with spin on/off, round rollover, new round, save/load/delete lists incl. invalid attempts, sample class, clear, fullscreen, keyboard Space/N/F); accessibility review against WCAG 2.2 AA (contrast, focus visibility, touch targets, status never conveyed by colour alone, screen-reader announcements on state changes only)

## Exceptions

| Standard/rule | Reason | Impact | Alternative/control | Approval |
|---|---|---|---|---|
| UAES-001 §5, §20 — project `CLAUDE.md` and `.claude/rules/` | The project's developer is Thatch (Muse), not Claude Code, per Project Owner direction | The agent-guidance file is `docs/AGENTS.md` instead of `CLAUDE.md`, kept in `docs/` so the repository root stays focused on the app | `docs/AGENTS.md` carries the same role and content; the standards repository itself is never modified | Project Owner, 2026-11-01 |

## Authoritative project documents

- Requirements: `README.md` (this repository)
- Architecture: This record — static React application, no backend
- Decisions: The Exceptions table above
- Security: This record — no personal data is collected, stored, or transmitted; the build makes no network requests at runtime (the Geist font is self-hosted by the build)
- Deployment: Cloudflare Pages project `fair-pick`, Git-connected — pushes to `main` deploy automatically once the v3.0.0 build settings above are applied; the Deployments tab in Cloudflare is the release record, and rollback is available there per deployment
