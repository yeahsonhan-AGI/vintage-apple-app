import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, corsHeaders } from './_lib/supabase.js'

function getUserId(req: VercelRequest): string | null {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return null

  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  const userId = getUserId(req)
  if (!userId) {
    return res.status(401).json({ error: 'Access token required' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const url = new URL(req.url || '', 'http://localhost')
    const pathParts = url.pathname.split('/').filter(Boolean)
    const id = pathParts[pathParts.length - 1]

    // GET /api/calendar?date=xxx - Get todos
    if (req.method === 'GET') {
      const { date } = url.searchParams

      let query = supabase
        .from('calendar_todos')
        .select('*')
        .eq('user_id', userId)

      if (date) {
        query = query.eq('date_key', date)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return res.json({ success: true, data })
    }

    // POST /api/calendar - Create todo
    if (req.method === 'POST') {
      const { date_key, title } = req.body

      const { data, error } = await supabase
        .from('calendar_todos')
        .insert({
          user_id: userId,
          date_key,
          title,
          completed: false,
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ success: true, data })
    }

    // PUT /api/calendar/[id] - Update todo
    if (req.method === 'PUT' && id) {
      const updates = req.body

      const { data, error } = await supabase
        .from('calendar_todos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return res.json({ success: true, data })
    }

    // DELETE /api/calendar/[id] - Delete todo
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('calendar_todos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return res.json({ success: true, message: 'Todo deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Calendar API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
