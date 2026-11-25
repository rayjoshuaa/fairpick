# Changelog

## v3.0.1 — wider layout, congestion fixed

- The app now uses 90% of the window width instead of the old
  max-w-4xl cap, so the two panels have room to breathe.
- Smaller picked-name display box, tighter panel padding, and the
  panel descriptions hide on short screens — the class-list panel no
  longer squeezes the textarea or spills over the switches row.
- No behaviour changes.

## v3.0.0 — shadcn/ui rebuild (ClassTimer+ design)

- Full rebuild from the single-file vanilla app to React + Vite +
  TypeScript with shadcn/ui components only, following the design of
  ClassTimer+ v2.1.5 — the first app and Ray's settled design reference
  for the Teacher Tools family.
- Design: neutral shadcn theme with Geist; one fixed screen (no page
  scrolling) with the card filling the viewport height; "Teacher Tools"
  badge, app title and one-line description header (descriptions hide on
  short screens); bold section titles; fixed-width action buttons;
  feedback in reserved-height lines so state changes never move the
  layout; the name chips scroll inside their own panel.
- The burgundy/gold glassmorphism of v2.0.0 is gone. The favicon is now
  the black & white Teacher Tools `shuffle` icon (`public/icon.svg`);
  there is no brand mark on the page.
- Behaviour is unchanged from v2.0.0: same fairness engine (no repeats
  until everyone has had a turn, automatic new round, New round resets
  to Round 1), same name parsing (trim, drop blanks, case-insensitive
  de-duplication), same spin timings and landing chime (659.25 / 880 Hz),
  same feedback-instead-of-silence messages with focus moves, same
  keyboard shortcuts (Space / N / F with the same guards), same
  screen-reader announcement scope, same tab-title behaviour.
- Data is unchanged: the same localStorage keys with the same shapes —
  `fairpick_draft` (raw list text), `fairpick_state`
  (`{ picked, round }`), `fairpick_lists` (map of list name to list
  text) — so lists and state saved by v1/v2 carry over untouched.
- The saved-lists chooser is now the shadcn Select instead of a native
  `<select>`; the how-to panel is now a Dialog instead of a popover
  panel. Everything else maps one-to-one.

## [2.0.0] — 2026-11-01

Full rebuild to the Teacher Tools family standard (UAES-001 Level 1 revision; design language shared with ClassTimer+):

- **Glass family design:** frosted-glass stage card and panels over soft gold/teal/wine glows, Outfit + Inter type, wine/gold tokens, tactile press-down controls — replacing the original flat styling and system font.
- **Layout:** "Teacher Tools" eyebrow header; ⓘ how-to panel in the stage card's top-left corner and icon-only Fullscreen top-right (mirroring ClassTimer+); round pill above the picked name; settings toggles and keyboard shortcuts share the footer row; formal copyright line at the bottom-right.
- **Accessibility (WCAG 2.2 AA pass):** screen-reader announcements on picks, round changes and list actions only (never during the spin); visible focus rings; 44px touch targets; picked names are marked with a tick and strikethrough, not colour alone; the spin animation is skipped under `prefers-reduced-motion`.
- **Audio reliability:** the AudioContext is created/resumed inside the Pick gesture, so the chime and spin ticks sound reliably in every browser.
- **Feedback instead of silence:** invalid actions now explain themselves in reserved feedback lines (picking with no names, saving without a list name, loading/deleting with no list chosen) and move focus to the field that needs attention — no layout shift, the slots are always reserved.
- **Keyboard shortcuts:** Space picks a student, N starts a new round, F toggles fullscreen (never while typing in a field, and Space never double-fires from a focused button).
- **Tab title:** shows the picked student's name ("FairPick | Amara") after a pick.
- Features and data are unchanged: same fairness engine, same localStorage keys (`fairpick_draft`, `fairpick_state`, `fairpick_lists`), so lists saved in v1 carry over.

## [1.0.0] — 2026-11-01

- Initial release: no-repeat fairness engine with automatic rounds, name-spin reveal with sound, waiting/picked class board with progress bar, paste-a-list editor with case-insensitive de-duplication, named saved lists, sample class, fullscreen mode. Single self-contained `index.html`, data in browser localStorage only.
