/**
 * Running pace maths for /pace. Times are whole seconds; distances are km.
 */

export const DISTANCES = {
  "5k": 5,
  "10k": 10,
  half: 21.0975,
  marathon: 42.195,
} as const;
export type DistanceKey = keyof typeof DISTANCES;

export const KM_PER_MILE = 1.609344;

/**
 * Reads "25:00", "1:52:30" or "25" (minutes) as seconds. Returns null for
 * anything else, including zero.
 */
export function parseDuration(text: string): number | null {
  const parts = text.trim().split(":");
  if (parts.length > 3 || parts.some(p => !/^\d{1,3}$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.slice(1).some(n => n >= 60)) return null;
  const [h, m, s] =
    nums.length === 3
      ? nums
      : nums.length === 2
        ? [0, ...nums]
        : [0, nums[0], 0];
  const total = h * 3600 + m * 60 + s;
  return total > 0 ? total : null;
}

/** 1500 → "25:00", 6750 → "1:52:30". */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function pacePerKm(km: number, seconds: number) {
  return seconds / km;
}

export function finishTime(km: number, secondsPerKm: number) {
  return km * secondsPerKm;
}

export function speedKmh(secondsPerKm: number) {
  return 3600 / secondsPerKm;
}

/**
 * Elapsed time at each marker: every km up to 10 km, then every 5 km,
 * always ending with the full distance.
 */
export function splits(km: number, secondsPerKm: number) {
  const step = km <= 10 ? 1 : 5;
  const marks: number[] = [];
  for (let d = step; d < km - 1e-9; d += step) marks.push(d);
  marks.push(km);
  return marks.map(d => ({ km: d, seconds: d * secondsPerKm }));
}
