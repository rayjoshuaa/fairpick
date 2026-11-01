# FairPick

**The random student picker that's actually fair.**

Every teacher knows the moment: the "random" picker lands on the same confident kid for the third time while the quiet ones never get a turn. FairPick fixes that — it remembers who has been picked, so **nobody gets picked twice until everyone has had a turn**. Then a new round begins.

🔗 **Live:** https://fair-pick.pages.dev

## Why it's different

- **Fairness engine** — picks only from students who haven't had a turn this round; rounds tracked automatically
- **See who's still waiting** — the class board shows every name, ticked off as each student is picked
- **Save multiple class lists** — Year 5A, Year 6B, your club… named lists saved in the browser, no account
- **Big, projector-friendly reveal** — a quick name-spin animation that lands with a cheerful chime
- **Progress at a glance** — "7 of 24 picked · 17 still waiting" with a progress bar
- **No sign-up, no ads, works offline** — a single HTML file; your lists never leave your computer

## How teachers use it

1. Paste your class list (one name per line) — or tap *Try a sample class*
2. Save it under a name like "Year 5A" for next lesson
3. Press **Pick a student** whenever you need a volunteer, a reader, or a helper — it's always somebody who hasn't gone yet

Great for cold-calling fairly, choosing helpers, reading order, presentations, and classroom jobs.

Keyboard shortcuts: **Space** pick a student · **N** new round · **F** fullscreen.

## Tech

One self-contained `index.html` (HTML + CSS + vanilla JS + Web Audio API, `localStorage` for lists). No build step, no dependencies. Hosted on Cloudflare Pages, deployed automatically from this repository.

## Part of a teacher-tools family

Built by [Ray Joshua](https://rayjoshuaa-portfolio.pages.dev) — ICT & Robotics Educator, Bangkok. Sibling tools: ClassTimer+, GroupGrid, CalmMeter, TeamPoints and more.
