// pages/api/quiz/sauvegarder.js — POST score quiz culture
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { categorie, score, total } = req.body
  if (!categorie || score === undefined || !total)
    return res.status(400).json({ error: 'categorie, score et total requis' })

  const { data, error } = await supabaseAdmin
    .from('quiz_scores')
    .insert({ user_id: authResult.user.id, categorie, score: Number(score), total: Number(total) })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ data })
}
