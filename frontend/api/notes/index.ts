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

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', auth.userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return res.json({ success: true, data })
    }

    if (req.method === 'POST') {
      const { title, content } = req.body

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: auth.userId,
          title: title || '',
          content: content || '',
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ success: true, data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Notes API error:', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
