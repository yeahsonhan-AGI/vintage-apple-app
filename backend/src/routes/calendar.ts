import { Router } from 'express'
import { supabase } from '../config'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticateToken)

// Get todos
router.get('/todos', async (req: AuthRequest, res) => {
  try {
    const { date } = req.query

    let query = supabase
      .from('calendar_todos')
      .select('*')
      .eq('user_id', req.userId)

    if (date) {
      query = query.eq('date_key', date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Get todos error:', error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

// Create todo
router.post('/todos', async (req: AuthRequest, res) => {
  try {
    const { date_key, title } = req.body

    const { data, error } = await supabase
      .from('calendar_todos')
      .insert({
        user_id: req.userId,
        date_key,
        title,
        completed: false,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data })
  } catch (error) {
    console.error('Create todo error:', error)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

// Update todo
router.put('/todos/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('calendar_todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Update todo error:', error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

// Delete todo
router.delete('/todos/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('calendar_todos')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)

    if (error) throw error

    res.json({ success: true, message: 'Todo deleted' })
  } catch (error) {
    console.error('Delete todo error:', error)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})

export default router
