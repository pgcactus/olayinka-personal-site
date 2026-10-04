import { describe, expect, it } from "vitest";
import { sanitise, toPhonetic, uniqueWords } from "./nato";

describe("NATO conversion", () => {
  it("spells letters and radio digits, separating words", () => {
    expect(toPhonetic("H5 19")).toBe("Hotel • Fife  /  One • Niner");
  });

  it("returns nothing for blank input", () => {
    expect(toPhonetic("   ")).toBe("");
  });

  it("sanitises input to letters, digits and spaces", () => {
    expect(sanitise("hi, there!")).toBe("HI THERE");
  });

  it("lists each code word once, in order of appearance", () => {
    expect(uniqueWords("ABBA 1")).toEqual(["Alfa", "Bravo", "One"]);
  });
});
