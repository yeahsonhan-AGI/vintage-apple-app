import { Router } from 'express'
import { supabase } from '../config'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// ============================================
// WORKOUT TEMPLATES
// ============================================

// Get all templates (system + user's custom templates)
router.get('/templates', async (req: AuthRequest, res) => {
  try {
    const { training_type } = req.query

    let query = supabase
      .from('workout_templates')
      .select('*, template_exercises(*)')
      .or(`user_id.eq.${req.userId},is_system.eq.true`)

    if (training_type && typeof training_type === 'string') {
      query = query.eq('training_type', training_type)
    }

    const { data, error } = await query.order('is_system', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: { templates: data } })
  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// Get a single template with exercises
router.get('/templates/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, template_exercises(*)')
      .eq('id', id)
      .or(`user_id.eq.${req.userId},is_system.eq.true`)
      .single()

    if (error) throw error

    res.json({ success: true, data: { template: data } })
  } catch (error) {
    console.error('Get template error:', error)
    res.status(500).json({ error: 'Failed to fetch template' })
  }
})

// Create a custom template
router.post('/templates', async (req: AuthRequest, res) => {
  try {
    const { name, description, training_type, exercises } = req.body

    if (!name || !training_type || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        user_id: req.userId,
        name,
        description: description || null,
        training_type,
        is_system: false,
      })
      .select()
      .single()

    if (templateError) throw templateError

    // Create exercises
    if (exercises.length > 0) {
      const exercisesWithTemplateId = exercises.map((ex: any, index: number) => ({
        template_id: template.id,
        ...ex,
        order_index: index,
      }))

      const { error: exercisesError } = await supabase
        .from('template_exercises')
        .insert(exercisesWithTemplateId)

      if (exercisesError) throw exercisesError
    }

    res.status(201).json({ success: true, data: { template } })
  } catch (error) {
    console.error('Create template error:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
})

// Update a template
router.put('/templates/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { name, description, exercises } = req.body

    // Verify ownership
    const { data: existing } = await supabase
      .from('workout_templates')
      .select('user_id, is_system')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== req.userId || existing.is_system) {
      return res.status(403).json({ error: 'Cannot modify system templates or templates you do not own' })
    }

    // Update template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (templateError) throw templateError

    // Update exercises if provided
    if (exercises && Array.isArray(exercises)) {
      // Delete existing exercises
      await supabase
        .from('template_exercises')
        .delete()
        .eq('template_id', id)

      // Insert new exercises
      if (exercises.length > 0) {
        const exercisesWithTemplateId = exercises.map((ex: any, index: number) => ({
          template_id: id,
          ...ex,
          order_index: index,
        }))

        const { error: exercisesError } = await supabase
          .from('template_exercises')
          .insert(exercisesWithTemplateId)

        if (exercisesError) throw exercisesError
      }
    }

    res.json({ success: true, data: { template } })
  } catch (error) {
    console.error('Update template error:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})

// Delete a template
router.delete('/templates/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: existing } = await supabase
      .from('workout_templates')
      .select('user_id, is_system')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== req.userId || existing.is_system) {
      return res.status(403).json({ error: 'Cannot delete system templates or templates you do not own' })
    }

    await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id)

    res.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    console.error('Delete template error:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

// ============================================
// PERSONAL RECORDS
// ============================================

// Get all personal records
router.get('/pr', async (req: AuthRequest, res) => {
  try {
    const { training_type, body_part } = req.query

    let query = supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', req.userId)

    if (training_type && typeof training_type === 'string') {
      query = query.eq('training_type', training_type)
    }

    if (body_part && typeof body_part === 'string') {
      query = query.eq('body_part', body_part)
    }

    const { data, error } = await query.order('achieved_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: { personalRecords: data } })
  } catch (error) {
    console.error('Get PRs error:', error)
    res.status(500).json({ error: 'Failed to fetch personal records' })
  }
})

// Get PR history for a specific exercise
router.get('/pr/:exerciseName', async (req: AuthRequest, res) => {
  try {
    const { exerciseName } = req.params

    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', req.userId)
      .eq('exercise_name', exerciseName)
      .order('achieved_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({ success: true, data: { personalRecord: data } })
  } catch (error) {
    console.error('Get exercise PR error:', error)
    res.status(500).json({ error: 'Failed to fetch exercise PR' })
  }
})

// ============================================
// WORKOUT HISTORY FOR CALENDAR
// ============================================

// Get workout calendar data for a month
router.get('/calendar', async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query

    const now = new Date()
    const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1
    const targetYear = year ? parseInt(year as string) : now.getFullYear()

    const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('workout_plans')
      .select('id, date_key, training_type, completed_at')
      .eq('user_id', req.userId)
      .gte('date_key', startDate)
      .lte('date_key', endDate)
      .order('date_key', { ascending: true })

    if (error) throw error

    res.json({ success: true, data: { calendar: data } })
  } catch (error) {
    console.error('Get calendar data error:', error)
    res.status(500).json({ error: 'Failed to fetch calendar data' })
  }
})

// Get workout detail for a specific date
router.get('/workout/:dateKey', async (req: AuthRequest, res) => {
  try {
    const { dateKey } = req.params

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date_key', dateKey)

    if (plansError) throw plansError

    const plansWithExercises = await Promise.all(
      (plans || []).map(async (plan) => {
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

    res.json({ success: true, data: { workouts: plansWithExercises } })
  } catch (error) {
    console.error('Get workout detail error:', error)
    res.status(500).json({ error: 'Failed to fetch workout detail' })
  }
})

// ============================================
// EXERCISE HISTORY (for smart filling)
// ============================================

// Get previous exercise data for smart filling
router.get('/exercise-history/:exerciseName', async (req: AuthRequest, res) => {
  try {
    const { exerciseName } = req.params
    const { training_type } = req.query

    if (!training_type || typeof training_type !== 'string') {
      return res.status(400).json({ error: 'training_type is required' })
    }

    const tableName = training_type === 'strength' ? 'strength_exercises' : 'cardio_exercises'

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('workout_plan_id', supabase.from('workout_plans').select('id').eq('user_id', req.userId))

    // Get the most recent occurrence of this exercise
    let query: any
    if (training_type === 'strength') {
      query = supabase
        .from('strength_exercises')
        .select('*, workout_plans!inner(date_key, user_id)')
        .eq('exercise_name', exerciseName)
        .eq('workout_plans.user_id', req.userId)
        .order('workout_plans.date_key', { ascending: false })
        .limit(5)
    } else {
      query = supabase
        .from('cardio_exercises')
        .select('*, workout_plans!inner(date_key, user_id)')
        .eq('exercise_type', exerciseName)
        .eq('workout_plans.user_id', req.userId)
        .order('workout_plans.date_key', { ascending: false })
        .limit(5)
    }

    const { data: history, error: historyError } = await query

    if (historyError) throw historyError

    res.json({ success: true, data: { history: history || [] } })
  } catch (error) {
    console.error('Get exercise history error:', error)
    res.status(500).json({ error: 'Failed to fetch exercise history' })
  }
})

// ============================================
// PROGRESS TRENDS
// ============================================

// Get progress trends data
router.get('/trends', async (req: AuthRequest, res) => {
  try {
    const { period, exercise_name } = req.query
    const targetPeriod = (period as string) || 'month'

    let startDate = new Date()
    if (targetPeriod === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (targetPeriod === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (targetPeriod === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3)
    } else {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const startDateKey = startDate.toISOString().split('T')[0]

    // Get all workout plans in the period
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('id, date_key, training_type')
      .eq('user_id', req.userId)
      .gte('date_key', startDateKey)
      .order('date_key', { ascending: true })

    if (plansError) throw plansError

    const planIds = (plans || []).map(p => p.id)

    // Get strength exercise trends
    const strengthTrends: any[] = []
    const cardioTrends: any[] = []

    if (planIds.length > 0) {
      // Strength trends
      const { data: strengthData } = await supabase
        .from('strength_exercises')
        .select('*, workout_plans!inner(date_key)')
        .in('workout_plan_id', planIds)
        .order('workout_plans.date_key', { ascending: true })

      if (strengthData) {
        // Group by exercise name
        const exerciseGroups = strengthData.reduce((acc: any, ex: any) => {
          if (!acc[ex.exercise_name]) {
            acc[ex.exercise_name] = []
          }
          acc[ex.exercise_name].push({
            date: ex.workout_plans.date_key,
            weight: ex.weight,
            sets: ex.sets,
            reps: ex.reps,
            volume: (ex.weight || 0) * ex.sets * ex.reps,
          })
          return acc
        }, {})

        Object.keys(exerciseGroups).forEach(exerciseName => {
          if (!exercise_name || exercise_name === exerciseName) {
            strengthTrends.push({
              exercise_name: exerciseName,
              data: exerciseGroups[exerciseName],
            })
          }
        })
      }

      // Cardio trends
      const { data: cardioData } = await supabase
        .from('cardio_exercises')
        .select('*, workout_plans!inner(date_key)')
        .in('workout_plan_id', planIds)
        .order('workout_plans.date_key', { ascending: true })

      if (cardioData) {
        const exerciseGroups = cardioData.reduce((acc: any, ex: any) => {
          if (!acc[ex.exercise_type]) {
            acc[ex.exercise_type] = []
          }
          acc[ex.exercise_type].push({
            date: ex.workout_plans.date_key,
            duration: ex.duration_minutes,
            distance: ex.distance_km,
            calories: ex.calories_burned,
          })
          return acc
        }, {})

        Object.keys(exerciseGroups).forEach(exerciseType => {
          if (!exercise_name || exercise_name === exerciseType) {
            cardioTrends.push({
              exercise_type: exerciseType,
              data: exerciseGroups[exerciseType],
            })
          }
        })
      }
    }

    // Get workout frequency by date
    const frequencyMap = (plans || []).reduce((acc: any, plan) => {
      acc[plan.date_key] = (acc[plan.date_key] || 0) + 1
      return acc
    }, {})

    const frequency = Object.keys(frequencyMap).map(date => ({
      date,
      count: frequencyMap[date],
    }))

    res.json({
      success: true,
      data: {
        period: targetPeriod,
        strength_trends: strengthTrends,
        cardio_trends: cardioTrends,
        frequency,
      }
    })
  } catch (error) {
    console.error('Get trends error:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

// ============================================
// CREATE WORKOUT FROM TEMPLATE
// ============================================

// Create a new workout from a template
router.post('/workout-from-template', async (req: AuthRequest, res) => {
  try {
    const { template_id, date_key } = req.body

    if (!template_id || !date_key) {
      return res.status(400).json({ error: 'template_id and date_key are required' })
    }

    // Get template with exercises
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .select('*, template_exercises(*)')
      .eq('id', template_id)
      .or(`user_id.eq.${req.userId},is_system.eq.true`)
      .single()

    if (templateError || !template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    // Create workout plan
    const { data: workoutPlan, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: req.userId,
        date_key,
        training_type: template.training_type,
        template_id: template.id,
      })
      .select()
      .single()

    if (planError) throw planError

    // Create exercises from template
    const exercises = template.template_exercises || []
    const createdExercises: any[] = []

    for (const exercise of exercises) {
      if (template.training_type === 'strength') {
        const { data: newExercise } = await supabase
          .from('strength_exercises')
          .insert({
            workout_plan_id: workoutPlan.id,
            body_part: exercise.body_part,
            exercise_name: exercise.exercise_name,
            equipment: exercise.equipment,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes,
            order_index: exercise.order_index,
          })
          .select()
          .single()

        createdExercises.push(newExercise)
      } else {
        const { data: newExercise } = await supabase
          .from('cardio_exercises')
          .insert({
            workout_plan_id: workoutPlan.id,
            exercise_type: exercise.exercise_type || exercise.exercise_name,
            duration_minutes: exercise.duration_minutes,
            distance_km: exercise.distance_km,
            calories_burned: exercise.calories_burned,
            intensity_level: exercise.intensity_level,
            notes: exercise.notes,
          })
          .select()
          .single()

        createdExercises.push(newExercise)
      }
    }

    res.status(201).json({
      success: true,
      data: {
        workout_plan: {
          ...workoutPlan,
          exercises: {
            [template.training_type]: createdExercises
          }
        }
      }
    })
  } catch (error) {
    console.error('Create workout from template error:', error)
    res.status(500).json({ error: 'Failed to create workout from template' })
  }
})

// ============================================
// COMPLETE WORKOUT
// ============================================

// Mark workout as completed and update personal records
router.post('/workout/:id/complete', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify ownership and get workout details
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', id)
      .single()

    if (!plan || plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Workout not found' })
    }

    // Mark as completed (try-catch in case columns don't exist yet)
    try {
      await supabase
        .from('workout_plans')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', id)
    } catch (e) {
      console.log('Could not update completed_at/status columns (may not exist yet)')
    }

    // Update personal records based on this workout
    try {
      if (plan.training_type === 'strength') {
        // Get all strength exercises for this workout
        const { data: exercises } = await supabase
          .from('strength_exercises')
          .select('*')
          .eq('workout_plan_id', id)

        if (exercises && exercises.length > 0) {
          // For each exercise, check and update PRs
          for (const exercise of exercises) {
            const volume = (exercise.weight || 0) * exercise.sets * exercise.reps

            // Check if a PR exists for this exercise
            const { data: existingPR } = await supabase
              .from('personal_records')
              .select('*')
              .eq('user_id', req.userId)
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
                  .update({ ...updates, achieved_at: new Date().toISOString() })
                  .eq('id', existingPR.id)
              }
            } else {
              // Create new PR
              await supabase
                .from('personal_records')
                .insert({
                  user_id: req.userId,
                  exercise_name: exercise.exercise_name,
                  body_part: exercise.body_part,
                  training_type: 'strength',
                  max_weight: exercise.weight || null,
                  max_sets: exercise.sets || null,
                  max_reps: exercise.reps || null,
                  max_volume: volume,
                  achieved_at: new Date().toISOString()
                })
            }
          }
        }
      } else if (plan.training_type === 'cardio') {
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
              .eq('user_id', req.userId)
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
                  .update({ ...updates, achieved_at: new Date().toISOString() })
                  .eq('id', existingPR.id)
              }
            } else {
              await supabase
                .from('personal_records')
                .insert({
                  user_id: req.userId,
                  exercise_name: exercise.exercise_type,
                  training_type: 'cardio',
                  max_duration_minutes: exercise.duration_minutes || null,
                  max_distance_km: exercise.distance_km || null,
                  achieved_at: new Date().toISOString()
                })
            }
          }
        }
      }
    } catch (prError) {
      // Ignore PR table errors - the table may not exist yet
      console.log('Could not update personal records (table may not exist yet)')
    }

    res.json({ success: true, data: { workout_plan: plan } })
  } catch (error) {
    console.error('Complete workout error:', error)
    res.status(500).json({ error: 'Failed to complete workout' })
  }
})

export default router
