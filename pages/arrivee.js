// pages/arrivee.js
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import FeedbackSection from '../components/FeedbackSection'
import { useApp } from '../context/AppContext'

const GUIDES_LIST = [
  { type: 'ramq',    icon: '🏥', fr: 'RAMQ — Assurance maladie',        en: 'RAMQ — Health insurance' },
  { type: 'nas',     icon: '🪪', fr: 'NAS — Numéro d\'assurance sociale', en: 'SIN — Social Insurance Number' },
  { type: 'banque',  icon: '🏦', fr: 'Ouvrir un compte bancaire',       en: 'Open a bank account' },
  { type: 'credit',  icon: '💳', fr: 'Construire sa cote de crédit',    en: 'Build your credit score' },
  { type: 'impots',  icon: '📋', fr: 'Déclaration de revenus',          en: 'Tax filing' },
  { type: 'logement',icon: '🏠', fr: 'Trouver un logement',             en: 'Find housing' },
]


const DATA = {
  fr: {
    h72: [
      { moment: 'Aéroport',  icon: '✈️', tasks: ['Acheter une SIM (Fizz ou Public Mobile — kiosque à l\'aéroport, ~20$/mois)', 'Retirer 100–200$ en cash', 'Confirmer le trajet vers ton logement'] },
      { moment: 'Jour 1',    icon: '🏠', tasks: ['Installer ton logement temporaire', 'Trouver le supermarché le plus proche (Maxi ou Super C)', 'Acheter le strict nécessaire', 'Dormir — récupère de ton vol'] },
      { moment: 'Jour 2',    icon: '🏦', tasks: ['Ouvrir ton compte bancaire (Banque Nationale ou Desjardins)', 'Passeport + permis suffisent — pas besoin du NAS', 'Demander une carte de débit'] },
      { moment: 'Jour 3',    icon: '🪪', tasks: ['Aller à Service Canada pour ton NAS', 'Apporter : passeport, permis d\'études, preuve d\'adresse', 'Durée : environ 30 minutes'] },
    ],
    week1: [
      { moment: 'Jours 4–5', icon: '🏥', tasks: ['S\'inscrire à la RAMQ si tu es au Québec', 'Fenêtre de 3 mois — commence maintenant', 'Documents : passeport + permis + preuve d\'adresse québécoise'] },
      { moment: 'Jours 5–6', icon: '🎓', tasks: ['Visiter ton campus universitaire', 'Trouver ta faculté, bibliothèque, services aux étudiants', 'Récupérer ta carte étudiante'] },
      { moment: 'Jours 6–7', icon: '🗺️', tasks: ['Explorer ton quartier à pied', 'Télécharger l\'app STM/OC Transpo selon ta ville', 'Trouver : supermarché, pharmacie, transport en commun'] },
    ],
    month1: [
      { moment: 'Semaine 2',   icon: '💳', tasks: ['Demander ta carte de crédit sécurisée (Secured Visa Banque Nationale)', 'Dépôt : 200–500$', 'Utiliser uniquement pour l\'épicerie'] },
      { moment: 'Semaine 2–3', icon: '🤝', tasks: ['Rejoindre les associations étudiantes de ton université', 'Chercher des groupes de compatriotes (Facebook, WhatsApp)', 'Assister à une session d\'accueil étudiants internationaux'] },
      { moment: 'Semaine 3–4', icon: '💼', tasks: ['Vérifier les conditions de ton permis de travail hors campus', 'Regarder les offres d\'emploi sur le campus', 'Mettre à jour ton CV au format canadien'] },
      { moment: 'Fin du mois', icon: '📊', tasks: ['Faire le bilan de ton budget', 'Vérifier que toutes les démarches admin sont faites', 'Planifier les prochains mois'] },
    ],
  },
  en: {
    h72: [
      { moment: 'Airport',  icon: '✈️', tasks: ['Buy a SIM (Fizz or Public Mobile — airport kiosk, ~$20/month)', 'Withdraw $100–200 cash', 'Confirm route to your accommodation'] },
      { moment: 'Day 1',    icon: '🏠', tasks: ['Set up temporary accommodation', 'Find nearest supermarket (Maxi or Super C)', 'Buy essentials only', 'Sleep — recover from your flight'] },
      { moment: 'Day 2',    icon: '🏦', tasks: ['Open a bank account (Banque Nationale or Desjardins)', 'Passport + permit is enough — no SIN needed yet', 'Get a debit card'] },
      { moment: 'Day 3',    icon: '🪪', tasks: ['Go to Service Canada for your SIN', 'Bring: passport, study permit, proof of address', 'Duration: about 30 minutes'] },
    ],
    week1: [
      { moment: 'Days 4–5', icon: '🏥', tasks: ['Register for RAMQ if in Quebec', '3-month window — start now', 'Documents: passport + permit + Quebec proof of address'] },
      { moment: 'Days 5–6', icon: '🎓', tasks: ['Visit your university campus', 'Find your faculty, library, student services', 'Get your student card'] },
      { moment: 'Days 6–7', icon: '🗺️', tasks: ['Explore your neighborhood on foot', 'Download STM/OC Transpo app for your city', 'Find: supermarket, pharmacy, public transit'] },
    ],
    month1: [
      { moment: 'Week 2',       icon: '💳', tasks: ['Apply for secured credit card (Secured Visa Banque Nationale)', 'Deposit: $200–500', 'Use only for groceries'] },
      { moment: 'Week 2–3',     icon: '🤝', tasks: ['Join student associations at your university', 'Find compatriot groups (Facebook, WhatsApp)', 'Attend international student welcome session'] },
      { moment: 'Week 3–4',     icon: '💼', tasks: ['Check your off-campus work permit conditions', 'Look at on-campus job postings', 'Update your CV to Canadian format'] },
      { moment: 'End of month', icon: '📊', tasks: ['Review your budget', 'Verify all administrative steps are complete', 'Plan the next few months'] },
    ],
  }
}

const CHECKLIST_KEY = 'novae_arrivee_checklist'

const CHECKLIST = [
  { id: 'sim',     fr: 'Acheter une carte SIM',                              en: 'Buy a SIM card' },
  { id: 'cash',    fr: 'Retirer du cash (100–200$)',                         en: 'Withdraw cash ($100–200)' },
  { id: 'bank',    fr: 'Ouvrir un compte bancaire',                          en: 'Open a bank account' },
  { id: 'nas',     fr: 'Obtenir ton NAS à Service Canada',                   en: 'Get your SIN at Service Canada' },
  { id: 'ramq',    fr: 'S\'inscrire à la RAMQ (si Québec)',                  en: 'Register for RAMQ (if Quebec)' },
  { id: 'campus',  fr: 'Visiter ton campus et récupérer ta carte étudiante', en: 'Visit campus and get your student card' },
  { id: 'transpo', fr: 'Télécharger l\'app de transport en commun',          en: 'Download public transit app' },
  { id: 'credit',  fr: 'Demander une carte de crédit sécurisée',             en: 'Apply for a secured credit card' },
  { id: 'asso',    fr: 'Rejoindre une association étudiante',                en: 'Join a student association' },
  { id: 'permis',  fr: 'Vérifier les conditions de ton permis de travail',   en: 'Check your work permit conditions' },
  { id: 'cv',      fr: 'Mettre à jour ton CV au format canadien',            en: 'Update your CV to Canadian format' },
  { id: 'budget',  fr: 'Faire le bilan de ton premier mois',                 en: 'Review your first month budget' },
]

const PHASES = [
  { id: 'h72',   fr: 'Les 72 premières heures', en: 'First 72 hours', icon: '⚡', color: '#52B788' },
  { id: 'week1', fr: 'La première semaine',     en: 'First week',     icon: '📅', color: '#60A5FA' },
  { id: 'month1',fr: 'Le premier mois',         en: 'First month',    icon: '🗓️', color: '#FBBF24' },
]

export default function Arrivee() {
  const { C, lang } = useApp()
  const [phase, setPhase] = useState('h72')
  const [checked, setChecked] = useState({})

  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}')) } catch {}
  }, [])

  const toggleCheck = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)) } catch {}
  }

  const nbDone = CHECKLIST.filter(c => checked[c.id]).length

  const data  = DATA[lang] || DATA.fr
  const items = data[phase] || []
  const col   = PHASES.find(p => p.id === phase)?.color || C.accent2
  const isFr  = lang === 'fr'

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  const telechargerGuide = (type) => {
    // window.open synchrone — premier appel, compatible Safari/iOS
    const url = `/api/guides/generer?type=${type}&lang=${lang}&print=1`
    window.open(url, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
          🛬 {lang === 'fr' ? 'Guide d\'arrivée' : 'Arrival Guide'}
        </h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
          {lang === 'fr' ? 'Ton plan d\'action étape par étape. Garde-le sur ton téléphone.' : 'Your step-by-step action plan. Keep it on your phone.'}
        </p>

        {/* ── CHECKLIST 30 JOURS ── */}
        <div style={{ marginBottom: 36, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>
              📋 {lang === 'fr' ? 'Checklist — 30 premiers jours' : 'Checklist — First 30 days'}
            </h2>
            <span style={{ fontSize: 13, fontWeight: 600, color: nbDone === CHECKLIST.length ? '#52B788' : C.muted }}>
              {nbDone}/{CHECKLIST.length} {lang === 'fr' ? 'complétés' : 'completed'}
            </span>
          </div>
          <div style={{ width: '100%', height: 6, background: C.border, borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(nbDone / CHECKLIST.length) * 100}%`, background: '#52B788', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKLIST.map(item => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => toggleCheck(item.id)} style={{
                  width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked[item.id] ? '#52B788' : C.border}`,
                  background: checked[item.id] ? '#52B788' : 'transparent', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}>
                  {checked[item.id] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, color: checked[item.id] ? C.muted : C.text, textDecoration: checked[item.id] ? 'line-through' : 'none', lineHeight: 1.5 }}>
                  {lang === 'fr' ? item.fr : item.en}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Phase selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {PHASES.map(p => (
            <button key={p.id} onClick={() => setPhase(p.id)} style={{
              flex: 1, minWidth: 140, padding: '13px 16px', borderRadius: 12, border: `1px solid`,
              fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              background: phase === p.id ? `${p.color}18` : 'transparent',
              borderColor: phase === p.id ? `${p.color}50` : C.border,
              color: phase === p.id ? p.color : C.muted,
            }}>
              <span style={{ fontSize: 20, display: 'block', marginBottom: 3 }}>{p.icon}</span>
              {lang === 'fr' ? p.fr : p.en}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 10, top: 10, bottom: 10, width: 2, background: `linear-gradient(180deg,${col},transparent)` }} />
          {items.map((item, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
              <div style={{ position: 'absolute', left: -32, top: 12, width: 22, height: 22, borderRadius: '50%', background: `${col}20`, border: `2px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                {item.icon}
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: '16px 18px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: col, marginBottom: 10 }}>{item.moment}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {item.tasks.map((task, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, fontSize: 14, color: C.muted, lineHeight: 1.55 }}>
                      <span style={{ color: col, flexShrink: 0 }}>→</span>{task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guides gratuits PDF */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            📚 {isFr ? 'Guides gratuits complets' : 'Free complete guides'}
          </h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
            {isFr
              ? 'Ouvre le guide complet dans un nouvel onglet et enregistre-le en PDF.'
              : 'Open the complete guide in a new tab and save it as PDF.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {GUIDES_LIST.map(g => (
              <div key={g.type} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: '16px 18px' }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>{g.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.4 }}>
                  {isFr ? g.fr : g.en}
                </p>
                <button
                  onClick={() => telechargerGuide(g.type)}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: '#2D6A4F',
                    border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1B4332'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2D6A4F'}
                >
                  📄 {isFr ? 'Ouvrir le guide PDF' : 'Open PDF guide'}
                </button>
                {isIOS && (
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
                    💡 {isFr
                      ? 'Sur iPhone : autorise les popups si demandé (Réglages → Safari → Bloquer les fenêtres publicitaires → Désactiver pour ce site)'
                      : 'On iPhone: allow popups if prompted (Settings → Safari → Block Pop-ups → Disable for this site)'}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 14 }}>
            {isFr
              ? '💡 Dans le nouvel onglet, clique sur « Imprimer / Enregistrer en PDF ».'
              : '💡 In the new tab, click "Print / Save as PDF".'}
          </p>
        </div>

        {/* Urgence numbers */}
        <div style={{ marginTop: 28, background: C.surface, border: `1px solid rgba(248,113,113,0.3)`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: C.error, marginBottom: 12 }}>
            🆘 {lang === 'fr' ? 'Numéros utiles' : 'Useful numbers'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
            {[
              { fr: 'Urgences',       en: 'Emergency',       num: '911' },
              { fr: 'IRCC',          en: 'IRCC',            num: '1-888-242-2100' },
              { fr: 'RAMQ',          en: 'RAMQ',            num: '1-800-561-9749' },
              { fr: 'Service Canada', en: 'Service Canada',  num: '1-800-206-7218' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '10px 14px', background: `${C.error}08`, borderRadius: 9 }}>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{lang === 'fr' ? c.fr : c.en}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.num}</p>
              </div>
            ))}
          </div>
        </div>

        <FeedbackSection page="arrivee" />
      </main>
    </div>
  )
}
