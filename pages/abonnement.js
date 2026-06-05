// pages/abonnement.js — NOVAE v5 — Page abonnements
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const PLANS = [
  {
    id: 'gratuit',
    nameFr: 'Gratuit',
    nameEn: 'Free',
    price: 0,
    periodFr: 'mois',
    periodEn: 'mo',
    color: '#888',
    featuresFr: [
      'Dashboard + checklist',
      'Guides gratuits',
      'Quiz culture',
      'Carte vie quotidienne',
      '1 CV généré par IA',
      '5 messages à Nova par jour',
    ],
    featuresEn: [
      'Dashboard + checklist',
      'Free guides',
      'Culture quiz',
      'Daily life map',
      '1 AI-generated resume',
      '5 Nova messages/day',
    ],
    excludedFr: [
      'Recommandations IA illimitées',
      'Simulation entrevue',
      'Accès mentors',
    ],
    excludedEn: [
      'Unlimited AI recommendations',
      'Interview simulation',
      'Mentor access',
    ],
    ctaFr: 'Commencer gratuitement',
    ctaEn: 'Get started for free',
    href: '/auth/register',
  },
  {
    id: 'starter',
    nameFr: 'Starter',
    nameEn: 'Starter',
    price: 9.99,
    periodFr: 'mois',
    periodEn: 'mo',
    color: '#1565C0',
    badge: 'Populaire',
    badgeEn: 'Popular',
    featuresFr: [
      'Tout le plan gratuit',
      '5 CV générés par IA',
      '20 messages à Nova par jour',
      'Recommandations IA illimitées',
      '3 simulations entrevue par mois',
      'Documents illimités',
      'Bourses et universités',
    ],
    featuresEn: [
      'Everything in Free',
      '5 AI-generated resumes',
      '20 Nova messages/day',
      'Unlimited AI recommendations',
      '3 interview simulations/month',
      'Unlimited documents',
      'Scholarships & universities',
    ],
    excludedFr: [
      'Accès mentors prioritaire',
    ],
    excludedEn: [
      'Priority mentor access',
    ],
    ctaFr: 'Commencer — 9.99$/mois',
    ctaEn: 'Start — 9.99$/mo',
    href: null, // Stripe checkout
  },
  {
    id: 'premium',
    nameFr: 'Premium',
    nameEn: 'Premium',
    price: 19.99,
    periodFr: 'mois',
    periodEn: 'mo',
    color: '#2D6A4F',
    badge: '⭐ Premium',
    featuresFr: [
      'Tout le plan Starter',
      'CV illimités',
      'Nova illimitée',
      'Simulations entrevue illimitées',
      'Accès mentors prioritaire',
      'Support prioritaire',
      'Nouvelles fonctionnalités en avant-première',
    ],
    featuresEn: [
      'Everything in Starter',
      'Unlimited resumes',
      'Unlimited Nova',
      'Unlimited interview simulations',
      'Priority mentor access',
      'Priority support',
      'Early access to new features',
    ],
    excludedFr: [],
    excludedEn: [],
    ctaFr: 'Commencer — 19.99$/mois',
    ctaEn: 'Start — 19.99$/mo',
    href: null, // Stripe checkout
  },
]

export default function Abonnement() {
  const { C, lang, user, sb } = useApp()
  const [loading, setLoading] = useState(null) // plan id or null
  const [error, setError] = useState('')

  const isFr = lang === 'fr'
  const isDark = C.bg === '#0F0F0F'

  const handleSubscribe = async (planId) => {
    if (planId === 'gratuit') {
      window.location.href = '/auth/register'
      return
    }

    setLoading(planId)
    setError('')

    try {
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token

      if (!token) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent('/abonnement')}`
        return
      }

      const res = await fetch('/api/stripe/creer-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || isFr ? 'Erreur lors de la création de la session' : 'Error creating session')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'40px 20px 80px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h1 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:800, color:C.text, letterSpacing:-0.5, marginBottom:12 }}>
            {isFr ? 'Choisis ton plan' : 'Choose your plan'}
          </h1>
          <p style={{ fontSize:16, color:C.muted, lineHeight:1.6, maxWidth:560, margin:'0 auto' }}>
            {isFr
              ? 'Débloque tout le potentiel de Novae avec un plan adapté à tes besoins.'
              : 'Unlock the full potential of Novae with a plan tailored to your needs.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            maxWidth:500, margin:'0 auto 32px', padding:'12px 16px',
            background:`${C.error}10`, border:`1px solid ${C.error}30`,
            borderRadius:10, color:C.error, fontSize:13, textAlign:'center',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Plans grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {PLANS.map((plan, i) => (
            <div key={plan.id} style={{
              background: isDark ? '#162820' : '#fff',
              borderLeft: `4px solid ${plan.color}`,
              borderRadius: 16,
              padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              position:'relative',
              ...(plan.badge ? { transform:'scale(1.02)', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' } : {}),
            }}>
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position:'absolute', top:-12, left:28,
                  padding:'5px 14px', borderRadius:20,
                  background:plan.color, color:'#fff',
                  fontSize:11, fontWeight:700,
                }}>
                  {isFr ? plan.badge : plan.badgeEn}
                </div>
              )}

              {/* Plan name & price */}
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:20, fontWeight:700, color:C.text, margin:'0 0 8px' }}>
                  {isFr ? plan.nameFr : plan.nameEn}
                </h3>
                <p style={{ fontSize:36, fontWeight:800, color:C.text, margin:0 }}>
                  {plan.price === 0 ? '0' : plan.price.toFixed(2)}
                  <span style={{ fontSize:16, fontWeight:400, color:C.muted }}>
                    ${isFr ? `/${plan.periodFr}` : `/${plan.periodEn}`}
                  </span>
                </p>
              </div>

              {/* Features */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {(isFr ? plan.featuresFr : plan.featuresEn).map((feature, j) => (
                  <p key={j} style={{ fontSize:14, color:C.text, margin:0, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:plan.color, fontSize:16 }}>✓</span>
                    {feature}
                  </p>
                ))}
                {(isFr ? plan.excludedFr : plan.excludedEn).map((feature, j) => (
                  <p key={j} style={{ fontSize:14, color:C.muted, margin:0, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:C.muted, fontSize:16 }}>✕</span>
                    {feature}
                  </p>
                ))}
              </div>

              {/* CTA button */}
              {plan.href ? (
                <a href={plan.href} style={{
                  display:'block', padding:'14px', borderRadius:12,
                  border:`1px solid ${C.border}`, background:'transparent',
                  color:C.text, fontWeight:700, fontSize:15,
                  textDecoration:'none', textAlign:'center',
                }}>
                  {isFr ? plan.ctaFr : plan.ctaEn}
                </a>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  style={{
                    width:'100%', padding:'14px', borderRadius:12,
                    border:'none', background:loading === plan.id ? C.border : plan.color,
                    color:'#fff', fontWeight:700, fontSize:15,
                    cursor:loading === plan.id ? 'not-allowed' : 'pointer',
                    opacity:loading === plan.id ? 0.7 : 1,
                  }}
                >
                  {loading === plan.id
                    ? (isFr ? 'Chargement...' : 'Loading...')
                    : (isFr ? plan.ctaFr : plan.ctaEn)}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:680, margin:'60px auto 0' }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:C.text, marginBottom:24, textAlign:'center' }}>
            {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              {
                qFr: 'Puis-je annuler mon abonnement ?',
                qEn: 'Can I cancel my subscription?',
                aFr: 'Oui, tu peux annuler à tout moment. Ton accès reste actif jusqu\'à la fin de la période facturée.',
                aEn: 'Yes, you can cancel at any time. Your access remains active until the end of the billed period.',
              },
              {
                qFr: 'Le paiement est-il sécurisé ?',
                qEn: 'Is payment secure?',
                aFr: 'Absolument. Nous utilisons Stripe pour traiter tous les paiements. Tes informations bancaires ne sont jamais stockées sur nos serveurs.',
                aEn: 'Absolutely. We use Stripe to process all payments. Your banking information is never stored on our servers.',
              },
              {
                qFr: 'Puis-je changer de plan ?',
                qEn: 'Can I change plans?',
                aFr: 'Oui, tu peux passer d\'un plan à l\'autre à tout moment depuis ton tableau de bord.',
                aEn: 'Yes, you can switch between plans at any time from your dashboard.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ padding:'20px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:12 }}>
                <p style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:8 }}>
                  {isFr ? faq.qFr : faq.qEn}
                </p>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, margin:0 }}>
                  {isFr ? faq.aFr : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
