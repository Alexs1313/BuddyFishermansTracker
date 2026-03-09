type CatchItem = {
  id: string;
  weight: string;
  [key: string]: unknown;
};

export function parseWeight(weightStr: string | undefined): number {
  const str = (weightStr || '').trim().replace(',', '.');
  const w = parseFloat(str);
  return Number.isNaN(w) ? 0 : w;
}

export function totalWeightKg(catches: CatchItem[]): number {
  return catches.reduce((sum, c) => sum + parseWeight(c.weight), 0);
}

export function getBiggestCatchKg(
  locations: Array<{ catches?: CatchItem[] }>,
): number | null {
  let biggestKg: number | null = null;
  for (const loc of locations) {
    for (const c of loc.catches ?? []) {
      const w = parseWeight(c.weight);
      if (w > 0 && (biggestKg === null || w > biggestKg)) {
        biggestKg = w;
      }
    }
  }
  return biggestKg;
}
