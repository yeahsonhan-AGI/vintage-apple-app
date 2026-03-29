import type { ApiResponse } from '../types'

const API_URL = '/api'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token')
      console.log(`API Request: ${endpoint}`, token ? 'has token' : 'NO TOKEN')

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
    const url = dateKey ? `/calendar?date=${dateKey}` : '/calendar'
    return this.request(url)
  }

  async createTodo(todo: { date_key: string; title: string }) {
    return this.request('/calendar', {
      method: 'POST',
      body: JSON.stringify(todo),
    })
  }

  async updateTodo(id: string, updates: { completed?: boolean; title?: string }) {
    return this.request(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTodo(id: string) {
    return this.request(`/calendar/${id}`, {
      method: 'DELETE',
    })
  }

  // Food Logs
  async getFoodLogs(dateKey?: string) {
    const url = dateKey ? `/food?date=${dateKey}` : '/food'
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
    return this.request('/food', {
      method: 'POST',
      body: JSON.stringify(log),
    })
  }

  async deleteFoodLog(id: string) {
    return this.request(`/food/${id}`, {
      method: 'DELETE',
    })
  }

  async getDailySummary(dateKey: string) {
    return this.request(`/food/${dateKey}`)
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
    const url = dateKey ? `/fitness?date=${dateKey}` : '/fitness'
    return this.request(url)
  }

  async createWorkoutPlan(plan: { date_key: string; training_type: 'cardio' | 'strength' }) {
    return this.request('/fitness', {
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
    return this.request('/fitness/strength', {
      method: 'POST',
      body: JSON.stringify(exercise),
    })
  }

  async deleteStrengthExercise(id: string) {
    return this.request(`/fitness/strength/${id}`, {
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
    return this.request('/fitness/cardio', {
      method: 'POST',
      body: JSON.stringify(exercise),
    })
  }

  async deleteCardioExercise(id: string) {
    return this.request(`/fitness/cardio/${id}`, {
      method: 'DELETE',
    })
  }

  // Fitness - Statistics
  async getFitnessStats(period: 'week' | 'month' = 'week') {
    return this.request(`/fitness?period=${period}`)
  }
}

export const api = new ApiClient()
