// pages/api/reseau/[id].js — PATCH update + DELETE
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
    const fields = ['prenom','nom','poste','entreprise','secteur','contexte_rencontre',
                    'date_rencontre','derniere_interaction','rappel_dans','notes','linkedin_url']
    const patch = {}
    fields.forEach(f => { if (req.body[f] !== undefined) patch[f] = req.body[f] || null })
    if (req.body.rappel_dans !== undefined) patch.rappel_dans = req.body.rappel_dans ? Number(req.body.rappel_dans) : null

    const { data, error } = await sb
      .from('contacts_reseau')
      .update(patch)
      .eq('id', id).eq('user_id', user.id)
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await sb
      .from('contacts_reseau')
      .delete()
      .eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
