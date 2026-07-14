import { useEffect, useRef, useState } from "react";

export function useBriefLoading(key: unknown, ms = 400): boolean {
  const [loading, setLoading] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [key, ms]);

  return loading;
}
