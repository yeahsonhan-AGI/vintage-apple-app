import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, authenticateToken, corsHeaders } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  const auth = authenticateToken(req)
  if (!auth) {
    return res.status(401).json({ error: 'Access token required' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    if (req.method === 'GET') {
      const { date } = req.query

      let query = supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', auth.userId)

      if (date && typeof date === 'string') {
        query = query.eq('date_key', date)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return res.json({ success: true, data })
    }

    if (req.method === 'POST') {
      const { date_key, meal_name, calories, category, image, meal_type } = req.body

      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: auth.userId,
          date_key,
          meal_name,
          calories,
          category,
          image,
          meal_type: meal_type || 'snack',
        })
        .select()

      if (error) throw error

      const insertedLog = data && data.length > 0 ? data[0] : null
      return res.status(201).json({ success: true, data: insertedLog })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Food logs API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
