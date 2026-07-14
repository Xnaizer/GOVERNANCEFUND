import { useSyncExternalStore } from "react";

let pending = 0;
const listeners = new Set<() => void>();

function emit() {
    for (const l of listeners) l();
}

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
