import { useCallback, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { env } from "../config/env";

const SITE_KEY = env.TURNSTILE_SITE_KEY;
// Aktif hanya di build production DAN bila site key terisi. Di development (vite dev)
// Turnstile dinonaktifkan penuh → widget tak dirender, `ready` selalu true.
const enabled = import.meta.env.PROD && Boolean(SITE_KEY);

/**
 * Membungkus widget Cloudflare Turnstile jadi satu hook reusable untuk form auth.
 * - `widget`  : elemen yang dirender di dalam form (null bila site key kosong → dev).
 * - `token`   : token verifikasi terbaru (kosong bila belum lolos / kedaluwarsa).
 * - `ready`   : boleh submit? true bila Turnstile nonaktif ATAU token sudah ada.
 * - `reset()` : minta token baru (token sekali-pakai → panggil setelah submit gagal).
 */
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
