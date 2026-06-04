// pages/api/documents/index.js — GET list + POST create
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
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'POST') {
    const { nom, type, fichier_url, date_expiration, statut, notes } = req.body
    if (!nom || !type) return res.status(400).json({ error: 'nom et type requis' })
    const { data, error } = await sb
      .from('documents')
      .insert({ user_id: user.id, nom, type, fichier_url, date_expiration: date_expiration || null, statut: statut || 'valide', notes })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ data })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
