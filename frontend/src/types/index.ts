// Auth Types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Note Types
export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

// Calendar Todo Types
export interface CalendarTodo {
  id: string
  user_id: string
  date_key: string
  title: string
  completed: boolean
  created_at: string
}

// Food Log Types
export interface FoodLog {
  id: string
  user_id: string
  date_key: string
  meal_name: string
  calories: number
  category: string
  image: string
  meal_type: string
  created_at: string
  ai_analyzed?: boolean
  nutrition_info?: NutritionInfo
  ai_confidence?: string
  ai_description?: string
  analyzed_at?: string
}

export interface NutritionInfo {
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
  sugar_g?: number
}

export interface FoodAnalysisResult {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
  sugar_g?: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  confidence: 'high' | 'medium' | 'low'
  description: string
}

export interface AnalyzeFoodResponse {
  success: boolean
  data?: FoodAnalysisResult
  error?: string
}

export interface DailyFoodSummary {
  id: string
  user_id: string
  date_key: string
  total_calories: number
  meal_count: number
  updated_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Mini App Types
export interface MiniApp {
  id: string
  title: string
  iconClass: string
  iconColor: string
}

// ============================================
// FITNESS TYPES
// ============================================

export interface WorkoutPlan {
  id: string
  user_id: string
  date_key: string
  training_type: 'strength' | 'cardio'
  template_id?: string
  notes?: string
  completed_at?: string
  created_at: string
  exercises?: {
    strength?: StrengthExercise[]
    cardio?: CardioExercise[]
  }
}

export interface StrengthExercise {
  id: string
  workout_plan_id: string
  body_part: string
  exercise_name: string
  equipment: string
  sets: number
  reps: number
  weight?: number
  notes?: string
  order_index: number
  created_at: string
}

export interface CardioExercise {
  id: string
  workout_plan_id: string
  exercise_type: string
  duration_minutes: number
  distance_km?: number
  calories_burned?: number
  intensity_level?: string
  notes?: string
  created_at: string
}

export interface WorkoutTemplate {
  id: string
  user_id?: string
  name: string
  description?: string
  training_type: 'strength' | 'cardio'
  is_system: boolean
  created_at: string
  updated_at: string
  template_exercises?: TemplateExercise[]
}

export interface TemplateExercise {
  id: string
  template_id: string
  body_part?: string
  exercise_name: string
  equipment?: string
  sets?: number
  reps?: number
  weight?: number
  exercise_type?: string
  duration_minutes?: number
  distance_km?: number
  calories_burned?: number
  intensity_level?: string
  notes?: string
  order_index: number
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_name: string
  body_part?: string
  training_type: 'strength' | 'cardio'
  max_weight?: number
  max_sets?: number
  max_reps?: number
  max_volume?: number
  max_duration_minutes?: number
  max_distance_km?: number
  max_calories_burned?: number
  achieved_at: string
  workout_plan_id?: string
  created_at: string
  updated_at: string
}

export interface FitnessCalendar {
  id: string
  date_key: string
  training_type: 'strength' | 'cardio'
  completed_at?: string
}

export interface ExerciseHistory {
  id: string
  workout_plan_id: string
  date_key: string
  body_part?: string
  exercise_name?: string
  equipment?: string
  sets?: number
  reps?: number
  weight?: number
  exercise_type?: string
  duration_minutes?: number
  distance_km?: number
  calories_burned?: number
  intensity_level?: string
  notes?: string
}

export interface FitnessTrends {
  period: string
  strength_trends: Array<{
    exercise_name: string
    data: Array<{
      date: string
      weight?: number
      sets?: number
      reps?: number
      volume: number
    }>
  }>
  cardio_trends: Array<{
    exercise_type: string
    data: Array<{
      date: string
      duration: number
      distance?: number
      calories?: number
    }>
  }>
  frequency: Array<{
    date: string
    count: number
  }>
}
