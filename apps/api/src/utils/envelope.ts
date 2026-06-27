interface Envelope<T> {
    data: T | null;
    error: string | null;
    meta: Record<string, unknown>; // have object properti key with string and value unkwown
}

export function success<T>(data: T, meta: Record<string, unknown> = {}): Envelope<T> {
    return { data, error: null, meta };
}

export function failure(error: string, meta: Record<string, unknown> = {}): Envelope<null> {
    return { data: null, error, meta };
}