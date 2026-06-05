// pages/api/email/bienvenue.js — Email de bienvenue (MVP)
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, prenom } = req.body
  if (!email) return res.status(400).json({ error: 'Email requis' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // MVP : log uniquement — configurer Resend/SendGrid dans Supabase pour les vrais envois
  console.log(`[Email bienvenue] Envoyé à ${email}${prenom ? ` (${prenom})` : ''}`)

  // Placeholder pour intégration future via provider email Supabase
  void supabase

  res.status(200).json({ success: true })
}
