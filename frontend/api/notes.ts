import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getUserId(req: VercelRequest): string | null {
  console.log('=== getUserId START ===')
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)

  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
  console.log('Auth header present:', !!authHeader)
  console.log('Auth header type:', typeof authHeader)
  console.log('Auth header value:', authHeader ? authHeader.substring(0, 50) + '...' : 'none')

  if (!authHeader) {
    console.log('No auth header found')
    return null
  }

  const parts = authHeader.split(' ')
  console.log('Auth header parts:', parts.length)

  const token = parts[1]
  console.log('Token extracted:', !!token)
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none')
  console.log('Token length:', token?.length || 0)

  if (!token) {
    console.log('No token found after split')
    return null
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || ''

    console.log('Attempting JWT verification...')
    console.log('JWT Secret (first 10 chars):', jwtSecret.substring(0, 10))

    const decoded = jwt.verify(token, jwtSecret) as any
    console.log('JWT verify succeeded')
    console.log('Decoded token:', JSON.stringify(decoded, null, 2))
    console.log('User ID from decoded token:', decoded.userId)

    return decoded.userId
  } catch (error: any) {
    console.error('=== JWT VERIFICATION FAILED ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
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

  // Test mode: return auth check result without fetching data
  if (req.url && req.url.includes('test')) {
    const debugInfo = {
      step: 'Starting auth check',
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      headersKeys: Object.keys(req.headers),
      authHeader: null,
      tokenExtracted: false,
      tokenLength: 0,
      jwtVerifyResult: null,
      error: null
    }

    try {
      // Step 1: Check auth header
      const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
      debugInfo.step = 'Auth header check'
      debugInfo.authHeader = authHeader ? authHeader.substring(0, 50) + '...' : null

      if (!authHeader) {
        debugInfo.error = 'No auth header found'
        return res.json({ success: false, debugInfo })
      }

      // Step 2: Extract token
      const parts = authHeader.split(' ')
      debugInfo.step = 'Token extraction'
      debugInfo.tokenExtracted = parts.length > 1
      const token = parts[1]
      debugInfo.tokenLength = token?.length || 0

      if (!token) {
        debugInfo.error = 'No token in auth header'
        return res.json({ success: false, debugInfo })
      }

      // Step 3: Verify JWT
      debugInfo.step = 'JWT verification'
      const jwt = require('jsonwebtoken')
      const jwtSecret = process.env.JWT_SECRET || ''
      const decoded = jwt.verify(token, jwtSecret) as any

      debugInfo.jwtVerifyResult = {
        hasUserId: !!decoded.userId,
        userId: decoded.userId,
        hasEmail: !!decoded.email,
        email: decoded.email
      }

      debugInfo.step = 'Success - userId: ' + decoded.userId
      return res.json({ success: true, debugInfo })

    } catch (error: any) {
      debugInfo.step = 'Error at step: ' + debugInfo.step
      debugInfo.error = {
        name: error.name,
        message: error.message
      }
      return res.json({ success: false, debugInfo })
    }
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
  } catch (error: any) {
    console.error('=== NOTES API ERROR ===')
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', error)

    res.status(500).json({
      error: 'Request failed',
      details: error?.message || 'Unknown error',
      type: error?.name || 'Error'
    })
  }
}
