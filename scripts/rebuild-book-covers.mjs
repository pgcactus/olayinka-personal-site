/**
 * rebuild-book-covers.mjs
 * Re-resolves cover URLs for every book in books-source.json.
 * Strategy (in order):
 *   1. Open Library /b/isbn/{isbn}-L.jpg  — large JPEG, ~20–60KB when available
 *   2. Google Books fife=w400             — reliable fallback, ~10–25KB
 *   3. Google Books zoom=1                — last resort
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../client/src/data');

const books = JSON.parse(readFileSync(join(DATA_DIR, 'books-resolved.json'), 'utf8'));

const PLACEHOLDER_SIZE = 100; // bytes — Open Library "no cover" is 43 bytes

async function tryOpenLibrary(isbn) {
  try {
    const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength <= PLACEHOLDER_SIZE) return null;
    return url;
  } catch { return null; }
}

async function tryGoogleFife(id) {
  if (!id) return null;
  try {
    const url = `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&fife=w400&source=gbs_api`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength <= PLACEHOLDER_SIZE) return null;
    return url;
  } catch { return null; }
}

async function tryGoogleZoom1(id) {
  if (!id) return null;
  try {
    const url = `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength <= PLACEHOLDER_SIZE) return null;
    return url;
  } catch { return null; }
}

// Extract Google Books volume ID from existing coverUrl
function extractGoogleId(coverUrl) {
  if (!coverUrl) return null;
  const m = coverUrl.match(/[?&]id=([^&]+)/);
  return m ? m[1] : null;
}

const results = [];

for (const book of books) {
  const googleId = extractGoogleId(book.coverUrl);
  process.stdout.write(`Resolving: ${book.title}... `);

  const url =
    (await tryOpenLibrary(book.isbn)) ||
    (await tryGoogleFife(googleId)) ||
    (await tryGoogleZoom1(googleId)) ||
    null;

  console.log(url ? `OK (${url.includes('openlibrary') ? 'OL' : 'GB'})` : 'FAILED');

  results.push({ ...book, coverUrl: url });
}

writeFileSync(join(DATA_DIR, 'books-resolved.json'), JSON.stringify(results, null, 2) + '\n');
console.log('\nDone. Written to books-resolved.json');
