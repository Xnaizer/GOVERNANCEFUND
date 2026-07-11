import { useReducedMotion } from "framer-motion";

/** `true` bila user meminta kurangi-gerak. Semua animasi berat harus di-guard dengan ini. */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
