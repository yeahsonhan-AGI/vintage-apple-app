import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, generateToken, corsHeaders } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        return res.status(403).json({
          error: 'Please confirm your email first. Check your inbox for the confirmation link.'
        })
      }
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(authData.user.id, authData.user.email || '')

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Signin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
