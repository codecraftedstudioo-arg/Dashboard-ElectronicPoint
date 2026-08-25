/** Higher = newer / higher-tier model for catalog ordering. */
export function iphoneModelSortKey(name: string): number {
  const n = name.trim().toLowerCase();

  // iPhone SE — place near the generation released that year, below mini
  if (/\bse\b/.test(n)) {
    const yearMatch = n.match(/\b(20\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : 2016;
    const gen = Math.max(6, year - 2009);
    return gen * 100 + 5;
  }

  const genMatch = n.match(/iphone\s+(\d+)/i) ?? n.match(/\b(\d{1,2})\b/);
  const gen = genMatch ? Number(genMatch[1]) : 0;

  let tier = 20; // base (e.g. iPhone 16)
  if (/pro\s*max/.test(n)) tier = 50;
  else if (/\bpro\b/.test(n)) tier = 40;
  else if (/\bair\b/.test(n)) tier = 35;
  else if (/\bplus\b/.test(n)) tier = 30;
  else if (/\bmini\b/.test(n)) tier = 10;

  return gen * 100 + tier;
}

/** Sort newest / highest-tier models first. */
export function compareIphoneModelsDesc(aName: string, bName: string): number {
  const rankDiff = iphoneModelSortKey(bName) - iphoneModelSortKey(aName);
  if (rankDiff !== 0) return rankDiff;
  return aName.localeCompare(bName, "es");
}
