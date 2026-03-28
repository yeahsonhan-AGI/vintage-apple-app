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
