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
- [x] UAES-SEC-001 — baseline: no accounts, no data collection, no secrets; names are rendered as text nodes only (never injected as HTML) and all storage reads are guarded
- [x] UAES-TST-001 — Level 1: JS syntax verification plus manual testing of success, invalid-input, and failure flows
- [x] UAES-AI-001 — developed by an AI assistant (Thatch) under Project Owner direction; no change is claimed verified without a check
- [ ] UAES-DB-001 — not applicable: no database. Class lists live in the teacher's own browser localStorage (keys `fairpick_draft`, `fairpick_state`, `fairpick_lists`)

## Project-specific stack

- Frontend: Single self-contained `index.html` — HTML, CSS, vanilla JavaScript, Web Audio API. No framework, no build step, no dependencies (per UAES-001 KISS; the React/Tailwind/shadcn foundation in UAES-UI-001 is a recommendation, expressly not a mandate for non-React projects)
- Backend: None
- Database: None (browser localStorage only)
- Hosting/deployment: Cloudflare Pages, project `fairpick`, Git-connected to this repository (production branch `main`, no build command, output = repository root). Live: https://fairpick.pages.dev
- Testing: `node --check` on the extracted script; manual flow tests (pick with spin on/off, round rollover, new round, save/load/delete lists incl. invalid attempts, sample class, clear, fullscreen, keyboard Space/N/F); accessibility review against WCAG 2.2 AA (contrast, focus visibility, 44px touch targets, status never conveyed by colour alone, screen-reader announcements on state changes only)

## Exceptions

| Standard/rule | Reason | Impact | Alternative/control | Approval |
|---|---|---|---|---|
| UAES-001 §5, §20 — project `CLAUDE.md` and `.claude/rules/` | The project's developer is Thatch (Muse), not Claude Code, per Project Owner direction | The agent-guidance file is `docs/AGENTS.md` instead of `CLAUDE.md`, kept in `docs/` so the repository root stays focused on the app | `docs/AGENTS.md` carries the same role and content; the standards repository itself is never modified | Project Owner, 2026-11-01 |

## Authoritative project documents

- Requirements: `README.md` (this repository)
- Architecture: This record — single-file application, no backend
- Decisions: The Exceptions table above
- Security: This record — no personal data is collected, stored, or transmitted; the only network requests are Google Fonts
- Deployment: Cloudflare Pages project `fairpick`, Git-connected — pushes to `main` deploy automatically; the Deployments tab in Cloudflare is the release record, and rollback is available there per deployment
