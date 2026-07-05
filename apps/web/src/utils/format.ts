export function formatIDR(amount: string | null | undefined): string {
  if (!amount) return "-";

  try {
    return "Rp. " + BigInt(amount).toLocaleString("id-ID");
  } catch {
    return amount;
  }
}

export function formatShortenAddress(
  address: string | null | undefined,
): string {
  if (!address) return "-";

  return address.length > 10
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
