/**
 * Build-time book cover resolver — Google Books API.
 * Queries Google Books by ISBN for each book and extracts the thumbnail URL.
 * Falls back to a local path /images/books/[id].jpg for any that fail.
 * Output: client/src/data/books-resolved.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BOOKS = [
  { id: 'playing-to-win', title: 'Playing to Win', author: 'A.G. Lafley & Roger Martin', category: 'business', year: 2013, read: 2024, size: 'wide', isbn: '9798892792288' },
  { id: 'the-score-takes-care-of-itself', title: 'The Score Takes Care of Itself', author: 'Bill Walsh', category: 'business', year: 2009, read: 2025, size: 'tall', isbn: '9781591843474' },
  { id: 'how-to-measure-anything', title: 'How to Measure Anything', author: 'Douglas Hubbard', category: 'product', year: 2007, read: 2024, size: 'small', isbn: '9781118539279' },
  { id: 'thinking-in-systems', title: 'Thinking in Systems', author: 'Donella H. Meadows', category: 'product', year: 2008, read: 2025, size: 'large', isbn: '9781603580557' },
  { id: 'human-powered', title: 'Human Powered', author: 'Trenton Moss', category: 'product', year: 2021, read: 2024, size: 'small', isbn: '9781781336069' },
  { id: 'inspired', title: 'Inspired', author: 'Marty Cagan', category: 'product', year: 2008, read: 2026, size: 'wide', isbn: '9781119387503' },
  { id: 'burmese-days', title: 'Burmese Days', author: 'George Orwell', category: 'classics', year: 1934, read: 2025, size: 'tall', isbn: '9780063344365' },
  { id: 'nineteen-eighty-four', title: 'Nineteen Eighty-Four', author: 'George Orwell', category: 'classics', year: 1949, read: 2024, size: 'large', isbn: '9780241705407' },
  { id: 'to-kill-a-mockingbird', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'classics', year: 1960, read: 2024, size: 'large', isbn: '9781804958728' },
  { id: 'the-odyssey', title: 'The Odyssey', author: 'Homer', category: 'classics', year: '~700 BC', read: 2026, size: 'large', isbn: '9780241733592' },
  { id: 'dr-jekyll', title: 'Dr Jekyll and Mr Hyde', author: 'Robert Louis Stevenson', category: 'classics', year: 1886, read: 2025, size: 'tall', isbn: '9780241552681' },
  { id: 'the-raven', title: 'The Raven and Other Tales', author: 'Edgar Allan Poe', category: 'classics', year: 1845, read: 2025, size: 'small', isbn: '9781407144030' },
  { id: 'simply-lies', title: 'Simply Lies', author: 'David Baldacci', category: 'thrillers', year: 2023, read: 2024, size: 'small', isbn: '9781529062045' },
  { id: 'the-24th-hour', title: 'The 24th Hour', author: 'James Patterson', category: 'thrillers', year: 2024, read: 2024, size: 'small', isbn: '9781529160130' },
  { id: 'the-exchange', title: 'The Exchange', author: 'John Grisham', category: 'thrillers', year: 2023, read: 2025, size: 'small', isbn: '9781399740357' },
  { id: 'how-to-kill-your-family', title: 'How to Kill Your Family', author: 'Bella Mackie', category: 'thrillers', year: 2021, read: 2025, size: 'wide', isbn: '9780008683535' },
  { id: 'vera-wong', title: "Vera Wong's Unsolicited Advice for Murderers", author: 'Jesse Q. Sutanto', category: 'thrillers', year: 2023, read: 2026, size: 'wide', isbn: '9780008558734' },
  { id: 'the-satsuma-complex', title: 'The Satsuma Complex', author: 'Bob Mortimer', category: 'thrillers', year: 2022, read: 2026, size: 'small', isbn: '9781398521230' },
  { id: 'outliers', title: 'Outliers', author: 'Malcolm Gladwell', category: 'nonfiction', year: 2008, read: 2024, size: 'wide', isbn: '9780141036250' },
];

async function resolveCoverUrl(isbn, title) {
  // Try Google Books by ISBN first
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const imageLinks = data?.items?.[0]?.volumeInfo?.imageLinks;
      if (imageLinks) {
        // Prefer the largest available image, upgrade to https and request zoom=2
        const raw = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail;
        if (raw) {
          // Remove curl edge effect, ensure https, and request higher resolution
          return raw
            .replace('&edge=curl', '')
            .replace('http://', 'https://')
            .replace(/zoom=\d/, 'zoom=2');
        }
      }
    }
  } catch (e) {
    // network error — fall through
  }

  // Try Google Books by title as secondary fallback
  try {
    const query = encodeURIComponent(`intitle:${title}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const imageLinks = data?.items?.[0]?.volumeInfo?.imageLinks;
      if (imageLinks) {
        const raw = imageLinks.thumbnail || imageLinks.smallThumbnail;
        if (raw) {
          return raw
            .replace('&edge=curl', '')
            .replace('http://', 'https://')
            .replace(/zoom=\d/, 'zoom=2');
        }
      }
    }
  } catch (e) {
    // fall through
  }

  return null;
}

async function main() {
  console.log('Resolving book covers from Google Books API...\n');
  const resolved = [];
  let hits = 0;

  for (const book of BOOKS) {
    const coverUrl = await resolveCoverUrl(book.isbn, book.title);
    if (coverUrl) {
      console.log(`  ✓ ${book.title}`);
      hits++;
    } else {
      console.log(`  ✗ ${book.title} — local fallback: /images/books/${book.id}.jpg`);
    }
    resolved.push({
      ...book,
      coverUrl: coverUrl ?? null,
      localFallback: `/images/books/${book.id}.jpg`,
    });
  }

  const outDir = `${__dirname}/../client/src/data`;
  mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/books-resolved.json`;
  writeFileSync(outPath, JSON.stringify(resolved, null, 2));
  console.log(`\nResolved ${hits}/${BOOKS.length} covers.`);
  console.log(`Written to ${outPath}`);
}

main().catch(console.error);
