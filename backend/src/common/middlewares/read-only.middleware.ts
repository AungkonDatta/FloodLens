import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * FloodLens is a public, read-only API.
 * Every write method (POST, PUT, PATCH, DELETE ...) is refused with 405,
 * before it can reach any controller or the database.
 */
export function readOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (SAFE_METHODS.includes(req.method.toUpperCase())) {
    return next();
  }
  res.setHeader("Allow", "GET, HEAD, OPTIONS");
  res.status(405).json({
    statusCode: 405,
    error: "Method Not Allowed",
    message: "The FloodLens API is read-only. Only GET requests are allowed.",
  });
}
