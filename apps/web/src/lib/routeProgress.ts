import { useSyncExternalStore } from "react";

/**
 * Store mungil untuk bar loading rute. Siapa pun bisa "menahan" bar aktif
 * (route berpindah, atau chunk lazy sedang dimuat lewat Suspense). Bar tampil
 * selama pending > 0. Cross-component → butuh external store (bukan useState).
 */
let pending = 0;
const listeners = new Set<() => void>();

function emit() {
    for (const l of listeners) l();
}

/** Tahan bar aktif; kembalikan fungsi untuk melepas (idempoten). */
export function beginRouteLoad(): () => void {
    pending += 1;
    emit();
    let released = false;
    return () => {
        if (released) return;
        released = true;
        pending = Math.max(0, pending - 1);
        emit();
    };
}

export function useRouteLoading(): boolean {
    return useSyncExternalStore(
        (cb) => {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        () => pending > 0,
        () => false
    );
}
