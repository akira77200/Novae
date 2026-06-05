// pages/api/webhooks/stripe.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const getRawBody = (req) => new Promise((res, rej) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => res(Buffer.concat(c))); req.on('error', rej) })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe configuration missing' })
  }

  const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

  try {
    const body  = await getRawBody(req)
    const sig   = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'checkout.session.completed') {
      const s    = event.data.object
      const meta = s.metadata
      const { data: session, error: sessionErr } = await supabase.from('sessions').insert({
        mentor_id: meta.mentor_id, sujet: meta.sujet,
        duree_minutes: parseInt(meta.duree_minutes),
        statut: 'confirme', montant: s.amount_total, devise: 'cad',
        commission_novae: parseInt(meta.commission_novae),
        montant_mentor: parseInt(meta.montant_mentor),
        stripe_checkout_session_id: s.id,
        stripe_payment_intent_id: s.payment_intent,
        paye_at: new Date().toISOString(),
      }).select().single()

      if (sessionErr) {
        console.error('[webhook] Failed to insert session:', sessionErr.message)
        return res.status(500).json({ error: 'Failed to record session' })
      }

      if (session) {
        const { error: paiementErr } = await supabase.from('paiements').insert({ session_id: session.id, stripe_payment_intent_id: s.payment_intent, montant: s.amount_total, devise: 'cad', statut: 'reussi', description: `Session mentor — ${meta.sujet}` })
        if (paiementErr) {
          console.error('[webhook] Failed to insert paiement:', paiementErr.message)
        }
      }
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[webhook]', e.message)
    return res.status(400).json({ error: e.message })
  }
}
