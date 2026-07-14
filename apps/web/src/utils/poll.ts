export async function pollUntil(
  predicate: () => Promise<boolean>,
  { timeoutMs = 90_000, intervalMs = 2500 } = {},
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await predicate()) return true;
    } catch {
      
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
