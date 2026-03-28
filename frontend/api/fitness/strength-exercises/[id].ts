import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, authenticateToken, corsHeaders } from '../../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  const auth = authenticateToken(req)
  if (!auth) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const { id } = req.query
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('strength_exercises')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.json({ success: true, message: 'Exercise deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Strength exercise API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
