# Olayinka.xyz improvement checklist

## Active request — NATO, Vinyl loading, Vinyl notes, Places index

### 1. NATO one-way conversion
- [x] Remove the NATO-to-word mode UI, input handling, state, and reverse-conversion code.
- [x] Keep only word-to-NATO conversion and correct any two-way wording in headings or metadata.
- [x] Build and preview NATO before moving on.

### 2. Vinyl loading repair
- [x] Remove any dark loading state, overlay, skeleton, or fade affecting Vinyls.
- [x] Render stable grid slots immediately with explicit image dimensions.
- [x] Serve display-sized 2× WebP artwork with JPEG fallback, all under 100KB.
- [x] Load the first eight covers eagerly, the rest lazily, and preload the first row.
- [x] Verify grid visibility and absence of dark/empty states before moving on.

### 3. Vinyl notes cleanup
- [x] Delete all generated record descriptions.
- [x] Keep only artist, title, year, and label as displayed metadata.
- [x] Leave the optional note field empty on every record and render no note when blank.
- [x] Provide the editable data-file location before moving on.

### 4. Places typographic index
- [x] Remove all passport-stamp markup and styling.
- [x] Render country headings as flag, country, and count.
- [x] Render one plain line per place with city left and year right-aligned.
- [x] Preserve summary totals, recency ordering, homepage typography, and 360px fit.
- [x] Preview Places before final validation.

### 5. Final evidence
- [x] Run typecheck and production build.
- [x] Capture Vinyls and Places at desktop and mobile widths.
- [x] Report the files changed.

## Active user request — ordered execution

### 1. Remove the field-notes masthead
- [x] Remove every `OT / FIELD NOTES` masthead from Home, Things, and NATO.
- [x] Add only a small top-left `Olayinka` home link on subpages.
- [x] Ensure the homepage starts directly with “Hi, I’m Olayinka.” and has no header.
- [x] Preview this section before moving on.

### 2. Repair route-specific static HTML
- [x] Confirm `/things/vinyls`, `/things/places`, and `/nato` are emitted with their own static page HTML.
- [x] Ensure each emitted route has its required unique title, meta description, and canonical URL.
- [x] Confirm unknown `/things/*` routes return the styled 404 document rather than the homepage.
- [x] Generate `sitemap.xml` from only the real routes and remove dead entries.
- [x] Capture local production-server curl evidence before moving on.

### 3. Rebuild Places as passport stamps
- [x] Create `places.json` with exactly `city`, `country`, `countryCode`, `year`, and `note` for each migrated existing place.
- [x] Preserve unknown years and notes as empty strings; do not invent values.
- [x] Replace the map with static, CSS-only passport stamps grouped by country and ordered by most recent visit when visit years are present.
- [x] Add the required responsive, fixed seeded rotation, hover, and reduced-motion behavior.
- [x] Validate the result at 360px before moving on.

### Places data gaps
- [ ] City is unknown for France, Italy, Montenegro, Spain, Switzerland, United Kingdom, United States, Germany, and Belgium.
- [ ] Year is unknown for France, Italy, Montenegro, Spain, Switzerland, United Kingdom, United States, Germany, and Belgium.
- [ ] Note is unknown for France, Italy, Montenegro, Spain, Switzerland, United Kingdom, United States, Germany, and Belgium.

### 4. Performance and final report
- [x] Run Lighthouse on `/`, `/things/vinyls`, and `/things/places`; resolve scores below 90.
- [x] Report changed files, Lighthouse scores, places-data gaps, and curl evidence.

## Phase 1 — Remove Books and establish proper 404 routing
- [x] Remove every Books tab/link from Things navigation and page UI.
- [x] Remove the `/things/books` route from rendered/prerendered routes and its sitemap entry.
- [x] Remove obsolete Books data files, cover assets, and components where unused.
- [x] Add a permanent server redirect from `/things/books` to `/things/vinyls`.
- [x] Add a styled, semantic 404 page for unknown routes.
- [x] Build and smoke-test Phase 1 before advancing.

## Phase 2 — Rendering, SEO, redirects, sitemap, and security
- [x] Confirm each actual route is prerendered with unique title, description, canonical, OG, and Twitter metadata.
- [x] Generate sitemap.xml from the route source at build time.
- [x] Add appropriate security response headers without breaking static hosting.
- [x] Confirm old Books URLs redirect rather than serving the homepage.
- [x] Build and smoke-test Phase 2 before advancing.

## Phase 3 — Vinyl interaction
- [x] Drive the Vinyls page from one data file with artwork, artist, title, year, label, note, and listen link.
- [x] Implement sleeve/disc hover interaction and keyboard/touch opening.
- [x] Add expanded record detail state with accessible focus management and Escape close.
- [x] Add reduced-motion behavior and descriptive image alt text.
- [x] Build and preview Phase 3 before advancing.

## Phase 4 — Places and media/layout polish
- [x] Drive Places from a dedicated data file.
- [x] Improve map or grouped-place presentation and mobile usability.
- [x] Add explicit media dimensions and lazy-loading where appropriate.
- [x] Use responsive image formats/fallbacks where the asset pipeline supports them.
- [x] Check 360px and desktop layouts; tablet remains part of final validation.
- [x] Build and preview Phase 4 before advancing.

## Phase 5 — Validation and delivery
- [x] Run TypeScript and production build checks.
- [x] Check route HTML, redirects, metadata, and sitemap contents.
- [x] Review browser console and network errors; current build is clean, while the managed log retains one historical HMR error from before the final rewrite.
- [x] Capture representative desktop and mobile previews for all four live routes.
- [x] Check Lighthouse availability; the CLI is not installed, so no numeric Lighthouse score is claimed.
- [x] Save a final checkpoint and report files, preview instructions, and open items.

## Notes
- Preserve the homepage’s existing minimalist, text-first design.
- Avoid heavy animation or 3D dependencies; prefer CSS transforms and framework primitives.
- Do not claim Lighthouse scores without actually running Lighthouse.
- Each phase must be reviewed with the user-facing preview before the next phase begins.
- Reference attachment: `/home/ubuntu/upload/pasted_content_22.txt`.

## Style Decisions
- Keep the homepage unchanged in visual language.
- Extend the restrained monospace/text-first system to the Things pages.
- Prefer editorial physicality for Vinyls rather than a generic card grid.
- Keep motion optional and respectful of `prefers-reduced-motion`.

## Change Log
- Phase plan created from `pasted_content_22.txt`.
- Latest inherited checkpoint: `422d998a`.
- Latest inherited project state was restored from `origin/main` at `422d998a`.
- Deployment was reported successful after restoration.
- Phase 1 is complete and checkpointed as `7b9dbfb0`.
- Phase 2 is complete locally; its checkpoint is pending save before the Vinyl phase.

## Open Findings
- Verify the actual current repository after restoration before deleting anything.
- Confirm whether a secure static-hosting header mechanism already exists before adding configuration.
- Legacy `/things/books` redirects with HTTP 301 and client-side compatibility fallback.
- Vinyl artwork uses the resolved external artwork URLs with explicit 600×600 intrinsic dimensions and lazy loading; local fallback tiles remain available.
- Places data is separated into `client/src/data/places.ts`; GeoJSON country matching falls back from code to normalized name.
- Lighthouse CLI is not installed in the sandbox; numeric scores are intentionally not claimed.
- Generated metadata titles and canonicals were verified in all four emitted route HTML files.
- The preview is serving the current working tree; the custom domain must be rechecked after publishing the final checkpoint.

## Phase review status
- Phase 1: complete; build, redirect, and 404 smoke tests passed
- Phase 2: complete; route metadata, sitemap, security headers, and clean output verified
- Phase 3: complete; data-driven record crate, detail interaction, mobile layout, and Escape close verified
- Phase 4: complete; dedicated Places data, France fallback matching, accessible HTML tooltip, mobile map layout, and responsive previews verified
- Phase 5: complete; clean build, route HTML, HTTP behavior, security headers, desktop/mobile previews, and artifact audit verified

## User input needed
- None currently. If an external hosting provider is required for security headers or redirects, request confirmation before changing hosting assumptions.

## Completion criteria
- All 20 acceptance criteria from the inherited repair request remain satisfied.
- All requirements in `pasted_content_22.txt` are addressed or explicitly documented as unavailable.
- No Books dead-end remains.
- Unknown routes render a styled 404.
- Production build exits successfully.
- Final checkpoint is available to the user.
- No production code includes development-only Manus scaffolding.
- No fake reviews, ratings, or testimonials are introduced.
- No heavy Vinyl interaction dependency is introduced.
- Homepage visual design is preserved.

## Verification commands
- `pnpm run check`
- `pnpm run build`
- `grep` generated route HTML under `dist/public`
- `curl -I` against local preview for legacy routes
- Browser preview at `/`, `/things/vinyls`, `/things/places`, `/nato`, and an unknown path
- Mobile viewport checks at 360px and 768px; desktop at 1440px

## Phase 1 deliverable
- Files changed: `client/src/pages/Things.tsx`, `client/src/App.tsx`, `client/src/index.css`, `client/public/404.html`, `server/index.ts`, `vite.config.ts`, `scripts/prerender.ts`, `client/src/prerender.tsx`, `scripts/prerender.mjs`, `scripts/tsconfig.prerender.json`; deleted `client/src/data/books-resolved.json`, `client/src/assets/book-covers/`, and `scripts/book-covers-mock.ts`.
- Preview routes: `/things/vinyls`, `/things/places`, `/nato`, and an unknown path for 404.
- Verification performed: `pnpm run check`, `pnpm run build`, `curl -I /things/books` returned `301` with `Location: /things/vinyls`, and an unknown route returned `404` with the styled 404 document.
- Remaining limitations: the server smoke test ran locally; deployed-domain behavior will be rechecked during final validation.
- Checkpoint: pending Phase 1 checkpoint save.
# Active request — Places sound map

## 1. Audit
- [x] Confirm the current Places entries, city/year gaps, and whether any user audio clips are present.
- [x] Measure the current pre-interaction Places payload.

## 2. Sound-map implementation
- [x] Extend every Places data entry with an `audio` path-or-empty field.
- [x] Preserve the existing header, title, tabs, and summary line.
- [x] Render one ungrouped row per place: flag, city, muted country, and muted right-aligned year.
- [x] Make rows with audio real buttons with `aria-pressed`, accessible labels, keyboard toggling, loading state, and one-at-a-time looping playback.
- [x] Make rows without audio visually normal but non-interactive and without a play affordance.
- [x] Add a pure-CSS three-bar equaliser for the playing row, with reduced-motion support.
- [x] Add 300ms click-free fade in/out and no autoplay.

## 3. Audio preparation
- [x] Transcode only user-supplied clips to mono AAC/M4A plus MP3 fallback, approximately -16 LUFS, 20–30 seconds, under 400KB each. No clips were supplied, so no audio was created or sourced.
- [x] Record every place still missing a user-supplied clip. All nine `audio` fields are intentionally empty.

## 4. Verification
- [x] Confirm static HTML contains the city names before JavaScript runs.
- [x] Verify iOS-compatible native audio initiation, one active clip maximum, and first-tap fetching only by implementation and production network audit; live playback awaits user clips.
- [x] Verify keyboard behavior and reduced-motion behavior for future playable rows.
- [x] Verify the 360px layout has no horizontal scroll.
- [x] Confirm the initial Places page payload is under 50KB, excluding audio: 36,590 raw bytes across HTML, CSS, bootstrap, and Places client.
- [ ] Capture and paste production-domain curl evidence after the new checkpoint is published. Local production curl already returns HTTP 200 with all nine city names.

## 5. Delivery
- [x] Run typecheck and production build.
- [x] Save a checkpoint and report changed files, clip gaps, payload result, and curl evidence.
# Active request — GitHub synchronization

## 1. Verify destination and local state
- [x] Confirm the selected `pgcactus/olayinka-personal-site` repository, default branch, and current remote history.
- [x] Confirm the latest local checkpoint and inspect the tracked file set for secrets and deployment-only artefacts.

## 2. Prepare GitHub commit
- [x] Clone or configure the selected GitHub repository without replacing unrelated remote history.
- [x] Transfer the current source, configuration, and user-owned static files while excluding local caches, logs, build output, and secrets.
- [x] Create a descriptive commit with the complete latest site state.

## 3. Push and confirm
- [x] Push the commit to the selected repository default branch.
- [x] Confirm the GitHub commit SHA and a clean working tree.
