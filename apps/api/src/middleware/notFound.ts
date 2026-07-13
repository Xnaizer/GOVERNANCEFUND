import type { Request, Response } from "express";
import response from "../utils/response";

export function notFoundHandler(req: Request, res: Response): void {
  response.notFound(res, `Route not found: ${req.method} ${req.path}`);
}
