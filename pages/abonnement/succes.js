// pages/abonnement/succes.js — NOVAE v5 — Succès paiement Stripe
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { useApp } from '../../context/AppContext'

export default function AbonnementSucces() {
  const router = useRouter()
  const { C, lang, user, sb, refreshProfile } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState('')

  const isFr = lang === 'fr'

  useEffect(() => {
    const processSuccess = async () => {
      const { session_id } = router.query
      if (!session_id) {
        setError(isFr ? 'Session ID manquant' : 'Missing session ID')
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await sb.auth.getSession()
        const token = session?.access_token

        if (!token) {
          router.push('/auth/login')
          return
        }

        // Récupérer les détails de la session Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        const stripeSession = await stripe.checkout.sessions.retrieve(session_id)
        const planFromMetadata = stripeSession.metadata?.plan || 'starter'

        // Mettre à jour le plan dans profiles
        const { error: updateError } = await sb
          .from('profiles')
          .update({ plan: planFromMetadata })
          .eq('id', user.id)

        if (updateError) throw updateError

        // Créer l'abonnement
        const { error: aboError } = await sb
          .from('abonnements')
          .insert({
            user_id: user.id,
            plan: planFromMetadata,
            stripe_customer_id: stripeSession.customer,
            stripe_subscription_id: stripeSession.subscription,
            statut: 'actif',
          })

        if (aboError) throw aboError

        setPlan(planFromMetadata)
        refreshProfile()
      } catch (e) {
        console.error('[succes]', e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (router.isReady && user) {
      processSuccess()
    }
  }, [router.isReady, user])

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', margin:'0 auto 16px' }}>N</div>
          <p style={{ color:C.muted, fontSize:14 }}>{isFr ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  const planNames = {
    starter: isFr ? 'Starter' : 'Starter',
    premium: isFr ? 'Premium' : 'Premium',
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      

      <main style={{ maxWidth:560, margin:'0 auto', padding:'80px 20px', textAlign:'center' }}>

        {error ? (
          <div>
            <div style={{ fontSize:48, marginBottom:20 }}>⚠️</div>
            <h1 style={{ fontSize:24, fontWeight:700, color:C.error, marginBottom:12 }}>
              {isFr ? 'Erreur lors du traitement' : 'Error processing payment'}
            </h1>
            <p style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
              {error}
            </p>
            <a href="/abonnement" style={{ display:'inline-block', padding:'12px 24px', borderRadius:10, background:C.accent, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>
              {isFr ? 'Réessayer' : 'Try again'}
            </a>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:64, marginBottom:24 }}>🎉</div>
            <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.4rem)', fontWeight:800, color:C.text, marginBottom:12, letterSpacing:-0.5 }}>
              {isFr ? `Bienvenue sur le plan ${planNames[plan] || plan} !` : `Welcome to the ${planNames[plan] || plan} plan!`}
            </h1>
            <p style={{ fontSize:16, color:C.muted, lineHeight:1.6, marginBottom:32 }}>
              {isFr
                ? 'Ton abonnement est maintenant actif. Tu peux profiter de toutes les fonctionnalités incluses dans ton plan.'
                : 'Your subscription is now active. You can enjoy all the features included in your plan.'}
            </p>
            <a href="/dashboard" style={{ display:'inline-block', padding:'14px 32px', borderRadius:12, background:C.accent, color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none' }}>
              {isFr ? 'Accéder à mon dashboard →' : 'Go to my dashboard →'}
            </a>
          </div>
        )}

      </main>
    </div>
  )
}
