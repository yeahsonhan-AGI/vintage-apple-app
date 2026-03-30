import { api } from './api'
import type { ExerciseHistory, PersonalRecord, StrengthExercise, CardioExercise } from '../types'

// ============================================
// SMART HISTORY FILLING
// ============================================

export interface FilledExerciseData {
  weight?: number
  sets?: number
  reps?: number
  duration?: number
  distance?: number
  calories?: number
  notes?: string
  lastWorkoutDate?: string
}

/**
 * Get the most recent exercise data for smart filling
 * This helps users quickly input their workout by pre-filling with their last session's data
 */
export async function getLastExerciseData(
  exerciseName: string,
  trainingType: 'strength' | 'cardio'
): Promise<FilledExerciseData | null> {
  try {
    const response = await api.getExerciseHistory(exerciseName, trainingType)

    if (response.success && response.data?.history && response.data.history.length > 0) {
      const lastExercise = response.data.history[0]
      const lastWorkout = (lastExercise as any).workout_plans

      if (trainingType === 'strength') {
        return {
          weight: lastExercise.weight,
          sets: lastExercise.sets,
          reps: lastExercise.reps,
          notes: lastExercise.notes,
          lastWorkoutDate: lastWorkout?.date_key,
        }
      } else {
        return {
          duration: lastExercise.duration_minutes,
          distance: lastExercise.distance_km,
          calories: lastExercise.calories_burned,
          notes: lastExercise.notes,
          lastWorkoutDate: lastWorkout?.date_key,
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error getting last exercise data:', error)
    return null
  }
}

/**
 * Get all personal records for a user
 */
export async function getPersonalRecords(
  trainingType?: 'strength' | 'cardio',
  bodyPart?: string
): Promise<PersonalRecord[]> {
  try {
    const response = await api.getPersonalRecords(trainingType, bodyPart)
    if (response.success && response.data?.personalRecords) {
      return response.data.personalRecords
    }
    return []
  } catch (error) {
    console.error('Error getting personal records:', error)
    return []
  }
}

/**
 * Check if an exercise is a personal record
 */
export function isPersonalRecord(
  exercise: StrengthExercise | CardioExercise,
  personalRecords: PersonalRecord[]
): boolean {
  if (exercise.workout_plan_id) {
    return personalRecords.some(
      pr => pr.workout_plan_id === exercise.workout_plan_id
    )
  }
  return false
}

/**
 * Calculate if this is a new PR
 */
export function calculateIfNewPR(
  exercise: StrengthExercise | CardioExercise,
  currentPR?: PersonalRecord | null
): { isPR: boolean; prType?: string } {
  if (!currentPR) {
    return { isPR: true, prType: 'First time!' }
  }

  if ('weight' in exercise) {
    // Strength exercise
    const strengthEx = exercise as StrengthExercise

    // Check weight PR
    if (strengthEx.weight && (!currentPR.max_weight || strengthEx.weight > currentPR.max_weight)) {
      return { isPR: true, prType: 'Weight PR!' }
    }

    // Check volume PR
    const volume = (strengthEx.weight || 0) * strengthEx.sets * strengthEx.reps
    if (!currentPR.max_volume || volume > currentPR.max_volume) {
      return { isPR: true, prType: 'Volume PR!' }
    }

    // Check sets PR
    if (!currentPR.max_sets || strengthEx.sets > currentPR.max_sets) {
      return { isPR: true, prType: 'Sets PR!' }
    }

    // Check reps PR
    if (!currentPR.max_reps || strengthEx.reps > currentPR.max_reps) {
      return { isPR: true, prType: 'Reps PR!' }
    }
  } else {
    // Cardio exercise
    const cardioEx = exercise as CardioExercise

    // Check duration PR
    if (!currentPR.max_duration_minutes || cardioEx.duration_minutes > currentPR.max_duration_minutes) {
      return { isPR: true, prType: 'Duration PR!' }
    }

    // Check distance PR
    if (cardioEx.distance_km && (!currentPR.max_distance_km || cardioEx.distance_km > currentPR.max_distance_km)) {
      return { isPR: true, prType: 'Distance PR!' }
    }

    // Check calories PR
    if (cardioEx.calories_burned && (!currentPR.max_calories_burned || cardioEx.calories_burned > currentPR.max_calories_burned)) {
      return { isPR: true, prType: 'Calories PR!' }
    }
  }

  return { isPR: false }
}

/**
 * Format PR display text
 */
export function formatPRDisplay(pr?: PersonalRecord | null, trainingType?: 'strength' | 'cardio'): string {
  if (!pr) return 'No PR yet'

  if (trainingType === 'strength' || pr.training_type === 'strength') {
    if (pr.max_weight) return `${pr.max_weight} kg`
    if (pr.max_volume) return `${pr.max_volume} kg vol`
    if (pr.max_sets) return `${pr.max_sets} sets`
    if (pr.max_reps) return `${pr.max_reps} reps`
  } else {
    if (pr.max_duration_minutes) return `${pr.max_duration_minutes} min`
    if (pr.max_distance_km) return `${pr.max_distance_km} km`
    if (pr.max_calories_burned) return `${pr.max_calories_burned} cal`
  }

  return 'PR set!'
}

/**
 * Compare current workout with previous workout
 */
export function compareWithPreviousWorkout(
  currentExercises: (StrengthExercise | CardioExercise)[],
  previousExercises: (StrengthExercise | CardioExercise)[]
): {
  totalVolume: { current: number; previous: number; diff: number }
  exerciseCount: { current: number; previous: number; diff: number }
  improvements: string[]
} {
  const currentTotal = calculateTotalVolume(currentExercises)
  const previousTotal = calculateTotalVolume(previousExercises)

  const improvements: string[] = []

  if (currentTotal > previousTotal) {
    const diff = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(0)
    improvements.push(`Volume up ${diff}%`)
  }

  return {
    totalVolume: {
      current: currentTotal,
      previous: previousTotal,
      diff: currentTotal - previousTotal,
    },
    exerciseCount: {
      current: currentExercises.length,
      previous: previousExercises.length,
      diff: currentExercises.length - previousExercises.length,
    },
    improvements,
  }
}

/**
 * Calculate total workout volume
 */
function calculateTotalVolume(exercises: (StrengthExercise | CardioExercise)[]): number {
  return exercises.reduce((total, ex) => {
    if ('weight' in ex) {
      return total + ((ex.weight || 0) * ex.sets * ex.reps)
    } else {
      return total + (ex.duration_minutes || 0)
    }
  }, 0)
}

/**
 * Get body part color for UI
 */
export function getBodyPartColor(bodyPart: string): string {
  const colors: Record<string, string> = {
    chest: '#FFB5C5',      // q-pink
    back: '#A8D8EA',       // q-blue
    legs: '#C5E8C0',       // q-mint
    shoulders: '#FFF4BD',  // q-yellow
    arms: '#FFDAB9',       // q-peach
    core: '#E8D5F2',       // q-lavender
    cardio: '#FF9E9E',     // q-coral
  }
  return colors[bodyPart.toLowerCase()] || '#B8E4F0' // q-sky default
}

/**
 * Format date key for display
 */
export function formatDateKeyDisplay(dateKey: string): string {
  const date = new Date(dateKey)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateKey === formatDateKey(today)) {
    return 'Today'
  } else if (dateKey === formatDateKey(yesterday)) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

/**
 * Format date to date key (YYYY-MM-DD)
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get workout streak (consecutive days)
 */
export function getWorkoutStreak(workoutDates: string[]): number {
  if (workoutDates.length === 0) return 0

  const sortedDates = [...workoutDates].sort().reverse()
  const today = formatDateKey(new Date())
  let streak = 0
  let currentDate = new Date()

  // Check if there's a workout today or yesterday to start the streak
  const startIndex = sortedDates.indexOf(today) >= 0 ? 0 : (sortedDates.indexOf(formatDateKey(new Date(Date.now() - 86400000))) >= 0 ? 0 : -1)

  if (startIndex === -1) return 0

  for (let i = startIndex; i < sortedDates.length; i++) {
    const expectedDate = formatDateKey(currentDate)
    if (sortedDates[i] === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (i > startIndex) {
      break
    }
  }

  return streak
}
