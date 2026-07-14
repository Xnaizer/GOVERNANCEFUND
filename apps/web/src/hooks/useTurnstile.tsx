import { useCallback, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { env } from "../config/env";

const SITE_KEY = env.TURNSTILE_SITE_KEY;
const enabled = import.meta.env.PROD && Boolean(SITE_KEY);

export function useTurnstile() {
  const ref = useRef<TurnstileInstance | null>(null);
  const [token, setToken] = useState("");

  const reset = useCallback(() => {
    setToken("");
    ref.current?.reset();
  }, []);

  const widget = enabled ? (
    <Turnstile
      ref={ref}
      siteKey={SITE_KEY as string}
      onSuccess={setToken}
      onExpire={() => setToken("")}
      onError={() => setToken("")}
      options={{ theme: "auto", size: "flexible" }}
      className="mx-auto"
    />
  ) : null;

  return { widget, token, ready: !enabled || token.length > 0, reset };
}
