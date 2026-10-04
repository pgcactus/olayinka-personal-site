import { describe, expect, it } from "vitest";
import {
  DISTANCES,
  finishTime,
  formatDuration,
  parseDuration,
  pacePerKm,
  speedKmh,
  splits,
} from "./pace";

describe("pace", () => {
  it("reads times in the forms runners write them", () => {
    expect(parseDuration("25:00")).toBe(1500);
    expect(parseDuration("1:52:30")).toBe(6750);
    expect(parseDuration("25")).toBe(1500);
    expect(parseDuration(" 4:59 ")).toBe(299);
    for (const bad of ["", "0", "0:00", "25:60", "a:00", "1:2:3:4", "25.5"])
      expect(parseDuration(bad)).toBeNull();
  });

  it("formats seconds with hours only when needed", () => {
    expect(formatDuration(1500)).toBe("25:00");
    expect(formatDuration(299.6)).toBe("5:00");
    expect(formatDuration(6750)).toBe("1:52:30");
  });

  it("works out pace, speed and finish time", () => {
    expect(pacePerKm(DISTANCES["5k"], 1500)).toBe(300);
    expect(speedKmh(300)).toBe(12);
    expect(formatDuration(finishTime(DISTANCES.marathon, 300))).toBe("3:30:59");
  });

  it("gives km splits for short races and 5 km splits for long ones", () => {
    expect(splits(5, 300).map(s => s.km)).toEqual([1, 2, 3, 4, 5]);
    expect(splits(DISTANCES.half, 300).map(s => s.km)).toEqual([
      5, 10, 15, 20, 21.0975,
    ]);
  });
});
