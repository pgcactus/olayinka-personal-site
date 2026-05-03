/**
 * Build-time script: resolve Apple Music cover URLs for all vinyls.
 * Run with: node scripts/resolve-vinyl-covers.mjs
 * Outputs: client/src/data/vinyls-resolved.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function fetchCoverUrl(appleMusicId) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${appleMusicId}&country=gb`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
      return data.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
    }
    return null;
  } catch (e) {
    console.error(`  Failed to fetch cover for ${appleMusicId}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("Resolving vinyl covers from Apple Music...\n");

  const resolved = [];
  for (const vinyl of VINYLS) {
    process.stdout.write(`  ${vinyl.artist} - ${vinyl.title} (${vinyl.appleMusicId})... `);
    const coverUrl = await fetchCoverUrl(vinyl.appleMusicId);
    if (coverUrl) {
      console.log("OK");
    } else {
      console.log("FAILED (will use fallback tile)");
    }
    resolved.push({
      id: vinyl.id,
      title: vinyl.title,
      artist: vinyl.artist,
      year: vinyl.year,
      coverUrl: coverUrl ?? null,
    });
  }

  const outDir = join(__dirname, "../client/src/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "vinyls-resolved.json");
  writeFileSync(outPath, JSON.stringify(resolved, null, 2) + "\n");

  console.log(`\nWrote ${resolved.length} entries to ${outPath}`);
  const missing = resolved.filter((v) => !v.coverUrl).length;
  if (missing > 0) {
    console.warn(`\nWarning: ${missing} album(s) have no cover and will show the fallback tile.`);
  }
}

main();
