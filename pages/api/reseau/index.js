// pages/api/reseau/index.js — GET list + POST create
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('contacts_reseau')
      .select('*')
      .eq('user_id', authResult.user.id)
      .order('date_rencontre', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data: data || [] })
  }

  if (req.method === 'POST') {
    const { prenom, nom, poste, entreprise, secteur, contexte_rencontre,
            date_rencontre, derniere_interaction, rappel_dans, notes, linkedin_url } = req.body
    if (!prenom?.trim()) return res.status(400).json({ error: 'Prénom requis' })

    const { data, error } = await supabaseAdmin
      .from('contacts_reseau')
      .insert({
        user_id: authResult.user.id,
        prenom: prenom.trim(),
        nom: nom?.trim() || null,
        poste: poste?.trim() || null,
        entreprise: entreprise?.trim() || null,
        secteur: secteur || null,
        contexte_rencontre: contexte_rencontre || null,
        date_rencontre: date_rencontre || new Date().toISOString().split('T')[0],
        derniere_interaction: derniere_interaction || null,
        rappel_dans: rappel_dans ? Number(rappel_dans) : null,
        notes: notes?.trim() || null,
        linkedin_url: linkedin_url?.trim() || null,
      })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ data })
  }

  res.status(405).json({ error: 'Méthode non autorisée' })
}
