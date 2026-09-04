/**
 * Build-time script: resolve Apple Music cover URLs for all vinyls.
 * Run with: node scripts/resolve-vinyl-covers.mjs
 * Outputs: client/src/data/vinyls-resolved.json
 *
 * Behaviour:
 *  - If vinyls-resolved.json already exists AND contains all current album IDs,
 *    the script exits immediately (no network calls). This makes CI/deployment
 *    builds fast even when outbound internet is unavailable.
 *  - Each iTunes API request has a 5-second AbortController timeout so a
 *    blocked network fails quickly instead of hanging indefinitely.
 *  - Run `node scripts/resolve-vinyl-covers.mjs --force` to refresh covers.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORCE = process.argv.includes("--force");
const FETCH_TIMEOUT_MS = 5000; // 5 s per request

const VINYLS = [
  { id: "for-broken-ears",     title: "For Broken Ears",                     artist: "Tems",           year: 2020, appleMusicId: "1532252592" },
  { id: "untitled-unmastered", title: "untitled unmastered.",                artist: "Kendrick Lamar", year: 2016, appleMusicId: "1440844834" },
  { id: "gnx",                 title: "GNX",                                artist: "Kendrick Lamar", year: 2024, appleMusicId: "1781270319" },
  { id: "iyrtitl",             title: "If You're Reading This It's Too Late", artist: "Drake",          year: 2015, appleMusicId: "1440839718" },
  { id: "african-giant",       title: "African Giant",                       artist: "Burna Boy",      year: 2019, appleMusicId: "1471446047" },
  { id: "i-told-them",         title: "I Told Them",                         artist: "Burna Boy",      year: 2023, appleMusicId: "1699611123" },
  { id: "lungu-boy",           title: "Lungu Boy",                           artist: "Asake",          year: 2024, appleMusicId: "1760853689" },
  { id: "wattba",              title: "What a Time to Be Alive",             artist: "Future & Drake", year: 2015, appleMusicId: "1440842320" },
  { id: "the-blueprint",       title: "The Blueprint",                       artist: "Jay-Z",          year: 2001, appleMusicId: "1440757381" },
  { id: "let-god-sort-em-out", title: "Let God Sort Em Out",                 artist: "Clipse",         year: 2025, appleMusicId: "1816313639" },
  { id: "mbdtf",               title: "My Beautiful Dark Twisted Fantasy",   artist: "Kanye West",     year: 2010, appleMusicId: "1440621197" },
];

const outDir  = join(__dirname, "../client/src/data");
const outPath = join(outDir, "vinyls-resolved.json");

// ---------------------------------------------------------------------------
// Skip-if-up-to-date guard
// ---------------------------------------------------------------------------
if (!FORCE && existsSync(outPath)) {
  try {
    const existing = JSON.parse(readFileSync(outPath, "utf8"));
    const existingIds = new Set(existing.map((v) => v.id));
    const allPresent = VINYLS.every((v) => existingIds.has(v.id));
    if (allPresent && existing.length === VINYLS.length) {
      console.log(
        "vinyls-resolved.json is up to date — skipping Apple Music fetch.\n" +
        "(Run with --force to refresh cover URLs.)"
      );
      process.exit(0);
    }
  } catch {
    // Corrupt JSON — fall through and regenerate
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
async function fetchCoverUrl(appleMusicId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${appleMusicId}&country=gb`,
      { signal: controller.signal }
    );
    const data = await res.json();
    if (data.results?.length > 0 && data.results[0].artworkUrl100) {
      return data.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
    }
    return null;
  } catch (e) {
    const reason = e.name === "AbortError" ? "timed out" : e.message;
    console.error(`  Failed to fetch cover for ${appleMusicId}: ${reason}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Resolving vinyl covers from Apple Music...");

  const resolved = [];
  for (const vinyl of VINYLS) {
    process.stdout.write(`  ${vinyl.artist} - ${vinyl.title} (${vinyl.appleMusicId})... `);
    const coverUrl = await fetchCoverUrl(vinyl.appleMusicId);
    console.log(coverUrl ? "OK" : "FAILED (will use fallback tile)");
    resolved.push({
      id:       vinyl.id,
      title:    vinyl.title,
      artist:   vinyl.artist,
      year:     vinyl.year,
      coverUrl: coverUrl ?? null,
    });
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(resolved, null, 2) + "\n");
  console.log(`\nWrote ${resolved.length} entries to ${outPath}`);

  const missing = resolved.filter((v) => !v.coverUrl).length;
  if (missing > 0) {
    console.warn(`Warning: ${missing} album(s) have no cover and will show the fallback tile.`);
  }
}

main();
