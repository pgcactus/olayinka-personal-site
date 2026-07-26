import { describe, expect, it } from "vitest";
import { normaliseCountryCode, VISITED_COUNTRIES } from "./visited-countries";

describe("visited-country data", () => {
  it("maps the GeoJSON France sentinel to FR", () => {
    expect(normaliseCountryCode("-99", "France")).toBe("FR");
  });

  it("retains ordinary country codes", () => {
    expect(normaliseCountryCode("DE", "Germany")).toBe("DE");
  });

  it("keeps a source and verification date for every fact", () => {
    for (const country of Object.values(VISITED_COUNTRIES)) {
      expect(country.sourceUrl).toMatch(/^https:\/\//);
      expect(country.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
