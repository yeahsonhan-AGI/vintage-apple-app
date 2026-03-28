import { Router } from 'express'
import { supabase } from '../config'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { foodAnalysisService, GLMAnalysisResult } from '../services/foodAnalysisService'

const router = Router()

router.use(authenticateToken)

// Get food logs
router.get('/logs', async (req: AuthRequest, res) => {
  try {
    console.log('[GET /food/logs] userId:', req.userId, 'date:', req.query.date)

    const { date } = req.query

    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', req.userId)

    if (date) {
      query = query.eq('date_key', date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /food/logs] Supabase error:', error)
      throw error
    }

    console.log('[GET /food/logs] Success, returning', data?.length || 0, 'items')
    res.json({ success: true, data })
  } catch (error) {
    console.error('[GET /food/logs] Error:', error)
    res.status(500).json({ error: 'Failed to fetch food logs' })
  }
})

// Create food log
router.post('/logs', async (req: AuthRequest, res) => {
  try {
    const fs = require('fs')
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: req.userId,
      body: req.body
    }

    // Write to file for debugging
    fs.appendFileSync('debug.log', JSON.stringify({ action: 'POST /food/logs', ...logEntry }) + '\n')

    console.log('[POST /food/logs] userId:', req.userId)
    console.log('[POST /food/logs] body:', {
      date_key: req.body.date_key,
      meal_name: req.body.meal_name,
      calories: req.body.calories,
      category: req.body.category,
      has_image: !!req.body.image,
      image_length: req.body.image?.length || 0,
      meal_type: req.body.meal_type
    })

    const { date_key, meal_name, calories, category, image, meal_type } = req.body

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: req.userId,
        date_key,
        meal_name,
        calories,
        category,
        image,
        meal_type: meal_type || 'snack',
      })
      .select()

    if (error) {
      console.error('[POST /food/logs] Supabase error:', error)
      fs.appendFileSync('debug.log', JSON.stringify({ action: 'SUPABASE_ERROR', error }) + '\n')
      throw error
    }

    // Get the first inserted item
    const insertedLog = data && data.length > 0 ? data[0] : null

    console.log('[POST /food/logs] Success, created log:', insertedLog)
    fs.appendFileSync('debug.log', JSON.stringify({ action: 'SUCCESS', data: insertedLog }) + '\n')
    res.status(201).json({ success: true, data: insertedLog })
  } catch (error: any) {
    console.error('[POST /food/logs] Error:', error)
    const fs = require('fs')
    fs.appendFileSync('debug.log', JSON.stringify({ action: 'CATCH_ERROR', error: error?.message || String(error) }) + '\n')
    res.status(500).json({ error: 'Failed to create food log' })
  }
})

// Delete food log
router.delete('/logs/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)

    if (error) throw error

    res.json({ success: true, message: 'Food log deleted' })
  } catch (error) {
    console.error('Delete food log error:', error)
    res.status(500).json({ error: 'Failed to delete food log' })
  }
})

// Get daily summary
router.get('/summary/:dateKey', async (req: AuthRequest, res) => {
  try {
    const { dateKey } = req.params

    const { data, error } = await supabase
      .from('daily_food_summary')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date_key', dateKey)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Get summary error:', error)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// Analyze food image with AI
router.post('/analyze', async (req: AuthRequest, res) => {
  try {
    console.log('[POST /food/analyze] userId:', req.userId)

    const { image } = req.body

    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required' })
    }

    // Check if GLM API is configured
    if (!foodAnalysisService.isConfigured()) {
      console.error('[POST /food/analyze] GLM API not configured')
      return res.status(500).json({
        success: false,
        error: 'AI analysis service not configured. Please set GLM_API_KEY.'
      })
    }

    // Analyze the image
    console.log('[POST /food/analyze] Starting AI analysis...')
    const result: GLMAnalysisResult = await foodAnalysisService.analyzeFoodImage(image)

    console.log('[POST /food/analyze] Analysis complete:', {
      food_name: result.food_name,
      calories: result.calories,
      confidence: result.confidence
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('[POST /food/analyze] Error:', error)

    // Provide user-friendly error messages
    let errorMessage = 'Failed to analyze food'

    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Analysis timeout. Please try again.'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment.'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    })
  }
})

export default router
