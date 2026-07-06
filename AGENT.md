# AGENT.md — Judotechnieken Quiz

Handoff document for AI agents and developers continuing work on this repository.
Read this before making changes.

---

## 1. Project summary

**What:** A Dutch-language quiz webapp for practising judo techniques from the
**Eerste Utrechtse Judo en Ju Jutsu School (EUJJJS)** syllabus.

**Repo:** https://github.com/GuusDubbink/judo (personal account — **not** telero)

**Current scope:** Quiz-only SPA. No backend, no auth, no database. All content
comes from a static JSON file at build time.

**UI language:** Dutch (`lang="nl"`). School name shown on setup screen.

**Design:** Light theme using club colours — sky blue `#00aeef`, white surfaces,
dark text `#1a1a1a`. Logo reference lives in `web/public/image.png` (colours only;
logo is not rendered in the app).

---

## 2. Repository layout

```
judo/
├── judotechnieken.json      # SOURCE OF TRUTH for the webapp
├── models.py                # Pydantic v2 validation + query helpers (Python)
├── pyproject.toml           # uv project (minimal; pydantic not yet in deps)
├── README.md                # Short human readme
├── AGENT.md                 # This file
├── archive/                 # One-time tooling; NOT used by the app
│   ├── Judotechnieken.docx
│   └── build_judo_json.py
├── .do/app.yaml             # DigitalOcean App Platform deploy spec
└── web/                     # React frontend (see §4)
```

**Untracked / not yet integrated:**
- `kodokan-techniques.json` — scraped Kodokan reference data (names, descriptions,
  YouTube links). **Not wired into the app.** Do not assume it exists in production.

---

## 3. Data: `judotechnieken.json`

### 3.1 How the webapp loads it

Vite alias `@data` → `../judotechnieken.json` (see `web/vite.config.ts`).
Imported once in `web/src/data/db.ts` as typed `JudoData`.

**Never copy the JSON into `web/src/`** — keep a single file at repo root.

### 3.2 Schema overview

| Section | Purpose |
|---------|---------|
| `meta` | School name, language, source doc, abbreviations |
| `belts` | `ge`…`zw` → Dutch colour names |
| `categories` | 8 categories (ashi_waza, koshi_waza, …) with `domain`, `jp`, `nl`, `en` |
| `techniques` | ~100+ techniques: `id`, `name`, `category`, `domain`, `belt`, `number`, `needs_review` |
| `counters` | Attack → counter pairs (`attack_id`, `counter_id`) |
| `combinations` | First → then pairs (`first_id`, `then_id`) |
| `glossary` | Japanese terms → Dutch meanings |
| `competition_terms` | Present in JSON; **not yet used in quiz** |

### 3.3 Belt order (important)

Cumulative filter — selecting a higher belt **includes all lower belts**:

```
geel (ge) → oranje (or) → groen (gr) → blauw (bl) → bruin (br) → zwart (zw)
```

Implemented in `web/src/lib/quiz-truth.ts` → `beltsUpTo()`.

### 3.4 Data quirks agents must know

- **Duplicate technique names** exist (e.g. two `"Hiza Gatame"` with different ids).
  Option builders dedupe by **name** when assembling multiple-choice options.
- **Multiple valid counters** per attack (e.g. O Soto Gari has 2, O Uchi Gari has 3).
  Counter questions must **not** list another valid counter as a distractor.
- **Some counters have `counter_id: null`** (e.g. Maki Komi) — skipped in quiz builder.
- **`needs_review: true`** marks suspected typos from source transcription; still in data.
- TypeScript types in `web/src/types.ts` mirror the JSON loosely; Python `models.py`
  is the stricter schema. **Keep them in sync** when changing JSON shape.

### 3.5 Python validation

```bash
uv run python models.py          # parse + print stats
uv run python models.py path.json
```

`models.py` checks duplicate ids, loads all sections, exposes `validate_refs()` for
broken counter/combination links. Add `pydantic` to `pyproject.toml` if running
validation (`uv add pydantic`).

`archive/build_judo_json.py` was the one-time docx→json pipeline. **Do not run or
move back to root** unless regenerating from source.

---

## 4. Web app architecture (`web/`)

### 4.1 Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Build | Vite 8 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Test | Vitest 4 |
| Lint | oxlint |
| Production serve | `serve` static on `$PORT` (DigitalOcean) |

### 4.2 Source structure

```
web/src/
├── main.tsx                 # React entry
├── App.tsx                  # Thin shell; delegates to useQuiz + components
├── index.css                # Tailwind theme tokens (club colours)
├── types.ts                 # Shared TS interfaces
├── data/
│   └── db.ts                # JSON singleton + techniqueById Map
├── hooks/
│   └── useQuiz.ts           # Quiz state machine (setup → quiz → results)
├── components/
│   ├── QuizSetup.tsx        # Filters + start button
│   ├── QuizQuestionView.tsx # Question UI + nav buttons
│   └── QuizResults.tsx      # Score screen
└── lib/
    ├── constants.ts         # OPTION_COUNT, labels, question counts
    ├── shuffle.ts           # shuffle + sample utilities
    ├── quiz-options.ts      # Shared MC option builders (dedupe names/meanings)
    ├── quiz.ts              # Question pool builder + public API
    ├── quiz-truth.ts        # Ground truth: which options are correct per JSON
    ├── quiz-validate.ts     # Structural validation for tests
    └── quiz.test.ts         # Correctness test suite (14 tests)
```

### 4.3 Module responsibilities (read before editing)

| Module | Responsibility | Do NOT |
|--------|----------------|--------|
| `quiz.ts` | Build `QuizQuestion[]` from filters | Embed scoring or validation logic |
| `quiz-truth.ts` | Answer correctness from JSON only | Import React or UI code |
| `quiz-validate.ts` | Detect errors + ambiguous questions | Be used in production UI |
| `quiz-options.ts` | Pick 4 unique options with deduping | Know about question types |
| `useQuiz.ts` | Screen state, answers, score | Build questions |
| `db.ts` | Single data load + indexes | Export builders |

### 4.4 Question types (all active)

| Type | Dutch label | Example |
|------|-------------|---------|
| `category` | categorie | “Welke categorie hoort bij O Soto Gari?” |
| `technique` | techniek | Category hint → pick technique name (distractors from **other** categories) |
| `domain` | domein | Staand vs grond for a named technique |
| `number` | nummer | “Welke techniek is nummer 3 bij beenworpen?” |
| `counter` | counter | Valid counter for attack (excludes other valid counters as distractors) |
| `combination` | combinatie | Valid follow-up technique (same exclusion rule) |
| `glossary` | woordenlijst | “Wat betekent Guruma?” |

**Removed intentionally:** belt questions (“bij welke band leer je…”) — not relevant
for this syllabus use case.

### 4.5 Quiz flow

```
Setup (QuizSetup)
  → user picks: belt | domain | question count (10/15/20)
  → createQuiz(filters) shuffles from buildQuestionPool() and slices to count

Quiz (QuizQuestionView)
  → user answers MC question
  → feedback via validIndices (green = JSON-correct, red = wrong selection)
  → Vorige / Volgende navigation; answers remembered per index
  → ← Start returns to setup (discards session)
  → last question: “Resultaat” → results screen

Results (QuizResults)
  → score = count of isAnswerCorrect() across answered questions
  → “Nog een keer” (same filters) | “Nieuwe selectie” (back to setup)
```

### 4.6 Scoring correctness (critical)

**Never score using `question.correctIndex` alone in UI.**

Always use `isAnswerCorrect(question, optionIndex, db)` from `quiz-truth.ts`.
The marked `correctIndex` is one valid answer; truth layer is authoritative.

Feedback highlights **all** `validIndices` green after answering.

---

## 5. Validation & testing

### 5.1 Why it exists

Multiple-choice questions can be **ambiguous** when JSON allows several correct
answers (especially counters/combinations). Tests ensure:

1. Marked correct option is valid per JSON
2. No other option is also valid (would be marked wrong unfairly)
3. Exactly 4 unique options
4. No structural errors

### 5.2 Running tests

```bash
cd web
npm test              # vitest run — MUST pass before merging quiz changes
npm run test:watch    # during development
npm run typecheck     # tsc -b (excludes *.test.ts from app build)
npm run build         # production build
```

### 5.3 Test coverage

`quiz.test.ts` validates `buildQuestionPool()` across:

- `belt`: all, ge, or, gr, bl, br, zw
- `domain`: all, nage_waza, ne_waza

Plus targeted tests for O Soto Gari / O Uchi Gari multi-counter behaviour.

**When adding a new question type:** extend `quiz-truth.ts`, `quiz-validate.ts`,
and `quiz.test.ts` together.

---

## 6. Development commands

```bash
# Frontend
cd web && npm install
npm run dev           # http://localhost:5174 (5173 avoided; strictPort: false)

# Python (optional)
uv sync               # if deps added
uv run python models.py

# Git remote
origin → https://github.com/GuusDubbink/judo.git
branch → master
```

---

## 7. Deployment (DigitalOcean App Platform)

Config: `.do/app.yaml`

- **Source dir:** `/web`
- **Build:** `npm ci && npm run build` → `web/dist/`
- **Run:** `npm start` → `serve -s dist` on `$PORT`
- **Region:** `ams`
- **Repo:** `GuusDubbink/judo`, branch `master`, deploy on push

Pattern follows [digitalocean/sample-react](https://github.com/digitalocean/sample-react)
(static build + `serve`).

---

## 8. Styling conventions

Theme tokens in `web/src/index.css` (`@theme` block):

- `--color-club-blue: #00aeef`
- `--color-club-blue-dark`, `-light`, `-soft`
- `--color-ink`, `--color-muted`, `--color-surface`, `--color-border`

Use Tailwind classes: `bg-club-blue`, `text-ink`, `border-border`, etc.

Mobile: `min-h-12` tap targets, `safe-area-inset` padding, responsive text sizes.
`viewport-fit=cover` in `index.html`.

---

## 9. Agent guidelines

### 9.1 Do

- Keep `judotechnieken.json` at repo root as single source of truth
- Run `npm test && npm run typecheck && npm run build` after quiz logic changes
- Match existing patterns: thin components, logic in `lib/`, state in hooks
- Write Dutch UI copy for user-facing strings
- Use `OPTION_COUNT` / `DISTRACTOR_COUNT` from `constants.ts` for MC questions
- Exclude other valid answers when building counter/combination distractors
- Dedupe technique **names** and glossary **meanings** in options
- Ask before committing (user preference) unless explicitly told to commit

### 9.2 Don't

- Add a database or backend unless explicitly requested
- Re-introduce belt quiz questions
- Fork external repos (vocab, etc.) — build in `web/`
- Duplicate JSON into `web/src/data/`
- Score answers with `correctIndex` only — use `isAnswerCorrect()`
- Commit `archive/` tooling changes without reason
- Create README/AGENT updates the user didn't ask for (except this file)
- Use port 5173 by default (often occupied; dev server uses 5174)

### 9.3 TypeScript notes

- `tsconfig.app.json` excludes `src/**/*.test.ts` from app compilation
- Vitest config: `web/vitest.config.ts` merges with `vite.config.ts` (keeps `@data` alias)
- `verbatimModuleSyntax: true` — use `import type` for type-only imports

---

## 10. Known limitations & future ideas

Discussed with user but **not implemented:**

| Idea | Notes |
|------|-------|
| Flashcard mode | Self-rate; different UI |
| Competition terms quiz | Data exists in JSON |
| `kodokan-techniques.json` integration | Descriptions + YouTube links |
| Generate TS types from `models.py` | Manual sync works for now |
| `correctIndex` removal | Redundant with truth layer; kept for simplicity |
| Memoize `buildQuestionPool()` | Fine at current dataset size |
| Separate quiz modes UI | Counter-only, glossary-only, etc. |
| localStorage progress | Mentioned early on; not built |

---

## 11. Commit history (context)

```
8d5ec76 Refactor web app structure for maintainability and clarity
af281bf Add quiz validation suite against JSON ground truth
e9f29ad Expand quiz with syllabus and vocabulary questions, lighter UI polish
aeddf00 Add React quiz webapp with club styling and DigitalOcean deploy config
62d87a5 Initial commit: judo techniques data and Python models
```

---

## 12. Quick checklist for common tasks

### Add a new question type

1. Add to `QuestionType` in `types.ts`
2. Add label in `constants.ts` → `QUESTION_TYPE_LABELS`
3. Builder function in `quiz.ts` + register in `buildQuestionPool()`
4. Truth case in `quiz-truth.ts` → `getValidOptionIndices()`
5. Tests in `quiz.test.ts` — include ambiguity checks
6. `npm test && npm run typecheck && npm run build`

### Change JSON data

1. Edit `judotechnieken.json`
2. Validate: `uv run python models.py` (with pydantic installed)
3. `cd web && npm test` — will catch broken/ambiguous questions
4. Fix builders if tests fail

### Change UI only

1. Edit components in `web/src/components/`
2. `npm run typecheck && npm run build`
3. Tests usually still pass unchanged

---

## 13. Contact / ownership

- **GitHub:** GuusDubbink (personal)
- **School data:** Eerste Utrechtse Judo en Ju Jutsu School
- **Primary language:** Dutch (NL)

When in doubt, prefer **correctness over features** — run the test suite.

---

## 14. Mobile apps (Capacitor — iOS & Android)

The same web app ships to the App Store and Google Play via
**[Capacitor](https://capacitorjs.com)**. Capacitor wraps the existing
`web/dist` build in a native WKWebView (iOS) / WebView (Android) shell — **no UI
rewrite, no separate codebase.** The DigitalOcean webapp is unaffected: mobile
only adds files and reuses `npm run build`.

### 14.1 Layout (inside `web/`)

```
web/
├── capacitor.config.ts      # appId nl.judotechnieken.app, appName "Judo Quiz", webDir: dist
├── ios/                     # committed Xcode project (SPM-based, Capacitor 8)
├── android/                 # committed Gradle project
├── resources/               # icon.svg / splash.svg placeholders + how to generate
└── src/lib/native.ts        # status bar + splash + Android back button (no-op on web)
```

`ios/` and `android/` sources are **committed**; their build output (Pods,
`build/`, `.gradle/`, DerivedData, copied `public/`) is git-ignored by the
per-platform `.gitignore` files. Signing secrets (`*.keystore`, `*.jks`,
`key.properties`) are git-ignored — **never commit them**.

### 14.2 Native integration — `src/lib/native.ts`

Everything is guarded by `Capacitor.isNativePlatform()`, so the web build and
Vitest are unaffected. It: colours the status bar club-blue, hides the splash
once React mounts (`initNativeShell()` in `main.tsx`), and maps the Android
hardware back button onto the quiz's own navigation (`useAndroidBackButton()` in
`App.tsx`) and opens external URLs in the system in-app browser
(`openExternalUrl()`). Plugins: `@capacitor/status-bar`,
`@capacitor/splash-screen`, `@capacitor/app`, `@capacitor/browser`.

**YouTube video (iOS inline — solved in v0.1.5):** YouTube rejects embeds from the
app's own `localhost`/custom-scheme origin (error 153); `iosScheme:https`, a
bundled localhost proxy, and the `@capgo` native player all failed. The fix:
serve the embed from a **real https origin**. On native, `TechniqueInfoSheet`
loads the video inline from `${VIDEO_PROXY_ORIGIN}/youtube?v=<id>` — the
`web/public/youtube.html` proxy hosted on the DigitalOcean deployment
(`judo-app-i4wta.ondigitalocean.app`), the same origin where the web inline embed
works. Use the **clean `/youtube?v=`** URL, not `.html` (`serve` 301-redirects it
and drops the query). The proxy uses the YouTube IFrame API and, on a player
error, `postMessage`s the app to fall back to the in-app browser
(`@capacitor/browser`). The web build embeds YouTube directly (gated on
`isNativePlatform()`). See §14.7 for the domain caveat.

### 14.3 Commands (from `web/`)

```bash
npm run cap:sync            # build + copy web assets into both native projects
npm run cap:android         # build + sync + open Android Studio
npm run cap:ios             # build + sync + open Xcode (macOS only)
npx cap run android --livereload --external   # live reload against the dev server
npm run cap:assets          # regenerate icons/splash from resources/ (needs @capacitor/assets)
```

Building/running iOS **locally** needs macOS + Xcode (the maintainer has neither).
That's fine — the **release path is Codemagic's cloud Macs**, so iOS ships without
a Mac (see §14.6). Android likewise builds in CI. After any web change destined
for a device, run `npm run cap:sync` (plain `npm run dev` alone does not update a
bundled build). `cap sync` on **Windows** mangles
`web/ios/App/CapApp-SPM/Package.swift` with backslash paths — convert them back to
forward slashes before committing.

### 14.4 Store release

App icons live in `web/resources/` (`icon.svg` full-bleed, `icon-foreground.svg`
for the Android adaptive layer, `splash.svg`) — a judo belt-knot on a blue
gradient; all platform sizes were generated with `sharp` (installed `--no-save`
so it never touches `package.json`). Signing/versioning/upload + pre-submit
checklist: `store/RELEASE.md`. Listing copy + privacy policy: `store/`. The app
collects **no personal data** → "no data collected" in both stores' privacy
questionnaires. (The technique videos link out to YouTube — see §14.2/§14.7.)

**CI (`codemagic.yaml`, repo root):** cloud-builds both platforms and publishes
to TestFlight + Play — **no Mac needed**. iOS builds via `--project App.xcodeproj`
(SPM, no CocoaPods) and needs the **committed shared** scheme at
`web/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` (CI can't share it
via Xcode). iOS signing is the manual `app-store-connect fetch-signing-files
--create --certificate-key=@env:CERTIFICATE_PRIVATE_KEY` recipe (the declarative
`ios_signing` block does NOT create profiles). The **step-by-step release flow is
§14.6.** Android signing/versioning is wired in `android/app/build.gradle` (reads
`CM_KEYSTORE_*` env or `key.properties`, and `-PversionCode`/`-PversionName`), but
its release tag-trigger is disabled until its secrets exist. Setup/secrets:
`store/RELEASE.md`.

### 14.5 Don't

- Hardcode `server.url` in `capacitor.config.ts` — production must bundle local
  `dist`; use the `--livereload` CLI flag for dev instead.
- Call native plugin methods without the `isNativePlatform()` guard (breaks web).
- Commit keystores or `key.properties`.
- Change `appId` after the first store submission (it's permanent per listing).
- Embed YouTube inline on native expecting it to work (iOS error 153 — see §14.2).
- Assume a `v*` tag auto-builds — Codemagic tag-triggering is **not** enabled in
  the UI; trigger explicitly (§14.6).

### 14.6 Shipping a new iOS version via Codemagic (the live workflow)

No Mac involved. Codemagic app `_id` `6a490243659bdcc85c8cd1ac` (name "judo").

1. **Branch** off `master` (`fix/*` or `feat/*`) and make the change.
2. **Bump the version** in `web/package.json` → becomes the iOS marketing version
   `CFBundleShortVersionString`. The build number is Codemagic's auto-incrementing
   `$BUILD_NUMBER`.
3. **Gate:** `cd web && npm run typecheck && npm test && npm run lint && npm run build`.
4. **If native deps/config changed:** `npx cap sync`, then fix the backslash paths
   in `web/ios/App/CapApp-SPM/Package.swift` (Windows mangle) before committing.
5. **PR + merge** with the **GitHub CLI** (`gh` is authenticated here):
   `gh pr create --base master …` → `gh pr merge <branch> --merge --delete-branch`.
   Merging to `master` also fires the harmless DigitalOcean web redeploy.
6. **Tag** on master: `git tag -a vX.Y.Z -m "…" && git push origin vX.Y.Z`.
7. **Trigger the iOS build explicitly** (tag auto-trigger is off) — either:
   - **Codemagic MCP** (configured, user scope): `mcp__codemagic__trigger_build`
     with `workflow_id: ios`, `tag: vX.Y.Z` (default app id is preset).
   - **REST API:** `POST https://api.codemagic.io/builds`
     `{ "appId": "6a490243659bdcc85c8cd1ac", "workflowId": "ios", "tag": "vX.Y.Z" }`,
     header `x-auth-token: <CODEMAGIC_API_KEY from repo-root .env>`.
8. **Watch it** — `mcp__codemagic__get_build` / `get_step_logs`, or poll
   `GET /builds/{id}` (step logs at `GET /builds/{id}/step/{stepId}`). ~5–8 min →
   publishes to TestFlight; then it processes in App Store Connect (~mins) and is
   installable via the TestFlight app.

**Tooling for agents:** `gh` CLI (PRs/merges/issues); **Codemagic MCP**
(`mcp__codemagic__*` — builds, logs, artifacts, variables); Codemagic **REST API**
(token in repo-root `.env`, header `x-auth-token`) as the fallback when the MCP
isn't loaded.

**Signing (working — don't touch unless renewing certs):** `CERTIFICATE_PRIVATE_KEY`
is a secure Codemagic var in group `appstore_signing` (RSA PEM; local backup at
git-ignored `codemagic-certificate-key.txt`). App Store Connect API-key integration
is named `codemagic`. Export compliance is pre-answered via
`ITSAppUsesNonExemptEncryption=false` in `Info.plist`.

**Android:** the `android` workflow exists but its `<<: *release_trigger` is
removed until its secrets are set (keystore `judoquiz_keystore` + env group
`google_play`). Trigger manually, or re-add the trigger once configured.

### 14.7 Inline video — the domain caveat

Inline video works (v0.1.5) via the DO-domain proxy (§14.2). The one caveat:
`VIDEO_PROXY_ORIGIN` in `TechniqueInfoSheet.tsx` is hardcoded to
`https://judo-app-i4wta.ondigitalocean.app`. If that DigitalOcean URL ever changes
(e.g. moving to a custom domain), update that constant — otherwise native video
silently falls back to the in-app browser. A custom domain would make it stable.
