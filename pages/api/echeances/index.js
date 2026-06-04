// pages/api/echeances/index.js — GET list + POST create
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user }, error: authErr } = await sb.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' })

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('alertes')
      .select('*')
      .eq('utilisateur_id', user.id)
      .order('date_echeance', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'POST') {
    const { type, titre, message, lien, date_echeance, date_alerte } = req.body
    if (!titre || !date_echeance) return res.status(400).json({ error: 'titre et date_echeance requis' })
    const { data, error } = await sb
      .from('alertes')
      .insert({
        utilisateur_id: user.id,
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
