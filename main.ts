// GTA 6 Trophy Guide & Tracker — entrypoint (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, a small set of
// ES modules, a stylesheet, and app/data/trophies.json with the 55 trophies,
// each with its official name, description and grade plus a guide written for
// this entry. It runs offline from any static server with app/ at its root.
//
// This program hands the entry in: it copies app/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there, the
// summary the judge reads, using the vendored make.fun library. Leave
// vendor/makefun-frontend.ts untouched — the scorer rebuilds the dossier with
// its own copy and requires the two to match byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps mirror the gate so a local run refuses what the scorer would refuse:
// at most 4 screenshots, each at most 256 KiB; app/ at most 993 files and
// directories and 48 MiB in all; the dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
