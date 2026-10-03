# Working on this repo

Notes for coding agents (Codex, Claude Code and others) picking up work on
olayinka.xyz. Read this before changing anything.

## What this is

Olayinka Titilola's personal site. React 19, TypeScript, Vite, wouter for
routing and a small Express server. Pages are prerendered (`scripts/prerender.ts`)
and then hydrated.

- `/` home: a one-screen intro. A line drawing sits above the title, and the
  highlighted phrases in the copy change the drawing.
- `/nato`: NATO phonetic alphabet speller.
- `/things/vinyls`: the record wall.
- Anything else: the 404 page, with its own drawing.

`/things/books` and `/things/places` are retired and redirect (308) to
`/things/vinyls`. Their code and data were removed; git history has them.

## How it ships

The owner deploys with Manus, which syncs from `main` on GitHub and
republishes. Merging to `main` is effectively releasing. Work happens on a
branch, goes up as a PR, and is merged only when the owner says so.

## Commands

Use pnpm (see `package.json` for the pinned version).

```bash
pnpm dev            # local dev server
pnpm lint           # ESLint, including react-hooks rules
pnpm format:check   # Prettier
pnpm check          # tsc --noEmit
pnpm test           # vitest + jsdom
pnpm build          # client to dist/public, server to dist/index.js
pnpm test:build     # validates the built HTML, routes, 404s and headers
```

CI (`verify`) runs all of these plus `pnpm audit`. Run them all before pushing.

## Design system

Everything takes its colours and fonts from tokens on `:root` in
`client/src/index.css`. Don't hard-code colours in page CSS.

- `--paper` `#56628f` and `--paper-deep` `#3c4670`: the slate background.
- `--ink` `#f6f6fb`: text. `--muted`: grey text at 86% ink. It's set that
  high so small labels pass 4.5:1 on the lightest background.
- `--accent` `#ffe39a`: links and highlights. `--danger`: error text.
- `--card`, `--panel`, `--pill`, `--line`: surfaces and borders.
- One palette only: there is no light or dark mode.
- Fonts: `--hand` (Gochi Hand) for page titles, home copy, NATO card words and
  the vinyl panel title; `--sans` (Geist) for body; `--font-mono` (Geist Mono)
  for labels and buttons. Three families only.

Shared pieces live in `client/src/site.css`: the page shell, the fixed
header and the round header buttons (`.site-round`). Every page uses the same
header: round home, LinkedIn and language buttons (`components/SiteHeader.tsx`;
home has its own header with the same buttons).

## The drawing (`client/src/lib/line-scene.ts`)

- One continuous canvas line, resampled to N points, morphs point by point
  between subjects (notebook at rest, Flatiron building, walkie-talkie,
  records, plants, plane, tennis, run, torn notebook for the 404).
- Each subject is auto-centred and scaled to fit its frame (`size` sets
  relative size). There are no hand-placed offsets: don't add any, as they
  were the cause of a cross-device alignment bug.
- The canvas sits in a fixed frame above the title, never behind the words.
- The line colours `INK.cream` and `INK.yellow` match `--ink` and `--accent`.
- It pauses when off-screen or in a hidden tab, runs at half rate once
  settled and respects reduced motion. jsdom has no canvas, so in tests it is
  a no-op.

## Language

English and French throughout. `client/src/lib/lang.ts` is a
`useSyncExternalStore` store (server snapshot `"en"`, saved in localStorage
under `lang`). Every page keeps its copy in a `STRINGS` or `COPY` object with
`en` and `fr`. Add both whenever you add copy. French uses a narrow
no-break space before `:`. The French has not had a native-speaker review.

## How we've been working

- **Prototype, then build.** For bigger visual changes, mock it up first and
  get the owner's reaction, then implement.
- **Check in a real browser at many sizes.** After each change, screenshot
  with Playwright at 1920×1080, 1440×900, 1366×768, 1280×720, 768×1024,
  390×844, 375×667 and 320×568, in English and French. Look at the
  screenshots. Many bugs here were only visible this way (cards overlapping
  the header, pages scrolling, drawings landing in odd places).
- **Nothing should move on hover.** Cards float in a reserved space above the
  drawing, so opening one never shifts the page. Keep it that way.
- **Phones:** don't auto-focus inputs on touch (it raises the keyboard). Keep
  input text at 16px or more (iOS zooms below that).
- **Accessibility:** run axe-core (WCAG 2.2 AA) on every page after changes.
  Keyboard must work: Tab reaches every phrase, Enter opens a card, Escape
  closes it and returns focus. Cards opened by hover stay open while the
  mouse is on them. Targets are 24px or more. Remember that axe can't measure
  contrast on gradients, so check new text colours by hand.
- **Small, explained commits.** Commit messages say what changed and why.
  One PR per round of feedback.
- **Writing style for copy and docs:** British English, no em dashes, plain
  and short.

## Gotchas

- If the app crashes, `components/ErrorBoundary.tsx` shows a calm page in the
  site's style. Never render error details or stack traces to visitors.
- The CSP is `script-src 'self'`, so no inline scripts.
  `public/lang-init.js` is external for that reason.
- Album covers come from Apple's mzstatic CDN, resolved at build time into
  `client/src/data/vinyls-resolved.json`. Favourite tracks and notes live in
  `client/src/data/vinyls.ts`.
- Anything random or time-based (the "now listening to" footer) must be set
  after hydration in an effect, or prerendered HTML won't match.
- The home layout uses `min-height: 100dvh`. Grid `fr` rows with an
  indefinite height made pages overflow, which is why spacing uses `calc`
  on `100vh` instead.

## Open items

- Favourite tracks for _For Broken Ears_, _African Giant_, _Lungu Boy_ and
  _Let God Sort Em Out_ were removed because the ones on file were not on
  those albums. Add the owner's real picks in `client/src/data/vinyls.ts`
  (each must be a track on that album).
- "plants", "skydive", "tennis" and "5K" change the drawing but have no card,
  so they are out of the tab order. If the owner supplies a fact for each,
  give them one-line cards like Flatiron's (English and French) and add them
  to `WITH_PANEL` in `client/src/pages/Home.tsx`.
- Not yet tested on a real iPhone or with a screen reader (VoiceOver/NVDA).
