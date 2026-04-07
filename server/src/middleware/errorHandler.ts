import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the full error server-side for debugging
  console.error('[ERROR]', err.message, err.stack)

  // Return structured error to client — NO stack traces (per D-23 pattern)
  res.status(502).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected server error occurred',
    },
  })
}
