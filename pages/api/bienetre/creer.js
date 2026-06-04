// pages/api/bienetre/creer.js — POST check-in bien-être
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

  const { score, humeur, note } = req.body
  if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Score invalide (1-5)' })

  // Semaine courante (lundi)
  const now    = new Date()
  const day    = now.getDay() // 0=dim
  const diff   = day === 0 ? 6 : day - 1
  const lundi  = new Date(now)
  lundi.setDate(now.getDate() - diff)
  const semaine = lundi.toISOString().split('T')[0]

  // Upsert : un seul check-in par semaine
  const { data, error } = await sb
    .from('bienetre')
    .upsert({ user_id: user.id, score, humeur: humeur || null, note: note || null, semaine }, { onConflict: 'user_id,semaine' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ data })
}
