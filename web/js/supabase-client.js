import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// TODO: Replace with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const auth = {
  // Sign up with email and password
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
}

// Database functions
export const db = {
  // Notes
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  async createNote(note) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: note.title || '',
        content: note.content || ''
      })
      .select()
      .single()
    return { data, error }
  },

  async updateNote(id, updates) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteNote(id) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Calendar Todos
  async getTodosByDate(dateKey) {
    const { data, error } = await supabase
      .from('calendar_todos')
      .select('*')
      .eq('date_key', dateKey)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllTodos() {
    const { data, error } = await supabase
      .from('calendar_todos')
      .select('*')
      .order('date_key', { ascending: true })
    return { data, error }
  },

  async createTodo(todo) {
    const { data, error } = await supabase
      .from('calendar_todos')
      .insert(todo)
      .select()
      .single()
    return { data, error }
  },

  async updateTodo(id, updates) {
    const { data, error } = await supabase
      .from('calendar_todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteTodo(id) {
    const { error } = await supabase
      .from('calendar_todos')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Food Logs
  async getFoodLogsByDate(dateKey) {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('date_key', dateKey)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllFoodLogs() {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .order('date_key', { ascending: true })
    return { data, error }
  },

  async createFoodLog(foodLog) {
    const { data, error } = await supabase
      .from('food_logs')
      .insert(foodLog)
      .select()
      .single()
    return { data, error }
  },

  async deleteFoodLog(id) {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
    return { error }
  },

  async getDailySummary(dateKey) {
    const { data, error } = await supabase
      .from('daily_food_summary')
      .select('*')
      .eq('date_key', dateKey)
      .single()
    return { data, error }
  }
}
