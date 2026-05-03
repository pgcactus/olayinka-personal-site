// Book cover images — bundled directly into the app by Vite.
// No CDN, no redirects, no fetch workarounds needed.

import cover01 from './01-playing-to-win.jpg';
import cover02 from './02-score-takes-care.jpg';
import cover03 from './03-how-to-measure.jpg';
import cover04 from './04-thinking-in-systems.jpg';
import cover05 from './05-human-powered.jpg';
import cover06 from './06-inspired.jpg';
import cover07 from './07-burmese-days.jpg';
import cover08 from './08-1984.jpg';
import cover09 from './09-to-kill-a-mockingbird.jpg';
import cover10 from './10-the-odyssey.jpg';
import cover11 from './11-dr-jekyll.jpg';
import cover12 from './12-the-raven.jpg';
import cover13 from './13-simply-lies.jpg';
import cover14 from './14-the-24th-hour.jpg';
import cover15 from './15-the-exchange.jpg';
import cover16 from './16-how-to-kill-your-family.jpg';
import cover17 from './17-vera-wong.jpg';
import cover18 from './18-satsuma-complex.jpg';
import cover19 from './19-outliers.jpg';

// Keyed by book id matching books-resolved.json
export const BOOK_COVERS: Record<string, string> = {
  'playing-to-win': cover01,
  'the-score-takes-care-of-itself': cover02,
  'how-to-measure-anything': cover03,
  'thinking-in-systems': cover04,
  'human-powered': cover05,
  'inspired': cover06,
  'burmese-days': cover07,
  'nineteen-eighty-four': cover08,
  'to-kill-a-mockingbird': cover09,
  'the-odyssey': cover10,
  'dr-jekyll': cover11,
  'the-raven': cover12,
  'simply-lies': cover13,
  'the-24th-hour': cover14,
  'the-exchange': cover15,
  'how-to-kill-your-family': cover16,
  'vera-wong': cover17,
  'the-satsuma-complex': cover18,
  'outliers': cover19,
};
