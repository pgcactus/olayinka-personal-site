import { describe, expect, it } from "vitest";
import {
  buildNatoShareUrl,
  fromPhonetic,
  getInitialNatoState,
  toPhonetic,
} from "./nato";

describe("NATO conversion", () => {
  it("uses official code words and radio digit pronunciations", () => {
    expect(toPhonetic("H5 19")).toBe("Hotel • Fife  /  Wun • Niner");
  });

  it("converts valid reverse input and reports unknown words", () => {
    expect(fromPhonetic("Alfa Bravo unknown Charlie")).toEqual({
      output: "ABC",
      invalidWords: ["unknown"],
    });
  });

  it("accepts common written-number aliases in reverse mode", () => {
    expect(fromPhonetic("one two three")).toEqual({
      output: "123",
      invalidWords: [],
    });
  });

  it("restores reverse mode and its input from a share URL", () => {
    expect(getInitialNatoState("?mode=reverse&q=Alfa+Bravo")).toMatchObject({
      mode: "reverse",
      reverseInput: "Alfa Bravo",
    });
  });

  it("shares the active mode and value", () => {
    expect(
      buildNatoShareUrl("https://olayinka.xyz", "reverse", "Alfa Bravo")
    ).toBe("https://olayinka.xyz/nato?mode=reverse&q=Alfa+Bravo");
  });
});
