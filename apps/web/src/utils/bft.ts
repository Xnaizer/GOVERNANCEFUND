
export function bftThreshold(n: number): number {
  return Math.floor((2 * n) / 3) + 1;
}

export function impliedTotalFromThreshold(t: number): number {
  if (t <= 0) return 0;
  return Math.max(t, Math.ceil((3 * t) / 2) - 1);
}
