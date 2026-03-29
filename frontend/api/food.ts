import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, corsHeaders } from './_lib/supabase.js'
import { analyzeFoodImage } from './_lib/foodAnalysis.js'

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
    const rest = pathParts.slice(2) // Remove 'api' and 'food'

    // POST /api/food/analyze - Analyze food image
    if (rest[0] === 'analyze' && req.method === 'POST') {
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

    // GET /api/food?date=xxx - Get food logs
    if (req.method === 'GET' && rest.length === 0) {
      const params = getQueryParams(req)
      const date = params.date

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

    // GET /api/food/[date] - Get daily summary
    if (req.method === 'GET' && rest.length === 1) {
      const dateKey = rest[0]
      const { data, error } = await supabase
        .from('daily_food_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', dateKey)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return res.json({ success: true, data })
    }

    // POST /api/food - Create food log
    if (req.method === 'POST' && rest.length === 0) {
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

    // DELETE /api/food/[id] - Delete food log
    if (req.method === 'DELETE' && rest.length === 1) {
      const id = rest[0]
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id)
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
