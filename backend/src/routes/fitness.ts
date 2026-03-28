import { Router } from 'express'
import { supabase } from '../config'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Get workout plans for a specific date
router.get('/plans', async (req: AuthRequest, res) => {
  try {
    const { date } = req.query

    let query = supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', req.userId)
      .order('date_key', { ascending: false })

    if (date && typeof date === 'string') {
      query = query.eq('date_key', date)
    }

    const { data, error } = await query

    if (error) throw error

    // For each plan, fetch its exercises
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

    res.json({ success: true, data: { workoutPlans: plansWithExercises } })
  } catch (error) {
    console.error('Get workout plans error:', error)
    res.status(500).json({ error: 'Failed to fetch workout plans' })
  }
})

// Create a new workout plan
router.post('/plans', async (req: AuthRequest, res) => {
  try {
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
        user_id: req.userId,
        date_key,
        training_type,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data: { workoutPlan: data } })
  } catch (error) {
    console.error('Create workout plan error:', error)
    res.status(500).json({ error: 'Failed to create workout plan' })
  }
})

// Add strength exercise to a workout plan
router.post('/strength-exercises', async (req: AuthRequest, res) => {
  try {
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

    // Get current count for order_index
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

    res.status(201).json({ success: true, data: { exercise: data } })
  } catch (error) {
    console.error('Create strength exercise error:', error)
    res.status(500).json({ error: 'Failed to create strength exercise' })
  }
})

// Delete strength exercise
router.delete('/strength-exercises/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify ownership through workout plan
    const { data: exercise } = await supabase
      .from('strength_exercises')
      .select('workout_plan_id, workout_plans!inner(user_id)')
      .eq('id', id)
      .single()

    if (!exercise || (exercise as any).workout_plans.user_id !== req.userId) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    const { error } = await supabase
      .from('strength_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ success: true, message: 'Exercise deleted' })
  } catch (error) {
    console.error('Delete strength exercise error:', error)
    res.status(500).json({ error: 'Failed to delete exercise' })
  }
})

// Add cardio exercise to a workout plan
router.post('/cardio-exercises', async (req: AuthRequest, res) => {
  try {
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

    res.status(201).json({ success: true, data: { exercise: data } })
  } catch (error) {
    console.error('Create cardio exercise error:', error)
    res.status(500).json({ error: 'Failed to create cardio exercise' })
  }
})

// Delete cardio exercise
router.delete('/cardio-exercises/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify ownership through workout plan
    const { data: exercise } = await supabase
      .from('cardio_exercises')
      .select('workout_plan_id, workout_plans!inner(user_id)')
      .eq('id', id)
      .single()

    if (!exercise || (exercise as any).workout_plans.user_id !== req.userId) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    const { error } = await supabase
      .from('cardio_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ success: true, message: 'Exercise deleted' })
  } catch (error) {
    console.error('Delete cardio exercise error:', error)
    res.status(500).json({ error: 'Failed to delete exercise' })
  }
})

// Get fitness statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const { period } = req.query
    const userId = req.userId
    console.log('Fitness stats request:', { period, userId })

    let startDate = new Date()
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else {
      // Default to week
      startDate.setDate(startDate.getDate() - 7)
    }

    const startDateKey = startDate.toISOString().split('T')[0]
    console.log('Querying from date:', startDateKey)

    // Get workout plans in the period
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('id, training_type, date_key, created_at')
      .eq('user_id', userId)
      .gte('date_key', startDateKey)
      .order('date_key', { ascending: true })

    console.log('Plans query result:', { plans, plansError })
    if (plansError) throw plansError

    // Get strength exercises count
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

    res.json({ success: true, data: { stats } })
  } catch (error) {
    console.error('Get fitness stats error:', error)
    res.status(500).json({ error: 'Failed to fetch fitness stats' })
  }
})

export default router
