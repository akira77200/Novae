// pages/api/documents/[id].js — PATCH update + DELETE
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { id } = req.query

  if (req.method === 'PATCH') {
    const { nom, type, fichier_url, date_expiration, statut, notes } = req.body
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ nom, type, fichier_url, date_expiration: date_expiration || null, statut, notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', authResult.user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
