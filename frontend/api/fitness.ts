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

    // GET /api/fitness/trends?period=week|month|quarter - Get fitness trends
    if (req.method === 'GET' && action === 'trends') {
      const params = getQueryParams(req)
      const period = params.period || 'month'
      const exerciseName = params.exercise_name

      let startDate = new Date()
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else if (period === 'quarter') {
        startDate.setMonth(startDate.getMonth() - 3)
      }

      const startDateKey = startDate.toISOString().split('T')[0]

      // Get workout plans in the period
      const { data: plans, error: plansError } = await supabase
        .from('workout_plans')
        .select('id, date_key, training_type')
        .eq('user_id', userId)
        .gte('date_key', startDateKey)
        .order('date_key', { ascending: true })

      if (plansError) throw plansError

      const planIds = (plans || []).map(p => p.id)

      // Get strength trends
      let strengthTrends: any[] = []
      if (planIds.length > 0) {
        let strengthQuery = supabase
          .from('strength_exercises')
          .select('exercise_name, sets, reps, weight')
          .in('workout_plan_id', planIds)

        const { data: strengthExercises } = await strengthQuery

        if (strengthExercises && strengthExercises.length > 0) {
          // Group by exercise name
          const exerciseGroups = strengthExercises.reduce((acc: any, exercise: any) => {
            if (!acc[exercise.exercise_name]) {
              acc[exercise.exercise_name] = []
            }
            acc[exercise.exercise_name].push(exercise)
            return acc
          }, {})

          // Build trends for each exercise
          strengthTrends = Object.entries(exerciseGroups).map(([name, exercises]: [string, any]) => {
            if (exerciseName && name !== exerciseName) return null

            // Get unique dates for this exercise
            const exerciseDates = Array.from(new Set(exercises.map((e: any) => {
              const plan = plans?.find(p => p.id === e.workout_plan_id)
              return plan?.date_key
            })))

            return {
              exercise_name: name,
              data: exerciseDates.map(date => {
                const exercisesOnDate = exercises.filter((e: any) => {
                  const plan = plans?.find(p => p.id === e.workout_plan_id)
                  return plan?.date_key === date
                })
                const totalVolume = exercisesOnDate.reduce((sum: number, e: any) => {
                  return sum + (e.weight || 0) * (e.sets || 0) * (e.reps || 0)
                }, 0)
                const maxWeight = Math.max(...exercisesOnDate.map((e: any) => e.weight || 0))
                const totalSets = exercisesOnDate.reduce((sum: number, e: any) => sum + (e.sets || 0), 0)
                const avgReps = exercisesOnDate.reduce((sum: number, e: any) => sum + (e.reps || 0), 0) / exercisesOnDate.length

                return {
                  date,
                  weight: maxWeight || undefined,
                  sets: totalSets || undefined,
                  reps: avgReps || undefined,
                  volume: totalVolume
                }
              })
            }
          }).filter(Boolean)
        }
      }

      // Get cardio trends
      let cardioTrends: any[] = []
      if (planIds.length > 0) {
        const { data: cardioExercises } = await supabase
          .from('cardio_exercises')
          .select('exercise_type, duration_minutes')
          .in('workout_plan_id', planIds)

        if (cardioExercises && cardioExercises.length > 0) {
          const exerciseGroups = cardioExercises.reduce((acc: any, exercise: any) => {
            if (!acc[exercise.exercise_type]) {
              acc[exercise.exercise_type] = []
            }
            acc[exercise.exercise_type].push(exercise)
            return acc
          }, {})

          cardioTrends = Object.entries(exerciseGroups).map(([name, exercises]: [string, any]) => {
            const exerciseDates = Array.from(new Set(exercises.map((e: any) => {
              const plan = plans?.find(p => p.id === e.workout_plan_id)
              return plan?.date_key
            })))

            return {
              exercise_type: name,
              data: exerciseDates.map(date => {
                const exercisesOnDate = exercises.filter((e: any) => {
                  const plan = plans?.find(p => p.id === e.workout_plan_id)
                  return plan?.date_key === date
                })
                const totalDuration = exercisesOnDate.reduce((sum: number, e: any) => sum + (e.duration_minutes || 0), 0)

                return {
                  date,
                  duration: totalDuration
                }
              })
            }
          })
        }
      }

      return res.json({
        success: true,
        data: {
          period,
          strength_trends: strengthTrends,
          cardio_trends: cardioTrends
        }
      })
    }

    // GET /api/fitness/pr?training_type=strength|cardio&body_part=xxx - Get personal records
    if (req.method === 'GET' && action === 'pr') {
      const params = getQueryParams(req)
      const trainingType = params.training_type as 'strength' | 'cardio' | undefined
      const bodyPart = params.body_part

      try {
        let query = supabase
          .from('personal_records')
          .select('*')
          .eq('user_id', userId)

        if (trainingType) {
          query = query.eq('training_type', trainingType)
        }
        if (bodyPart) {
          query = query.eq('body_part', bodyPart)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        return res.json({ success: true, data: data || [] })
      } catch (error: any) {
        // If table doesn't exist yet, return empty array
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return res.json({ success: true, data: [] })
        }
        throw error
      }
    }

    // POST /api/fitness/workout/[id]/complete - Complete a workout
    if (req.method === 'POST' && action === 'workout' && id && pathParts[apiIndex + 4] === 'complete') {
      // First, verify the workout belongs to the user
      const { data: workout } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' })
      }

      // Try to update the workout to mark it as completed
      // (This may fail if columns don't exist yet, which is OK)
      let updatedWorkout = workout
      try {
        const updateResult = await supabase
          .from('workout_plans')
          .update({
            completed_at: new Date().toISOString(),
            status: 'completed'
          })
          .eq('id', id)
          .select()
          .single()

        if (!updateResult.error) {
          updatedWorkout = updateResult.data
        }
      } catch (e) {
        // Ignore if columns don't exist yet - continue with PR updates
        console.log('Could not update workout completion status (columns may not exist yet)')
      }

      // Update personal records based on this workout
      // This is wrapped in try-catch to handle case where table doesn't exist yet
      try {
        if (workout.training_type === 'strength') {
          // Get all strength exercises for this workout
          const { data: exercises } = await supabase
            .from('strength_exercises')
            .select('*')
            .eq('workout_plan_id', id)

          if (exercises && exercises.length > 0) {
            // For each exercise, check and update PRs
            for (const exercise of exercises) {
              const volume = (exercise.weight || 0) * (exercise.sets || 0) * (exercise.reps || 0)

              // Check if a PR exists for this exercise
              const { data: existingPR } = await supabase
                .from('personal_records')
                .select('*')
                .eq('user_id', userId)
                .eq('exercise_name', exercise.exercise_name)
                .eq('training_type', 'strength')
                .single()

              if (existingPR) {
                // Update PR if this workout has better stats
                const updates: any = {}
                if (exercise.weight && (!existingPR.max_weight || exercise.weight > existingPR.max_weight)) {
                  updates.max_weight = exercise.weight
                }
                if (exercise.sets && (!existingPR.max_sets || exercise.sets > existingPR.max_sets)) {
                  updates.max_sets = exercise.sets
                }
                if (exercise.reps && (!existingPR.max_reps || exercise.reps > existingPR.max_reps)) {
                  updates.max_reps = exercise.reps
                }
                if (!existingPR.max_volume || volume > existingPR.max_volume) {
                  updates.max_volume = volume
                }

                if (Object.keys(updates).length > 0) {
                  await supabase
                    .from('personal_records')
                    .update(updates)
                    .eq('id', existingPR.id)
                }
              } else {
                // Create new PR
                await supabase
                  .from('personal_records')
                  .insert({
                    user_id: userId,
                    exercise_name: exercise.exercise_name,
                    body_part: exercise.body_part,
                    training_type: 'strength',
                    max_weight: exercise.weight || null,
                    max_sets: exercise.sets || null,
                    max_reps: exercise.reps || null,
                    max_volume: volume
                  })
              }
            }
          }
        } else if (workout.training_type === 'cardio') {
          // Get all cardio exercises for this workout
          const { data: exercises } = await supabase
            .from('cardio_exercises')
            .select('*')
            .eq('workout_plan_id', id)

          if (exercises && exercises.length > 0) {
            for (const exercise of exercises) {
              // Check if a PR exists for this exercise type
              const { data: existingPR } = await supabase
                .from('personal_records')
                .select('*')
                .eq('user_id', userId)
                .eq('exercise_name', exercise.exercise_type)
                .eq('training_type', 'cardio')
                .single()

              if (existingPR) {
                const updates: any = {}
                if (exercise.duration_minutes && (!existingPR.max_duration_minutes || exercise.duration_minutes > existingPR.max_duration_minutes)) {
                  updates.max_duration_minutes = exercise.duration_minutes
                }
                if (exercise.distance_km && (!existingPR.max_distance_km || exercise.distance_km > existingPR.max_distance_km)) {
                  updates.max_distance_km = exercise.distance_km
                }

                if (Object.keys(updates).length > 0) {
                  await supabase
                    .from('personal_records')
                    .update(updates)
                    .eq('id', existingPR.id)
                }
              } else {
                await supabase
                  .from('personal_records')
                  .insert({
                    user_id: userId,
                    exercise_name: exercise.exercise_type,
                    training_type: 'cardio',
                    max_duration_minutes: exercise.duration_minutes || null,
                    max_distance_km: exercise.distance_km || null
                  })
              }
            }
          }
        }
      } catch (prError) {
        // Ignore PR table errors - the table may not exist yet
        console.log('Could not update personal records (table may not exist yet)')
      }

      return res.json({ success: true, data: updatedWorkout })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Fitness API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
