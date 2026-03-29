import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, generateToken, corsHeaders } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  const { pathname } = new URL(req.url || '', 'http://localhost')
  const pathParts = pathname.split('/').filter(Boolean)
  const action = pathParts[pathParts.length - 1]

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    // GET /api/auth/callback - Email confirmation callback
    if (action === 'callback' && req.method === 'GET') {
      const { access_token, refresh_token, error } = req.query as any

      if (error) {
        return res.redirect(`/?error=${error}&error_description=${req.query.error_description}`)
      }

      if (!access_token) {
        return res.redirect('/?error=no_token')
      }

      // Set session and redirect
      return res.redirect(`/?token=${access_token}`)
    }

    // POST /api/auth/signup
    if (action === 'signup' && req.method === 'POST') {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }

      // Sign up with auto-login (disable email confirmation for demo)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL || 'https://frontend-beige-sigma-71.vercel.app'}/auth/callback`,
          data: {
            skipEmailConfirmation: true
          }
        }
      })

      if (authError) {
        // If user already exists, try to sign them in instead
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (signInError) {
            return res.status(400).json({ error: signInError.message })
          }

          if (!signInData.user) {
            return res.status(400).json({ error: 'Failed to sign in' })
          }

          const token = generateToken(signInData.user.id, signInData.user.email || '')

          return res.json({
            success: true,
            data: {
              user: {
                id: signInData.user.id,
                email: signInData.user.email,
              },
              token,
            },
          })
        }
        return res.status(400).json({ error: authError.message })
      }

      // If sign up succeeded and user is confirmed (or auto-confirmed), return token
      if (authData.user) {
        const token = generateToken(authData.user.id, authData.user.email || '')

        return res.json({
          success: true,
          data: {
            user: {
              id: authData.user.id,
              email: authData.user.email,
            },
            token,
          },
        })
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        requiresConfirmation: false
      })
    }

    // POST /api/auth/signin
    if (action === 'signin' && req.method === 'POST') {
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

      return res.json({
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          token,
        },
      })
    }

    // POST /api/auth/signout
    if (action === 'signout' && req.method === 'POST') {
      return res.json({ success: true, message: 'Signed out successfully' })
    }

    // GET /api/auth/me
    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Access token required' })
      }

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string; email: string }

      const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded.userId)

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
          },
        },
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Auth API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
