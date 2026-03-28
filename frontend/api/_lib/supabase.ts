import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface AuthRequest {
  userId?: string
  userEmail?: string
}

export function authenticateToken(req: any): AuthRequest | null {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return null
  }

  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string; email: string }
    return { userId: decoded.userId, userEmail: decoded.email }
  } catch (error) {
    return null
  }
}

export function generateToken(userId: string, email: string): string {
  const jwt = require('jsonwebtoken')
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || '',
    { expiresIn: '7d' }
  )
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
