import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getUserId(req: VercelRequest): string | null {
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)

  // Try both lowercase and uppercase header names
  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
  console.log('Auth header present:', !!authHeader)
  console.log('Auth header value:', authHeader ? authHeader.substring(0, 50) + '...' : 'none')

  const token = authHeader && authHeader.split(' ')[1]
  console.log('Token extracted:', !!token)
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none')

  if (!token) {
    console.log('No token found, returning null')
    return null
  }

  try {
    const jwt = require('jsonwebtoken')
    const jwtSecret = process.env.JWT_SECRET || ''
    console.log('JWT Secret length:', jwtSecret.length)

    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    console.log('Token verified, userId:', decoded.userId)
    return decoded.userId
  } catch (error: any) {
    console.error('Token verification failed:', error.message)
    console.error('Error name:', error.name)
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log all headers for debugging
  console.log('=== Notes API Request ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('All headers:', JSON.stringify(req.headers, null, 2))

  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  const userId = getUserId(req)
  console.log('User ID from token:', userId)

  if (!userId) {
    console.log('ERROR: No userId found, returning 401')
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

    const resource = pathParts[apiIndex + 1] || '' // 'notes'
    const id = pathParts[apiIndex + 2] || ''

    if (resource !== 'notes') {
      return res.status(404).json({ error: 'Not found' })
    }

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
    if (req.method === 'POST' && !id) {
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
