import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getUserId(req: VercelRequest): string | null {
  // Try both lowercase and uppercase header names
  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
  console.log('Calendar API - Auth header present:', !!authHeader)
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Calendar API - Token verification failed:', error)
    return null
  }
}

function getQueryParams(req: VercelRequest) {
  const url = new URL(req.url || '', 'http://localhost')
  const params: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  const userId = getUserId(req)
  if (!userId) {
    return res.status(401).json({ error: 'Access token required' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    const url = new URL(req.url || '', 'http://localhost')
    const pathParts = url.pathname.split('/').filter(Boolean)

    const apiIndex = pathParts.findIndex(p => p === 'api')
    if (apiIndex === -1) {
      return res.status(404).json({ error: 'Not found' })
    }

    const resource = pathParts[apiIndex + 1] || '' // 'calendar'
    const action = pathParts[apiIndex + 2] || '' // 'todos'
    const id = pathParts[apiIndex + 3] || ''

    if (resource !== 'calendar') {
      return res.status(404).json({ error: 'Not found' })
    }

    // GET /api/calendar/todos?date=xxx - Get todos
    if (req.method === 'GET' && (action === 'todos' || action === '')) {
      const params = getQueryParams(req)
      const date = params.date

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

    // POST /api/calendar/todos - Create todo
    if (req.method === 'POST' && (action === 'todos' || action === '')) {
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

    // PUT /api/calendar/todos/[id] - Update todo
    if (req.method === 'PUT' && action === 'todos' && id) {
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

    // DELETE /api/calendar/todos/[id] - Delete todo
    if (req.method === 'DELETE' && action === 'todos' && id) {
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
