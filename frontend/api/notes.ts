import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, authenticateToken, corsHeaders, generateToken } from './_lib/supabase.js'

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
    const id = url.pathname.split('/').pop()

    // GET /api/notes - Get all notes
    if (req.method === 'GET' && !id) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return res.json({ success: true, data })
    }

    // POST /api/notes - Create note
    if (req.method === 'POST') {
      const { title, content } = req.body

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: title || '',
          content: content || '',
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ success: true, data })
    }

    // PUT /api/notes/[id] - Update note
    if (req.method === 'PUT' && id) {
      const updates = req.body

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return res.json({ success: true, data })
    }

    // DELETE /api/notes/[id] - Delete note
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return res.json({ success: true, message: 'Note deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Notes API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
