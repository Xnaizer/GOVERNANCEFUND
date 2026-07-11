import { formatIDR, formatDate } from "../../utils/format";

function big(v: string): bigint {
  try { return BigInt(v); } catch { return 0n; }
}

interface Item { amount: string; timestamp: string; recipientName: string | null }

/** Mini bar-chart penarikan (kronologis, single-hue). Tooltip via title bawaan. */
export function WithdrawalTrend({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  // data datang urut terbaru→lama; balik jadi lama→baru
  const chrono = [...items].reverse();
  const values = chrono.map((w) => Number(big(w.amount)));
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-24 items-end gap-1.5" role="img" aria-label="Tren penarikan dana">
      {chrono.map((w, i) => {
        const h = Math.max(6, (values[i] / max) * 100);
        return (
          <div
            key={i}
            title={`${formatIDR(w.amount)}${w.recipientName ? ` · ${w.recipientName}` : ""} · ${formatDate(w.timestamp)}`}
            className="flex-1 rounded-t-md bg-brand-blue/75 transition-colors hover:bg-brand-blue"
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
