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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period } = req.query
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    let startDate = new Date()
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else {
      startDate.setDate(startDate.getDate() - 7)
    }

    const startDateKey = startDate.toISOString().split('T')[0]

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('id, training_type, date_key, created_at')
      .eq('user_id', auth.userId)
      .gte('date_key', startDateKey)
      .order('date_key', { ascending: true })

    if (plansError) throw plansError

    const planIds = (plans || []).map(p => p.id)
    let totalStrengthSets = 0
    let totalCardioMinutes = 0

    if (planIds.length > 0) {
      const { data: strengthExercises } = await supabase
        .from('strength_exercises')
        .select('sets')
        .in('workout_plan_id', planIds)

      totalStrengthSets = (strengthExercises || []).reduce((sum, e) => sum + (e.sets || 0), 0)

      const { data: cardioExercises } = await supabase
        .from('cardio_exercises')
        .select('duration_minutes')
        .in('workout_plan_id', planIds)

      totalCardioMinutes = (cardioExercises || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
    }

    const stats = {
      period: period || 'week',
      totalWorkouts: plans?.length || 0,
      totalStrengthSets,
      totalCardioMinutes,
      strengthWorkouts: plans?.filter(p => p.training_type === 'strength').length || 0,
      cardioWorkouts: plans?.filter(p => p.training_type === 'cardio').length || 0,
    }

    res.json({ success: true, data: { stats } })
  } catch (error) {
    console.error('Get fitness stats error:', error)
    res.status(500).json({ error: 'Failed to fetch fitness stats' })
  }
}
