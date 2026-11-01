# AGENTS.md — FairPick

Guidance for Thatch (the developer of record) and any future agent working on this repository. This project follows **UAES-001 v1.0, Level 1** — see `PROJECT-COMPLIANCE.md` in the repository root. This file lives in `docs/` so the repository root stays clean and focused on the app itself. The UAES standards repository (rayjoshuaa/application-engineering-standards) is a read-only reference: never edit it.

## What this is

A single-file random student picker for the classroom screen with a fairness guarantee: nobody is picked twice until everyone has had a turn, then a new round starts automatically. Everything lives in `index.html` (HTML + CSS + vanilla JS). No build step, no dependencies — keep it that way (UAES KISS/YAGNI).

## Invariants — do not break

- Element IDs used by the script: `namesInput`, `chips`, `pickedName`, `roundLabel`, `progressLine`, `barFill`, `pickBtn`, `resetRoundBtn`, `fullBtn`, `soundToggle`, `animToggle`, `listName`, `saveListBtn`, `savedLists`, `loadListBtn`, `deleteListBtn`, `sampleBtn`, `clearBtn`, `srStatus`, `feedback`, `listFeedback`, `infoBtn`, `infoPanel`.
- localStorage keys: `fairpick_draft` (current list text), `fairpick_state` (`{picked, round}`), `fairpick_lists` (map of list name → list text). Existing teachers' saved lists must keep working across versions — never rename these keys.
- Fairness rule: the pick pool is always the names not yet picked this round. When the pool empties, picked resets and the round counter increments before the next pick. Names are de-duplicated case-insensitively when parsing the list.
- Safety: names are only ever rendered via `textContent` / element creation — never `innerHTML` with user text.
- Sound: spin ticks plus a two-note landing chime (659.25 / 880 Hz). Audio must be created/resumed inside a user gesture (`warmAudio()` is called from Pick).
- Screen-reader announcements go to `#srStatus` on state changes only (pick landed, round rollover, list saved/loaded/deleted) — never during the spin.
- Design tokens (this app's own, per UAES-UI-001): wine `#5c2438`, wine-deep `#451a2a`, gold `#c39a3f` (graphics) / `#9a742a` (text), teal `#256f66`, paper `#faf7f2`, ink `#262019`, muted `#75634f`, hairline `#e9dfd2`. Fonts: Outfit (display) + Inter (UI) via Google Fonts. Text colours must keep WCAG 2.2 AA contrast on paper/white; touch targets ≥ 44px; visible focus rings; `prefers-reduced-motion` respected (the JS spin is skipped too, not just CSS animation).
- Family style direction: **glassmorphism in the family palette** (Project Owner direction, 2026-11-01) — frosted-glass surfaces (translucent white, backdrop blur, bright borders, deep soft shadows) over soft gold/teal/wine glows that drift slowly on a `body::before` layer; controls stay chunky and pressable with a press-down motion. Calm and premium, never toy-like. How-to instructions live behind the ⓘ info button in the stage card's top-left corner (Fullscreen mirrors it, icon-only, top-right). Feedback lines are permanently reserved slots so state changes never move the layout. The eyebrow is "Teacher Tools" (no personal name in the header); the footer holds the settings toggles and the keyboard-shortcut reference on one row, with a formal copyright line — "© <year> Ray Joshua. All rights reserved.", his name linked to his portfolio — at the bottom-right. Tab title: idle "Teacher Tools: FairPick"; after a pick "FairPick | <name>". Picked names on the class board carry a tick and strikethrough — status is never colour alone.
- Keyboard: Space pick, N new round, F fullscreen — all inert while typing in an input/textarea/select, and Space never fires when a button has focus (it would double-trigger).

## Workflow

- Commit prefixes per UAES-001 §14: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Before calling anything done (UAES-001 §19): JS syntax check, test success + invalid + failure flows, check responsive behaviour and accessibility, update `CHANGELOG.md` and docs.
- Deployment: Cloudflare Pages is Git-connected to this repo — pushing to `main` deploys automatically. Commit first, verify the live site after the deploy, and record the release in `CHANGELOG.md`.
