// pages/api/sessions/creer.js
import Stripe from 'stripe'
import { requireAuth, checkRateLimit, getIP } from '../../../lib/apiGuards'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 10)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { mentorId, mentorNom, sujet, dureeMinutes, montantCAD } = req.body
  if (!mentorId || !montantCAD) return res.status(400).json({ error: 'Paramètres manquants' })

  const amount = Number(montantCAD)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
    return res.status(400).json({ error: 'Montant invalide' })
  }

  try {
    const montantCentimes  = Math.round(amount * 100)
    const commissionNovae  = Math.round(montantCentimes * 0.30)
    const montantMentor    = montantCentimes - commissionNovae

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: `Session avec ${mentorNom}`, description: `${dureeMinutes} min · ${sujet}` },
          unit_amount: montantCentimes,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/mentors`,
      metadata: { mentor_id: mentorId, sujet, duree_minutes: String(dureeMinutes), commission_novae: String(commissionNovae), montant_mentor: String(montantMentor) },
    })
    return res.status(200).json({ url: session.url })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Erreur lors de la création de la session de paiement.' })
  }
}
