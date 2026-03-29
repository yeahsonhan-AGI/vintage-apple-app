import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, corsHeaders } from './_lib/supabase.js'

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
    const pathParts = url.pathname.split('/').filter(Boolean)
    // pathParts: ['api', 'fitness', ...rest]
    // rest[0] could be: 'strength', 'cardio', or an id for DELETE

    const rest = pathParts.slice(2) // Remove 'api' and 'fitness'

    // GET /api/fitness?period=week - Get stats or plans
    if (req.method === 'GET' && rest.length === 0) {
      const { period, date } = url.searchParams

      // If period is specified, return stats
      if (period) {
        let startDate = new Date()
        if (period === 'week') {
          startDate.setDate(startDate.getDate() - 7)
        } else if (period === 'month') {
          startDate.setMonth(startDate.getMonth() - 1)
        } else {
          startDate.setDate(startDate.getDate() - 7)
        }

        const startDateKey = startDate.toISOString().split('T')[0]

        const { data: plans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id, training_type, date_key, created_at')
          .eq('user_id', userId)
          .gte('date_key', startDateKey)
          .order('date_key', { ascending: true })

        if (plansError) throw plansError

        const planIds = (plans || []).map(p => p.id)
        let totalStrengthSets = 0
        let totalCardioMinutes = 0

        if (planIds.length > 0) {
          const { data: strengthExercises } = await supabase
            .from('strength_exercises')
            .select('sets')
            .in('workout_plan_id', planIds)

          totalStrengthSets = (strengthExercises || []).reduce((sum, e) => sum + (e.sets || 0), 0)

          const { data: cardioExercises } = await supabase
            .from('cardio_exercises')
            .select('duration_minutes')
            .in('workout_plan_id', planIds)

          totalCardioMinutes = (cardioExercises || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
        }

        const stats = {
          period: period || 'week',
          totalWorkouts: plans?.length || 0,
          totalStrengthSets,
          totalCardioMinutes,
          strengthWorkouts: plans?.filter(p => p.training_type === 'strength').length || 0,
          cardioWorkouts: plans?.filter(p => p.training_type === 'cardio').length || 0,
        }

        return res.json({ success: true, data: { stats } })
      }

      // Otherwise return workout plans for a date
      let query = supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
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

    // POST /api/fitness - Create workout plan
    if (req.method === 'POST' && rest.length === 0) {
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
          user_id: userId,
          date_key,
          training_type,
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, data: { workoutPlan: data } })
    }

    // POST /api/fitness/strength - Add strength exercise
    if (req.method === 'POST' && rest[0] === 'strength') {
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

    // POST /api/fitness/cardio - Add cardio exercise
    if (req.method === 'POST' && rest[0] === 'cardio') {
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

    // DELETE /api/fitness/strength/[id] or /api/fitness/cardio/[id]
    if (req.method === 'DELETE' && rest.length === 2) {
      const [type, id] = rest
      const table = type === 'strength' ? 'strength_exercises' : type === 'cardio' ? 'cardio_exercises' : null

      if (table && id) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)

        if (error) throw error

        return res.json({ success: true, message: 'Exercise deleted' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Fitness API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
