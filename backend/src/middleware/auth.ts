import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  console.log('[AUTH] Checking token for path:', req.path)

  if (!token) {
    console.log('[AUTH] No token provided')
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string }
    console.log('[AUTH] Token decoded, userId:', decoded.userId)
    req.userId = decoded.userId
    req.userEmail = decoded.email
    next()
  } catch (error) {
    console.log('[AUTH] Token verification failed:', error)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: '7d' }
  )
}
