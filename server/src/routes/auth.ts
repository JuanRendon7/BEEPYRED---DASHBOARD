import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

interface AuthUser {
  username: string
  hash: string
  nombre: string
}

function getUsers(): AuthUser[] {
  try {
    return JSON.parse(process.env.AUTH_USERS ?? '[]') as AuthUser[]
  } catch {
    return []
  }
}

authRouter.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Usuario y contraseña requeridos' } })
  }

  const users = getUsers()
  const user = users.find(u => u.username === username)

  if (!user || !(await bcrypt.compare(password, user.hash))) {
    // Delay to mitigate timing attacks
    await new Promise(r => setTimeout(r, 500))
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' } })
  }

  const token = jwt.sign(
    { username: user.username, nombre: user.nombre },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )

  return res.json({ success: true, data: { token, username: user.username, nombre: user.nombre } })
})

authRouter.get('/api/auth/me', (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { username: string; nombre: string }
    return res.json({ success: true, data: { username: payload.username, nombre: payload.nombre } })
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido' } })
  }
})
