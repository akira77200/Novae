// pages/api/quiz/sauvegarder.js — POST score quiz culture
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user }, error: authErr } = await sb.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' })

  const { categorie, score, total } = req.body
  if (!categorie || score === undefined || !total)
    return res.status(400).json({ error: 'categorie, score et total requis' })

  const { data, error } = await sb
    .from('quiz_scores')
    .insert({ user_id: user.id, categorie, score: Number(score), total: Number(total) })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ data })
}
