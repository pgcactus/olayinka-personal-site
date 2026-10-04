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
  /** A short Apple Music clip, resolved at build time when the network allows. */
  preview?: { track: string; url: string; link: string } | null;
  favouriteTrack?: string;
  /** Shown in the detail panel. Blank lines separate paragraphs. */
  note?: string;
}

const VINYL_EXTRAS: Record<string, Pick<Vinyl, "favouriteTrack" | "note">> = {
  // Favourite tracks are left out where the one on file was not on the album.
  "for-broken-ears": {},
  "untitled-unmastered": { favouriteTrack: "untitled 07" },
  gnx: { favouriteTrack: "wacced out murals" },
  iyrtitl: { favouriteTrack: "Know Yourself" },
  "african-giant": {},
  "i-told-them": { favouriteTrack: "City Boys" },
  "lungu-boy": {},
  wattba: { favouriteTrack: "Jumpman" },
  "the-blueprint": { favouriteTrack: "Izzo (H.O.V.A.)" },
  "let-god-sort-em-out": {},
  mbdtf: { favouriteTrack: "Runaway" },
};

export const VINYLS: Vinyl[] = (
  VINYLS_RESOLVED as Omit<Vinyl, "favouriteTrack" | "note">[]
).map(v => ({ ...v, ...VINYL_EXTRAS[v.id] }));
