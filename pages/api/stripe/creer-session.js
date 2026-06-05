// pages/api/stripe/creer-session.js — NOVAE v5 — Stripe checkout
import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { plan } = req.body
  
  const PRIX = {
    starter: process.env.STRIPE_PRICE_STARTER,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  }
  
  if (!PRIX[plan]) {
    return res.status(400).json({ error: 'Plan invalide' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: PRIX[plan], quantity: 1 }],
      success_url: process.env.NEXT_PUBLIC_APP_URL + 
        '/abonnement/succes?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + 
        '/abonnement',
      metadata: { plan }
    })
    
    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[stripe]', err.message)
    res.status(500).json({ error: err.message })
  }
}
