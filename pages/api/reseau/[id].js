// pages/api/reseau/[id].js — PATCH update + DELETE
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { id } = req.query

  if (req.method === 'PATCH') {
    const fields = ['prenom','nom','poste','entreprise','secteur','contexte_rencontre',
                    'date_rencontre','derniere_interaction','rappel_dans','notes','linkedin_url']
    const patch = {}
    fields.forEach(f => { if (req.body[f] !== undefined) patch[f] = req.body[f] || null })
    if (req.body.rappel_dans !== undefined) patch.rappel_dans = req.body.rappel_dans ? Number(req.body.rappel_dans) : null

    const { data, error } = await supabaseAdmin
      .from('contacts_reseau')
      .update(patch)
      .eq('id', id).eq('user_id', authResult.user.id)
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('contacts_reseau')
      .delete()
      .eq('id', id).eq('user_id', authResult.user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
