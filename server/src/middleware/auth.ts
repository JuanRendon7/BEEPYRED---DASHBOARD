import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(_req: Request, res: Response, next: NextFunction): void {
  const header = _req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } })
    return
  }
  try {
    jwt.verify(header.slice(7), process.env.JWT_SECRET!)
    next()
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' } })
  }
}
