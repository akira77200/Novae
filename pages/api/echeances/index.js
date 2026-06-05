// pages/api/echeances/index.js — GET list + POST create
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('alertes')
      .select('*')
      .eq('utilisateur_id', authResult.user.id)
      .order('date_echeance', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'POST') {
    const { type, titre, message, lien, date_echeance, date_alerte } = req.body
    if (!titre || !date_echeance) return res.status(400).json({ error: 'titre et date_echeance requis' })
    const { data, error } = await supabaseAdmin
      .from('alertes')
      .insert({
        utilisateur_id: authResult.user.id,
        type:           type || 'info',
        titre,
        message:        message || null,
        lien:           lien || null,
        date_echeance,
        date_alerte:    date_alerte || date_echeance,
      })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ data })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
