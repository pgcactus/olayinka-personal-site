export interface CountryInfo {
  name: string;
  capital: string;
  fact: string;
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
}

export const VISITED_COUNTRIES: Record<string, CountryInfo> = {
  FR: {
    name: "France",
    capital: "Paris",
    fact: "The Eiffel Tower was originally expected to be dismantled after 20 years.",
    sourceLabel: "Official Eiffel Tower site",
    sourceUrl:
      "https://www.toureiffel.paris/en/the-monument/eiffel-tower-and-science",
    verifiedAt: "2026-07-26",
  },
  IT: {
    name: "Italy",
    capital: "Rome",
    fact: "Italy currently has 61 properties on UNESCO's World Heritage List.",
    sourceLabel: "UNESCO",
    sourceUrl: "https://whc.unesco.org/en/statesparties/it",
    verifiedAt: "2026-07-26",
  },
  ME: {
    name: "Montenegro",
    capital: "Podgorica",
    fact: "Montenegro's parliament declared independence in 2006.",
    sourceLabel: "European Commission",
    sourceUrl: "https://enlargement.ec.europa.eu/countries/montenegro_en",
    verifiedAt: "2026-07-26",
  },
  ES: {
    name: "Spain",
    capital: "Madrid",
    fact: "Spain currently has 50 properties on UNESCO's World Heritage List.",
    sourceLabel: "UNESCO",
    sourceUrl: "https://whc.unesco.org/en/statesparties/es",
    verifiedAt: "2026-07-26",
  },
  CH: {
    name: "Switzerland",
    capital: "Bern",
    fact: "Women gained the right to vote in Swiss federal elections and referendums in 1971.",
    sourceLabel: "Swiss Federal Department of Foreign Affairs",
    sourceUrl:
      "https://www.aboutswitzerland.eda.admin.ch/en/the-way-to-modern-direct-democracy",
    verifiedAt: "2026-07-26",
  },
  GB: {
    name: "United Kingdom",
    capital: "London",
    fact: "The Penny Black, issued in the United Kingdom in 1840, was the world's first adhesive postage stamp.",
    sourceLabel: "Universal Postal Union",
    sourceUrl:
      "https://www.upu.int/en/universal-postal-union/about-upu/history",
    verifiedAt: "2026-07-26",
  },
  US: {
    name: "United States",
    capital: "Washington, D.C.",
    fact: "English was designated the official language of the United States by executive order in March 2025.",
    sourceLabel: "The White House",
    sourceUrl:
      "https://www.whitehouse.gov/presidential-actions/2025/03/designating-english-as-the-official-language-of-the-united-states/",
    verifiedAt: "2026-07-26",
  },
  DE: {
    name: "Germany",
    capital: "Berlin",
    fact: "Germany currently has 55 properties on UNESCO's World Heritage List.",
    sourceLabel: "UNESCO",
    sourceUrl: "https://whc.unesco.org/en/statesparties/de",
    verifiedAt: "2026-07-26",
  },
  BE: {
    name: "Belgium",
    capital: "Brussels",
    fact: "Belgium has three regions and three language-based communities, each with legally equal powers in its areas of responsibility.",
    sourceLabel: "European Union",
    sourceUrl:
      "https://european-union.europa.eu/principles-countries-history/eu-countries/belgium_en",
    verifiedAt: "2026-07-26",
  },
};

export const VISITED_COUNTRY_CODES = new Set(Object.keys(VISITED_COUNTRIES));

export function normaliseCountryCode(
  iso2: string,
  countryName: string
): string {
  if (iso2 === "-99" && countryName === "France") return "FR";
  return iso2;
}
