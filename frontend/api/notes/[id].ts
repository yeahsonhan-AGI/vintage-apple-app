import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, authenticateToken, corsHeaders } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end()
  }

  const auth = authenticateToken(req)
  if (!auth) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const { id } = req.query
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    if (req.method === 'PUT') {
      const updates = req.body

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', auth.userId)
        .select()
        .single()

      if (error) throw error
      return res.json({ success: true, data })
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.userId)

      if (error) throw error
      return res.json({ success: true, message: 'Note deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Note API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
