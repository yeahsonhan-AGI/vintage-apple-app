import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, corsHeaders } from '../_lib/supabase'
import { analyzeFoodImage } from '../_lib/foodAnalysis'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  const auth = authenticateToken(req)
  if (!auth) {
    return res.status(401).json({ error: 'Access token required' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
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

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Food analyze error:', error)

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
}
