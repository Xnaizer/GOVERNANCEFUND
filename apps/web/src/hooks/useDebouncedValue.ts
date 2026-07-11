import { useEffect, useState } from "react";

/** Kembalikan nilai yang tertunda `delay` ms setelah `value` berhenti berubah (untuk search). */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
