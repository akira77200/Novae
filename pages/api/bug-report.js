// pages/api/bug-report.js — Rapports de bug
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getIP } from '../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 5)) {
    return res.status(429).json({ error: 'Trop de rapports. Réessaie plus tard.' })
  }

  const { email, page, description } = req.body
  if (!description?.trim()) {
    return res.status(400).json({ error: 'Description requise' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase.from('bug_reports').insert({
    user_email: email?.trim() || null,
    page:       page?.trim() || null,
    description: description.trim().slice(0, 2000),
    statut:     'nouveau',
  })

  if (error) {
    console.error('[bug-report] Erreur Supabase:', error.message)
    return res.status(500).json({ error: 'Impossible d\'enregistrer le rapport.' })
  }

  res.status(200).json({ success: true })
}
