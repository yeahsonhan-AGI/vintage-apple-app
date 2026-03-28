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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { dateKey } = req.query
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const { data, error } = await supabase
      .from('daily_food_summary')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('date_key', dateKey)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Get summary error:', error)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
}
