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
        body_part,
        exercise_name,
        equipment,
        sets,
        reps,
        weight,
        notes,
      } = req.body

      if (!workout_plan_id || !body_part || !exercise_name || !equipment || !sets || !reps) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data: existingExercises } = await supabase
        .from('strength_exercises')
        .select('id')
        .eq('workout_plan_id', workout_plan_id)

      const { data, error } = await supabase
        .from('strength_exercises')
        .insert({
          workout_plan_id,
          body_part,
          exercise_name,
          equipment,
          sets,
          reps,
          weight: weight || null,
          notes: notes || null,
          order_index: existingExercises?.length || 0,
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, data: { exercise: data } })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Strength exercises API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
