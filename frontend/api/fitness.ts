import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getUserId(req: VercelRequest): string | null {
  // Try both lowercase and uppercase header names
  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
  console.log('Fitness API - Auth header present:', !!authHeader)
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Fitness API - Token verification failed:', error)
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

    const apiIndex = pathParts.findIndex(p => p === 'api')
    if (apiIndex === -1) {
      return res.status(404).json({ error: 'Not found' })
    }

    const resource = pathParts[apiIndex + 1] || '' // 'fitness'
    const action = pathParts[apiIndex + 2] || '' // 'plans', 'stats', 'strength-exercises', 'cardio-exercises'
    const id = pathParts[apiIndex + 3] || ''

    if (resource !== 'fitness') {
      return res.status(404).json({ error: 'Not found' })
    }

    // GET /api/fitness/stats?period=week - Get stats
    if (req.method === 'GET' && action === 'stats') {
      const params = getQueryParams(req)
      const period = params.period || 'week'

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
        period,
        totalWorkouts: plans?.length || 0,
        totalStrengthSets,
        totalCardioMinutes,
        strengthWorkouts: plans?.filter(p => p.training_type === 'strength').length || 0,
        cardioWorkouts: plans?.filter(p => p.training_type === 'cardio').length || 0,
      }

      return res.json({ success: true, data: stats })
    }

    // GET /api/fitness/plans?date=xxx - Get workout plans
    if (req.method === 'GET' && (action === 'plans' || action === '')) {
      const params = getQueryParams(req)
      const date = params.date

      let query = supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('date_key', { ascending: false })

      if (date) {
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

      return res.json({ success: true, data: plansWithExercises })
    }

    // POST /api/fitness/plans - Create workout plan
    if (req.method === 'POST' && (action === 'plans' || action === '')) {
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

      return res.status(201).json({ success: true, data })
    }

    // POST /api/fitness/strength-exercises - Add strength exercise
    if (req.method === 'POST' && action === 'strength-exercises') {
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

      return res.status(201).json({ success: true, data })
    }

    // DELETE /api/fitness/strength-exercises/[id] - Delete strength exercise
    if (req.method === 'DELETE' && action === 'strength-exercises' && id) {
      const { error } = await supabase
        .from('strength_exercises')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.json({ success: true, message: 'Exercise deleted' })
    }

    // POST /api/fitness/cardio-exercises - Add cardio exercise
    if (req.method === 'POST' && action === 'cardio-exercises') {
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

      return res.status(201).json({ success: true, data })
    }

    // DELETE /api/fitness/cardio-exercises/[id] - Delete cardio exercise
    if (req.method === 'DELETE' && action === 'cardio-exercises' && id) {
      const { error } = await supabase
        .from('cardio_exercises')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.json({ success: true, message: 'Exercise deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Fitness API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
