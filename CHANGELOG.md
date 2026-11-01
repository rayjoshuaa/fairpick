# Changelog

All notable changes to FairPick are recorded here. Versions follow the releases of the single-file app.

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
