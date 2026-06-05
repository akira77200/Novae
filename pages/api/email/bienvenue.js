// pages/api/email/bienvenue.js — Email de bienvenue (MVP)
import { createClient } from '@supabase/supabase-js'
import { requireAuth, checkRateLimit, getIP } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 5)) {
    return res.status(429).json({ error: 'Trop de requêtes.' })
  }

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { email, prenom } = req.body
  if (!email) return res.status(400).json({ error: 'Email requis' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // MVP : placeholder pour intégration future via provider email Supabase
  void supabase

  res.status(200).json({ success: true })
}
