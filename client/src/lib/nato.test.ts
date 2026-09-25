import { describe, expect, it } from "vitest";
import {
  fromPhonetic,
  getFirstInvalidWord,
  sanitise,
  sanitiseReverse,
  toPhonetic,
  uniqueWords,
} from "./nato";

describe("NATO conversion", () => {
  it("spells letters and radio digits, separating words", () => {
    expect(toPhonetic("H5 19")).toBe("Hotel • Fife  /  One • Niner");
  });

  it("returns nothing for blank input", () => {
    expect(toPhonetic("   ")).toBe("");
    expect(fromPhonetic("   ")).toBe("");
  });

  it("converts code words back, case-insensitively", () => {
    expect(fromPhonetic("alfa BRAVO Charlie x-ray")).toBe("ABCX");
  });

  it("accepts common spelling variants in reverse mode", () => {
    expect(fromPhonetic("Alpha Juliet Juliett")).toBe("AJJ");
  });

  it("marks unknown words and reports the first one", () => {
    expect(fromPhonetic("Alfa unknown Bravo")).toBe("A?B");
    expect(getFirstInvalidWord("Alfa unknown nope")).toBe("unknown");
    expect(getFirstInvalidWord("Alfa Bravo")).toBeNull();
  });

  it("sanitises forward and reverse input", () => {
    expect(sanitise("hi, there!")).toBe("HI THERE");
    expect(sanitiseReverse(" X-ray 42! ")).toBe("X-ray");
  });

  it("lists each code word once, in order of appearance", () => {
    expect(uniqueWords("ABBA 1")).toEqual(["Alfa", "Bravo", "One"]);
  });
});
