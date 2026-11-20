# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/miuoas47-gif/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/miuoas47-gif/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Build the best GTA 6 trophy guide: an offline, open-source tracker for all 55 GTA 6 PlayStation 5 trophies, with a roadmap to the platinum and cited guides. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## What it is

An offline static web app (`app/`) that guides and tracks all 55 Grand Theft Auto VI trophies on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, no online trophies. Each trophy shows its official name, description and grade, plus a guide written in our own words with its sources named beside it (PowerPyx, Push Square, Insider Gaming, KeenGamer and others). Where a step could not yet be verified in a published guide, the guide says so honestly.

Features:

- **Checklist tracker** — tick trophies off; progress is saved in localStorage, and can be exported to a JSON file and imported back.
- **Filters** — by grade, by kind (story, strangers & side, collectibles, activities, miscellaneous), by earned state, missable-only, and free-text search.
- **Spoiler setting** — hidden trophies stay concealed (name and description) until earned.
- **Roadmap to the platinum** — three stages (story 60–80h, 100% completion ~100h, strangers & cleanup ~10h) built from the official descriptions, with the trophies of each stage.
- **Missables page** — the one possibly-missable trophy (Positive Mental Attitude, Chapter 1 meditation) flagged with its timing warning, plus the timing cautions that are not missables.
- **Offline** — no build step, no network requests at runtime, no external fonts or images.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static HTTP server.

To build the hand-in output (copies `app/` and `screenshots/` and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — the single page.
- `app/app.js` — bootstrap: loads the data, routes, wires the controls.
- `app/tracker.js` — earned set, localStorage, export/import, screenshot seed.
- `app/filters.js` — filter state and matching, including the spoiler rule.
- `app/views.js` — checklist, trophy detail, roadmap and missables rendering.
- `app/data/trophies.json` — the 55 trophies and the roadmap stages.
- `main.ts` — entrypoint: copies the app and screenshots to the output dir and writes `dossier.json`.
- `screenshots/` — real renders of the app in a headless browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=6gvkzysc&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
