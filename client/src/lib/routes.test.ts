import { describe, expect, it } from "vitest";
import { parseThingsTab } from "./routes";

describe("Things routes", () => {
  it.each(["books", "vinyls", "places"] as const)(
    "accepts the %s route",
    tab => {
      expect(parseThingsTab(tab)).toBe(tab);
    }
  );

  it("rejects an unknown route", () => {
    expect(parseThingsTab("unknown")).toBeNull();
  });
});
