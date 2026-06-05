// pages/api/bienetre/historique.js — GET 8 dernières semaines
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { data, error } = await supabaseAdmin
    .from('bienetre')
    .select('*')
    .eq('user_id', authResult.user.id)
    .order('semaine', { ascending: false })
    .limit(8)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ data: (data || []).reverse() })
}
