import { Router, Request, Response } from 'express'
import { supabase } from '../config'
import { generateToken } from '../middleware/auth'

const router = Router()

// Sign up - 使用Supabase Auth邮件验证
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // 使用Supabase Auth创建用户（需要邮件验证）
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
      }
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    // 邮件验证流程
    res.status(201).json({
      success: true,
      message: 'Please check your email to confirm your account',
      requiresConfirmation: true
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign in - 使用Supabase Auth
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // 使用Supabase Auth登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)

      // 特殊处理邮件未确认的错误
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

    // 生成我们的JWT token
    const token = generateToken(authData.user.id, authData.user.email || '')

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
})

// Get current user - 验证JWT token
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // 验证我们的JWT token
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string; email: string }

    // 从Supabase Auth获取用户信息
    const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded.userId)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Sign out
router.post('/signout', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Signed out successfully' })
  } catch (error) {
    console.error('Signout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Demo mode - Generate demo token (仅开发环境)
router.post('/demo', async (req: Request, res: Response) => {
  try {
    // 只在开发环境允许
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Demo mode not available in production' })
    }

    const demoEmail = 'demo@qdraw.local'

    // 尝试创建或获取 demo 用户
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: 'demo123456',
      email_confirm: true,
      user_metadata: { name: 'Demo User' }
    })

    // 如果用户已存在，尝试通过邮箱获取
    let targetUser = user
    if (createError && createError.message?.includes('already been registered')) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      targetUser = users.find(u => u.email === demoEmail) || null
    }

    if (!targetUser || !targetUser.id) {
      throw new Error('Failed to get or create demo user')
    }

    // 生成有效的 JWT token
    const token = generateToken(targetUser.id, targetUser.email || demoEmail)

    res.json({
      success: true,
      data: {
        user: {
          id: targetUser.id,
          email: targetUser.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Demo mode error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
