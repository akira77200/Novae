// pages/api/echeances/[id].js — PATCH update + DELETE
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

  const { id } = req.query

  if (req.method === 'PATCH') {
    const { titre, message, lien, date_echeance, date_alerte, type, complete, lu } = req.body
    const patch = {}
    if (titre        !== undefined) patch.titre        = titre
    if (message      !== undefined) patch.message      = message
    if (lien         !== undefined) patch.lien         = lien
    if (date_echeance!== undefined) patch.date_echeance= date_echeance
    if (date_alerte  !== undefined) patch.date_alerte  = date_alerte
    if (type         !== undefined) patch.type         = type
    if (complete     !== undefined) patch.complete      = complete
    if (lu           !== undefined) patch.lu            = lu

    const { data, error } = await sb
      .from('alertes')
      .update(patch)
      .eq('id', id)
      .eq('utilisateur_id', user.id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await sb
      .from('alertes')
      .delete()
      .eq('id', id)
      .eq('utilisateur_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
