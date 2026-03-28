import { Router } from 'express'
import { supabase } from '../config'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Get all notes
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Get notes error:', error)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// Create note
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: req.userId,
        title: title || '',
        content: content || '',
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data })
  } catch (error) {
    console.error('Create note error:', error)
    res.status(500).json({ error: 'Failed to create note' })
  }
})

// Update note
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Update note error:', error)
    res.status(500).json({ error: 'Failed to update note' })
  }
})

// Delete note
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)

    if (error) throw error

    res.json({ success: true, message: 'Note deleted' })
  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({ error: 'Failed to delete note' })
  }
})

export default router
