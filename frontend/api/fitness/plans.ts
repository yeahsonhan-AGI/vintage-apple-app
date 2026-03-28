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
    if (req.method === 'GET') {
      const { date } = req.query

      let query = supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', auth.userId)
        .order('date_key', { ascending: false })

      if (date && typeof date === 'string') {
        query = query.eq('date_key', date)
      }

      const { data, error } = await query

      if (error) throw error

      const plansWithExercises = await Promise.all(
        (data || []).map(async (plan) => {
          let exercises: any = {}

          if (plan.training_type === 'strength') {
            const { data: strengthExercises } = await supabase
              .from('strength_exercises')
              .select('*')
              .eq('workout_plan_id', plan.id)
              .order('order_index', { ascending: true })

            exercises = { strength: strengthExercises || [] }
          } else if (plan.training_type === 'cardio') {
            const { data: cardioExercises } = await supabase
              .from('cardio_exercises')
              .select('*')
              .eq('workout_plan_id', plan.id)

            exercises = { cardio: cardioExercises || [] }
          }

          return { ...plan, exercises }
        })
      )

      return res.json({ success: true, data: { workoutPlans: plansWithExercises } })
    }

    if (req.method === 'POST') {
      const { date_key, training_type } = req.body

      if (!date_key || !training_type) {
        return res.status(400).json({ error: 'date_key and training_type are required' })
      }

      if (!['cardio', 'strength'].includes(training_type)) {
        return res.status(400).json({ error: 'training_type must be cardio or strength' })
      }

      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: auth.userId,
          date_key,
          training_type,
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, data: { workoutPlan: data } })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Fitness plans API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
