/** Ambang BFT: t = ⌊2N/3⌋ + 1. */
export function bftThreshold(n: number): number {
  return Math.floor((2 * n) / 3) + 1;
}

/**
 * Saat voting SELESAI, jumlah suara == ambang t. Kembalikan total N maksimum
 * yang menghasilkan ambang t: N = ⌈3t/2⌉ − 1.
 *   t=4 → 5  (4/5)
 *   t=7 → 10 (7/10)
 * Murni matematika — tidak perlu membaca total anggota on-chain.
 */
export function impliedTotalFromThreshold(t: number): number {
  if (t <= 0) return 0;
  return Math.max(t, Math.ceil((3 * t) / 2) - 1);
}
