import type { ApiResponse } from '../types'

// Use relative '/api' path in all environments
// Vite dev server will proxy '/api' to Express backend on port 3000
// In production, '/api' will be handled by serverless functions or backend
const API_URL = '/api'

// Log API configuration for debugging
console.log('API Configuration:', { API_URL, DEV: import.meta.env.DEV, MODE: import.meta.env.MODE })

// Debug: Check localStorage availability
try {
  localStorage.setItem('__test__', 'test')
  localStorage.removeItem('__test__')
  console.log('localStorage is available')
} catch (e) {
  console.error('localStorage is NOT available:', e)
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const allStorage = { ...localStorage }
      console.log('All localStorage items:', allStorage)
      const token = localStorage.getItem('token')
      console.log(`API Request: ${endpoint}`, token ? `has token (${token.substring(0, 20)}...)` : 'NO TOKEN')
      console.log(`Full URL: ${API_URL}${endpoint}`)

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`API Error: ${endpoint}`, response.status, data)
        return { success: false, error: data.error || 'Request failed' }
      }

      console.log(`API Success: ${endpoint}`, data)
      return data as ApiResponse<T>
    } catch (error) {
      console.error(`API Exception:`, error)
      console.error(`Exception details:`, (error as Error).message, (error as Error).stack)
      return { success: false, error: (error as Error).message }
    }
  }

  // Auth
  async signUp(email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signOut() {
    return this.request('/auth/signout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request<{ user: { id: string; email: string } }>('/auth/me')
  }

  // Notes
  async getNotes() {
    return this.request('/notes')
  }

  async createNote(note: { title: string; content: string }) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    })
  }

  async updateNote(id: string, updates: { title?: string; content?: string }) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    })
  }

  // Calendar Todos
  async getTodos(dateKey?: string) {
    const url = dateKey ? `/calendar/todos?date=${dateKey}` : '/calendar/todos'
    return this.request(url)
  }

  async createTodo(todo: { date_key: string; title: string }) {
    return this.request('/calendar/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    })
  }

  async updateTodo(id: string, updates: { completed?: boolean; title?: string }) {
    return this.request(`/calendar/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTodo(id: string) {
    return this.request(`/calendar/todos/${id}`, {
      method: 'DELETE',
    })
  }

  // Food Logs
  async getFoodLogs(dateKey?: string) {
    const url = dateKey ? `/food/logs?date=${dateKey}` : '/food/logs'
    return this.request(url)
  }

  async createFoodLog(log: {
    date_key: string
    meal_name: string
    calories: number
    category: string
    image: string
    meal_type: string
  }) {
    return this.request('/food/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    })
  }

  async deleteFoodLog(id: string) {
    return this.request(`/food/logs/${id}`, {
      method: 'DELETE',
    })
  }

  async getDailySummary(dateKey: string) {
    return this.request(`/food/summary/${dateKey}`)
  }

  // Analyze food image with AI
  async analyzeFood(image: string) {
    return this.request('/food/analyze', {
      method: 'POST',
      body: JSON.stringify({ image }),
    })
  }

  // Fitness - Workout Plans
  async getWorkoutPlans(dateKey?: string) {
    const url = dateKey ? `/fitness/plans?date=${dateKey}` : '/fitness/plans'
    return this.request(url)
  }

  async createWorkoutPlan(plan: { date_key: string; training_type: 'cardio' | 'strength' }) {
    return this.request('/fitness/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    })
  }

  // Fitness - Strength Exercises
  async createStrengthExercise(exercise: {
    workout_plan_id: string
    body_part: string
    exercise_name: string
    equipment: string
    sets: number
    reps: number
    weight?: number
    notes?: string
  }) {
    return this.request('/fitness/strength-exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    })
  }

  async deleteStrengthExercise(id: string) {
    return this.request(`/fitness/strength-exercises/${id}`, {
      method: 'DELETE',
    })
  }

  // Fitness - Cardio Exercises
  async createCardioExercise(exercise: {
    workout_plan_id: string
    exercise_type: string
    duration_minutes: number
    distance_km?: number
    calories_burned?: number
    intensity_level?: string
    notes?: string
  }) {
    return this.request('/fitness/cardio-exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    })
  }

  async deleteCardioExercise(id: string) {
    return this.request(`/fitness/cardio-exercises/${id}`, {
      method: 'DELETE',
    })
  }

  // Fitness - Statistics
  async getFitnessStats(period: 'week' | 'month' = 'week') {
    return this.request(`/fitness/stats?period=${period}`)
  }

  // ============================================
  // FITNESS ENHANCED - TEMPLATES
  // ============================================

  async getTemplates(trainingType?: 'strength' | 'cardio') {
    const url = trainingType ? `/fitness/templates?training_type=${trainingType}` : '/fitness/templates'
    return this.request(url)
  }

  async getTemplate(id: string) {
    return this.request(`/fitness/templates/${id}`)
  }

  async createTemplate(template: {
    name: string
    description?: string
    training_type: 'strength' | 'cardio'
    exercises: any[]
  }) {
    return this.request('/fitness/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  }

  async updateTemplate(id: string, template: {
    name?: string
    description?: string
    exercises?: any[]
  }) {
    return this.request(`/fitness/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    })
  }

  async deleteTemplate(id: string) {
    return this.request(`/fitness/templates/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // FITNESS ENHANCED - PERSONAL RECORDS
  // ============================================

  async getPersonalRecords(trainingType?: 'strength' | 'cardio', bodyPart?: string) {
    let url = '/fitness/pr'
    const params = new URLSearchParams()
    if (trainingType) params.append('training_type', trainingType)
    if (bodyPart) params.append('body_part', bodyPart)
    if (params.toString()) url += `?${params.toString()}`
    return this.request(url)
  }

  async getExercisePR(exerciseName: string) {
    return this.request(`/fitness/pr/${encodeURIComponent(exerciseName)}`)
  }

  // ============================================
  // FITNESS ENHANCED - CALENDAR
  // ============================================

  async getFitnessCalendar(month: number, year: number) {
    return this.request(`/fitness/calendar?month=${month}&year=${year}`)
  }

  async getWorkoutByDate(dateKey: string) {
    return this.request(`/fitness/workout/${dateKey}`)
  }

  // ============================================
  // FITNESS ENHANCED - EXERCISE HISTORY
  // ============================================

  async getExerciseHistory(exerciseName: string, trainingType: 'strength' | 'cardio') {
    return this.request(`/fitness/exercise-history/${encodeURIComponent(exerciseName)}?training_type=${trainingType}`)
  }

  // ============================================
  // FITNESS ENHANCED - TRENDS
  // ============================================

  async getFitnessTrends(period: 'week' | 'month' | 'quarter' = 'month', exerciseName?: string) {
    let url = `/fitness/trends?period=${period}`
    if (exerciseName) url += `&exercise_name=${encodeURIComponent(exerciseName)}`
    return this.request(url)
  }

  // ============================================
  // FITNESS ENHANCED - WORKOUT FROM TEMPLATE
  // ============================================

  async createWorkoutFromTemplate(templateId: string, dateKey: string) {
    return this.request('/fitness/workout-from-template', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, date_key: dateKey }),
    })
  }

  async completeWorkout(workoutPlanId: string) {
    return this.request(`/fitness/workout/${workoutPlanId}/complete`, {
      method: 'POST',
    })
  }
}

export const api = new ApiClient()
