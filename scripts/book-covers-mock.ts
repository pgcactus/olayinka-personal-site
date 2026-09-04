// Mock for client/src/assets/book-covers/index.ts used during SSR prerender.
// Returns empty strings instead of importing JPG files (which Node can't handle).
export const BOOK_COVERS: Record<string, string> = {
  'playing-to-win': '',
  'the-score-takes-care-of-itself': '',
  'how-to-measure-anything': '',
  'thinking-in-systems': '',
  'human-powered': '',
  'inspired': '',
  'burmese-days': '',
  'nineteen-eighty-four': '',
  'to-kill-a-mockingbird': '',
  'the-odyssey': '',
  'dr-jekyll': '',
  'the-raven': '',
  'simply-lies': '',
  'the-24th-hour': '',
  'the-exchange': '',
  'how-to-kill-your-family': '',
  'vera-wong': '',
  'the-satsuma-complex': '',
  'outliers': '',
};
