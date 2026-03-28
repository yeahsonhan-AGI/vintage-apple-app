import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, corsHeaders } from '../_lib/supabase'

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

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'https://frontend-beige-sigma-71.vercel.app'}/auth/callback`
      }
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(201).json({
      success: true,
      message: 'Please check your email to confirm your account',
      requiresConfirmation: true
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
