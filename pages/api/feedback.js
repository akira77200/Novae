// pages/api/feedback.js — NOVAE v5 — Collecte des feedbacks utilisateurs
//
// ⚠️ SQL À EXÉCUTER DANS SUPABASE (table non créée automatiquement) :
//
// CREATE TABLE IF NOT EXISTS feedbacks (
//   id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
//   page       TEXT,
//   type       TEXT,
//   note       INTEGER,
//   texte      TEXT,
//   user_email TEXT,
//   user_agent TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { page, type, note, texte, user_email, user_agent } = req.body || {}

  // Validation minimale
  if (!page || !type) return res.status(400).json({ error: 'page et type requis' })

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase.from('feedbacks').insert({
      page,
      type,
      note:       note   || null,
      texte:      texte  || null,
      user_email: user_email || 'anonyme',
      user_agent: user_agent || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Ne pas exposer l'erreur DB (table peut ne pas exister encore)
      console.error('[feedback]', error.message)
    }
  } catch (err) {
    console.error('[feedback]', err.message)
  }

  // Toujours renvoyer 200 pour ne pas bloquer l'UX
  res.status(200).json({ success: true })
}
