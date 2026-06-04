// pages/api/bienetre/historique.js — GET 8 dernières semaines
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user }, error: authErr } = await sb.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' })

  const { data, error } = await sb
    .from('bienetre')
    .select('*')
    .eq('user_id', user.id)
    .order('semaine', { ascending: false })
    .limit(8)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ data: (data || []).reverse() })
}
