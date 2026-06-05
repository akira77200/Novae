// pages/api/parrainages/demander.js — POST demande de parrainage
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const user = authResult.user
  const { parrain_id, message } = req.body
  if (!parrain_id) return res.status(400).json({ error: 'parrain_id requis' })
  if (parrain_id === user.id) return res.status(400).json({ error: 'Tu ne peux pas te parrainer toi-même' })

  const { data, error } = await supabaseAdmin
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
