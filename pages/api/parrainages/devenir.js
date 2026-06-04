// pages/api/parrainages/devenir.js — POST inscription comme parrain bénévole
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user }, error: authErr } = await sb.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' })

  const { sujets, disponibilite } = req.body
  if (!sujets?.length) return res.status(400).json({ error: 'Au moins un sujet requis' })

  // Récupérer le profil pour les infos du parrain
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single()

  const mentorData = {
    user_id:     user.id,
    full_name:   profile?.full_name || user.email?.split('@')[0] || 'Parrain',
    email:       user.email,
    bio:         `Disponibilité : ${disponibilite || '1-2h/semaine'}`,
    pays_origine: profile?.pays_origine || '',
    pays_accueil: profile?.pays_accueil || 'Canada',
    ville_accueil: profile?.ville_accueil || '',
    sujets,
    niveau:      'etudiant',
    tarif_30min: 0,
    tarif_45min: 0,
    disponible:  true,
    actif:       true,
    annee_arrivee: profile?.date_arrivee ? new Date(profile.date_arrivee).getFullYear() : null,
  }

  const { data, error } = await sb
    .from('mentors')
    .upsert(mentorData, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ data })
}
