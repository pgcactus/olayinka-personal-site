export type ThingsTab = "books" | "vinyls" | "places";

export const THINGS_TABS: ThingsTab[] = ["books", "vinyls", "places"];

export function parseThingsTab(raw: string | undefined): ThingsTab | null {
  return THINGS_TABS.includes(raw as ThingsTab) ? (raw as ThingsTab) : null;
}
