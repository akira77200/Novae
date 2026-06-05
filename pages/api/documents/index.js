// pages/api/documents/index.js — GET list + POST create
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'POST') {
    const { nom, type, fichier_url, date_expiration, statut, notes } = req.body
    if (!nom || !type) return res.status(400).json({ error: 'nom et type requis' })
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({ user_id: authResult.user.id, nom, type, fichier_url, date_expiration: date_expiration || null, statut: statut || 'valide', notes })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ data })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
