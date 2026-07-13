import { z } from "zod";
import { sanitizeText } from "../utils/sanitize";

export const plainTextRequired = (max: number) => {
  return z
    .string()
    .max(max)
    .transform(sanitizeText)
    .refine((s) => s.length > 0, "Field required");
};

export const plainText = (max: number) => {
  return z
    .string()
    .max(max)
    .transform((text) => sanitizeText(text));
};
