import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { analyzeFoodImage } from './_lib/foodAnalysis.js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getUserId(req: VercelRequest): string | null {
  // Try both lowercase and uppercase header names
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  console.log('Food API - Auth header present:', !!authHeader)
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return null

  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Food API - Token verification failed:', error)
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

    // Remove 'api' and get the rest
    // /api/food/logs -> ['api', 'food', 'logs']
    // /api/food/analyze -> ['api', 'food', 'analyze']

    const apiIndex = pathParts.findIndex(p => p === 'api')
    if (apiIndex === -1) {
      return res.status(404).json({ error: 'Not found' })
    }

    const resource = pathParts[apiIndex + 1] || '' // 'food', 'calendar', etc.
    const action = pathParts[apiIndex + 2] || '' // 'logs', 'analyze', etc.
    const id = pathParts[apiIndex + 3] || '' // id for delete/update

    // Food API endpoints
    if (resource !== 'food') {
      return res.status(404).json({ error: 'Not found' })
    }

    // POST /api/food/analyze - Analyze food image
    if (action === 'analyze' && req.method === 'POST') {
      const { image } = req.body

      if (!image) {
        return res.status(400).json({ success: false, error: 'Image is required' })
      }

      if (!process.env.GLM_API_KEY) {
        return res.status(500).json({
          success: false,
          error: 'AI analysis service not configured. Please set GLM_API_KEY.'
        })
      }

      const result = await analyzeFoodImage(image)

      return res.json({
        success: true,
        data: result
      })
    }

    // GET /api/food/logs?date=xxx - Get food logs (also support /api/food?date=xxx for compatibility)
    if (req.method === 'GET' && (action === 'logs' || action === '' || action === 'summary')) {
      const params = getQueryParams(req)
      const date = params.date

      // If it's /api/food/summary/[date], extract date from path
      if (action === 'summary' && id) {
        const dateKey = id
        const { data, error } = await supabase
          .from('daily_food_summary')
          .select('*')
          .eq('user_id', userId)
          .eq('date_key', dateKey)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return res.json({ success: true, data })
      }

      // Get food logs
      let query = supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)

      if (date) {
        query = query.eq('date_key', date)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return res.json({ success: true, data })
    }

    // POST /api/food/logs - Create food log (also support /api/food for compatibility)
    if (req.method === 'POST' && (action === 'logs' || action === '')) {
      const { date_key, meal_name, calories, category, image, meal_type } = req.body

      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
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

    // DELETE /api/food/logs/[id] - Delete food log (also support /api/food/[id] for compatibility)
    if (req.method === 'DELETE') {
      const deleteId = action === 'logs' ? id : (action === '' ? id : '')

      if (!deleteId) {
        return res.status(400).json({ error: 'ID required' })
      }

      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', deleteId)
        .eq('user_id', userId)

      if (error) throw error
      return res.json({ success: true, message: 'Food log deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Food API error:', error)

    let errorMessage = 'Failed to process request'
    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Analysis timeout. Please try again.'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment.'
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    })
  }
}
