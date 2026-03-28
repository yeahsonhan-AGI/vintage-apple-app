import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, authenticateToken, corsHeaders } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = authenticateToken(req)
    if (!auth) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const { data: { user }, error } = await supabase.auth.admin.getUserById(auth.userId)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
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
}
