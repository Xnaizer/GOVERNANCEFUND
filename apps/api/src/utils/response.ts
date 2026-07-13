import type { Response } from "express";

function success(
  res: Response,
  data: unknown,
  meta: Record<string, unknown> = {},
  status = 200,
) {
  res.status(status).json({ data, error: null, meta });
}
function error(
  res: Response,
  message: string,
  status = 500,
  meta: Record<string, unknown> = {},
) {
  res.status(status).json({ data: null, error: message, meta });
}
function created(
  res: Response,
  data: unknown,
  meta: Record<string, unknown> = {},
) {
  res.status(201).json({ data, error: null, meta });
}
function unauthorized(res: Response, message = "Unauthorized") {
  res.status(401).json({ data: null, error: message, meta: {} });
}
function forbidden(res: Response, message = "Forbidden") {
  res.status(403).json({ data: null, error: message, meta: {} });
}
function notFound(res: Response, message = "Not found") {
  res.status(404).json({ data: null, error: message, meta: {} });
}

export default { success, error, created, unauthorized, forbidden, notFound };
