/**
 * Vinyl collection. Cover URLs are pre-resolved at build time by
 * scripts/resolve-vinyl-covers.mjs into vinyls-resolved.json; everything
 * personal (favourite track, note) lives here.
 */

import VINYLS_RESOLVED from "./vinyls-resolved.json";

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string | null;
  favouriteTrack?: string;
  /** Shown in the detail panel. Blank lines separate paragraphs. */
  note?: string;
}

const VINYL_EXTRAS: Record<string, Pick<Vinyl, "favouriteTrack" | "note">> = {
  "for-broken-ears": { favouriteTrack: "Found" },
  "untitled-unmastered": { favouriteTrack: "untitled 07" },
  gnx: { favouriteTrack: "wacced out murals" },
  iyrtitl: { favouriteTrack: "Know Yourself" },
  "african-giant": { favouriteTrack: "Ye" },
  "i-told-them": { favouriteTrack: "City Boys" },
  "lungu-boy": { favouriteTrack: "Lungu Boy" },
  wattba: { favouriteTrack: "Jumpman" },
  "the-blueprint": { favouriteTrack: "Izzo (H.O.V.A.)" },
  "let-god-sort-em-out": { favouriteTrack: "Birds & Bees" },
  mbdtf: { favouriteTrack: "Runaway" },
};

export const VINYLS: Vinyl[] = (
  VINYLS_RESOLVED as Omit<Vinyl, "favouriteTrack" | "note">[]
).map(v => ({ ...v, ...VINYL_EXTRAS[v.id] }));
