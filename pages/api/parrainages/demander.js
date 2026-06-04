// pages/api/parrainages/demander.js — POST demande de parrainage
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

  const { parrain_id, message } = req.body
  if (!parrain_id) return res.status(400).json({ error: 'parrain_id requis' })
  if (parrain_id === user.id) return res.status(400).json({ error: 'Tu ne peux pas te parrainer toi-même' })

  const { data, error } = await sb
    .from('parrainages')
    .insert({ parrain_id, filleul_id: user.id, message: message || null, statut: 'en_attente' })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Demande déjà envoyée' })
    return res.status(500).json({ error: error.message })
  }
  return res.status(201).json({ data })
}
