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
    if (req.method === 'POST') {
      const {
        workout_plan_id,
        exercise_type,
        duration_minutes,
        distance_km,
        calories_burned,
        intensity_level,
        notes,
      } = req.body

      if (!workout_plan_id || !exercise_type || !duration_minutes) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data, error } = await supabase
        .from('cardio_exercises')
        .insert({
          workout_plan_id,
          exercise_type,
          duration_minutes,
          distance_km: distance_km || null,
          calories_burned: calories_burned || null,
          intensity_level: intensity_level || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, data: { exercise: data } })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Cardio exercises API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
