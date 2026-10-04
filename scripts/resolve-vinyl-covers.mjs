/**
 * Build-time script: resolve Apple Music cover URLs and one preview clip per
 * vinyl. Run with: node scripts/resolve-vinyl-covers.mjs
 * Outputs: client/src/data/vinyls-resolved.json
 *
 * Behaviour:
 *  - Only fetches what is missing: a record already holding a cover and a
 *    preview is left alone, so builds without internet stay fast.
 *  - A value that fails to fetch never replaces one already known.
 *  - Once one request fails (no internet), the rest are skipped.
 *  - Each request has a 5-second timeout.
 *  - `--force` refetches everything (keeping old values if a fetch fails).
 *
 * previewTrack is the owner's favourite track where there is one, otherwise
 * the album's best-known single. It must be a track on that album.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORCE = process.argv.includes("--force");
const FETCH_TIMEOUT_MS = 5000; // 5 s per request

const VINYLS = [
  {
    id: "for-broken-ears",
    title: "For Broken Ears",
    artist: "Tems",
    year: 2020,
    appleMusicId: "1532252592",
    previewTrack: "Free Mind",
  },
  {
    id: "untitled-unmastered",
    title: "untitled unmastered.",
    artist: "Kendrick Lamar",
    year: 2016,
    appleMusicId: "1440844834",
    previewTrack: "untitled 07",
  },
  {
    id: "gnx",
    title: "GNX",
    artist: "Kendrick Lamar",
    year: 2024,
    appleMusicId: "1781270319",
    previewTrack: "wacced out murals",
  },
  {
    id: "iyrtitl",
    title: "If You're Reading This It's Too Late",
    artist: "Drake",
    year: 2015,
    appleMusicId: "1440839718",
    previewTrack: "Know Yourself",
  },
  {
    id: "african-giant",
    title: "African Giant",
    artist: "Burna Boy",
    year: 2019,
    appleMusicId: "1471446047",
    previewTrack: "On the Low",
  },
  {
    id: "i-told-them",
    title: "I Told Them",
    artist: "Burna Boy",
    year: 2023,
    appleMusicId: "1699611123",
    previewTrack: "City Boys",
  },
  {
    id: "lungu-boy",
    title: "Lungu Boy",
    artist: "Asake",
    year: 2024,
    appleMusicId: "1760853689",
    previewTrack: "Active",
  },
  {
    id: "wattba",
    title: "What a Time to Be Alive",
    artist: "Future & Drake",
    year: 2015,
    appleMusicId: "1440842320",
    previewTrack: "Jumpman",
  },
  {
    id: "the-blueprint",
    title: "The Blueprint",
    artist: "Jay-Z",
    year: 2001,
    appleMusicId: "1440757381",
    previewTrack: "Izzo (H.O.V.A.)",
  },
  {
    id: "let-god-sort-em-out",
    title: "Let God Sort Em Out",
    artist: "Clipse",
    year: 2025,
    appleMusicId: "1816313639",
    previewTrack: "Ace Trumpets",
  },
  {
    id: "mbdtf",
    title: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    year: 2010,
    appleMusicId: "1440621197",
    previewTrack: "Runaway",
  },
];

const outDir = join(__dirname, "../client/src/data");
const outPath = join(outDir, "vinyls-resolved.json");

// ---------------------------------------------------------------------------
// Existing values, kept unless refreshed successfully
// ---------------------------------------------------------------------------
let existing = new Map();
if (existsSync(outPath)) {
  try {
    existing = new Map(
      JSON.parse(readFileSync(outPath, "utf8")).map(v => [v.id, v])
    );
  } catch {
    // Corrupt JSON: rebuild from scratch.
  }
}

const needsWork = vinyl => {
  const known = existing.get(vinyl.id);
  return FORCE || !known || !known.coverUrl || !("preview" in known);
};

if (!VINYLS.some(needsWork) && existing.size === VINYLS.length) {
  console.log(
    "vinyls-resolved.json is up to date, skipping Apple Music.\n" +
      "(Run with --force to refresh covers and previews.)"
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
let offline = false;

async function lookup(query) {
  if (offline) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?${query}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).results ?? [];
  } catch (e) {
    const reason = e.name === "AbortError" ? "timed out" : e.message;
    console.error(
      `  Apple Music lookup failed (${reason}); skipping the rest.`
    );
    offline = true;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// "Runaway (feat. Pusha T)" and "untitled 07 | levitate" should match
// "Runaway" and "untitled 07".
const normalise = name =>
  name
    .toLowerCase()
    .replace(/\s*[([](feat|with)\.?[^)\]]*[)\]]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function fetchAlbum(vinyl) {
  const results = await lookup(
    `id=${vinyl.appleMusicId}&entity=song&country=gb`
  );
  if (!results) return null;
  const album = results.find(r => r.wrapperType === "collection");
  const want = normalise(vinyl.previewTrack);
  const track = results.find(
    r =>
      r.wrapperType === "track" &&
      r.previewUrl &&
      normalise(r.trackName).startsWith(want)
  );
  return {
    coverUrl: album?.artworkUrl100?.replace("100x100bb", "600x600bb") ?? null,
    preview: track
      ? {
          track: vinyl.previewTrack,
          url: track.previewUrl,
          link: track.trackViewUrl,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Resolving vinyl covers and previews from Apple Music...");

  const resolved = [];
  for (const vinyl of VINYLS) {
    const known = existing.get(vinyl.id);
    let coverUrl = known?.coverUrl ?? null;
    let preview = known?.preview ?? null;
    if (needsWork(vinyl)) {
      process.stdout.write(`  ${vinyl.artist} - ${vinyl.title}... `);
      const found = await fetchAlbum(vinyl);
      coverUrl = found?.coverUrl ?? coverUrl;
      preview = found?.preview ?? preview;
      console.log(
        found
          ? `cover ${coverUrl ? "OK" : "missing"}, preview ${preview ? "OK" : "not found"}`
          : "kept existing values"
      );
    }
    resolved.push({
      id: vinyl.id,
      title: vinyl.title,
      artist: vinyl.artist,
      year: vinyl.year,
      coverUrl,
      // Written only once a lookup has run, so an offline build retries.
      ...(preview || !offline ? { preview } : {}),
    });
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(resolved, null, 2) + "\n");
  console.log(`\nWrote ${resolved.length} entries to ${outPath}`);

  const noCover = resolved.filter(v => !v.coverUrl).length;
  const noPreview = resolved.filter(v => !v.preview).length;
  if (noCover) console.warn(`Warning: ${noCover} album(s) have no cover.`);
  if (noPreview) console.warn(`Note: ${noPreview} album(s) have no preview.`);
}

main();
