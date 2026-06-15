// pages/mentors.js — NOVAE v5 — Découverte & réservation de mentors
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import FeedbackSection from '../components/FeedbackSection'
import { useApp } from '../context/AppContext'
import { useAuthFetch } from '../lib/useAuthFetch'

const VILLES_CHIPS = ['Toutes', 'Montréal', 'Ottawa', 'Toronto', 'Vancouver', 'Calgary', 'Québec', 'Edmonton', 'Winnipeg']
const LANGUES_OPTS = [
  { id: 'fr',  label: 'Français' },
  { id: 'en',  label: 'English'  },
  { id: 'ar',  label: 'Arabe'    },
  { id: 'pt',  label: 'Portugais'},
  { id: 'wo',  label: 'Wolof'    },
]
const SUJETS_OPTS = ['Administration','Études','Emploi','Logement','Finance','Santé','Visa','PGWP','RAMQ','Banque','Impôts','Immigration','RP']
const NIVEAUX = [
  { id: 'etudiant',      fr: 'Étudiant',      en: 'Student'      },
  { id: 'professionnel', fr: 'Professionnel', en: 'Professional' },
  { id: 'expert',        fr: 'Expert',        en: 'Expert'       },
]

export default function Mentors() {
  const { C, t, lang, user, profile, loading: authLoading, sb } = useApp()
  const { authFetch } = useAuthFetch()
  const router = useRouter()
  const hasFetched = useRef(false)

  // ── Données ─────────────────────────────────────────────────────
  const [mentors,  setMentors]  = useState([])
  const [ready,    setReady]    = useState(false)

  // ── Modal réservation ───────────────────────────────────────────
  const [mOpen,    setMOpen]    = useState(null)
  const [duree,    setDuree]    = useState(30)
  const [sujet,    setSujet]    = useState('')
  const [paying,   setPaying]   = useState(false)

  // ── Filtres ─────────────────────────────────────────────────────
  const [fVille,   setFVille]   = useState('Toutes')
  const [fLangue,  setFLangue]  = useState('')
  const [fSujet,   setFSujet]   = useState('')
  const [fPrix,    setFPrix]    = useState('tous')   // 'tous' | 'gratuit' | 'payant'
  const [fNiveau,  setFNiveau]  = useState('')
  const [tri,      setTri]      = useState('note')   // 'note' | 'prix_asc' | 'recent'

  // ── Bio développée ──────────────────────────────────────────────
  const [expanded, setExpanded] = useState({})

  // ── Programme choisi (Mon Avenir) ────────────────────────────────
  const [progSujet, setProgSujet] = useState('')
  useEffect(() => {
    try {
      const pid = localStorage.getItem('novae_programme_choisi')
      if (!pid) return
      const MAP = {
        'genie-logiciel': 'Emploi', 'dev-web': 'Emploi', 'data-science': 'Emploi',
        'ia-machine-learning': 'Emploi', 'marketing': 'Emploi', 'design-ux': 'Emploi',
        'agriculture': 'Emploi', 'finance': 'Finance', 'comptabilite': 'Finance',
        'sante': 'Santé', 'medecine': 'Santé', 'infirmier': 'Santé',
        'droit': 'Administration', 'commerce': 'Administration',
      }
      const match = Object.entries(MAP).find(([k]) => pid.includes(k))
      if (match) setProgSujet(match[1])
    } catch {}
  }, [])

  // ── Chargement ──────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !sb) return
    if (hasFetched.current) return
    hasFetched.current = true

    // Pré-filtrer par ville du profil si disponible
    if (profile?.ville_accueil) {
      const v = profile.ville_accueil.split(',')[0].trim()
      const match = VILLES_CHIPS.find(c => c !== 'Toutes' && v.toLowerCase().includes(c.toLowerCase()))
      if (match) setFVille(match)
    }

    sb.from('mentors')
      .select('*')
      .eq('actif', true)
      .eq('disponible', true)
      .order('note_moyenne', { ascending: false })
      .then(({ data }) => { setMentors(data || []); setReady(true) })
      .catch(() => setReady(true))
  }, [authLoading, user?.id, sb])

  // ── Filtrage + tri côté client ───────────────────────────────────
  const mentorsFiltres = mentors
    .filter(m => {
      const ville = (m.ville_accueil || '').toLowerCase()
      if (fVille !== 'Toutes' && !ville.includes(fVille.toLowerCase())) return false
      if (fLangue && !(m.langues || []).includes(fLangue)) return false
      if (fSujet  && !(m.sujets  || []).includes(fSujet))  return false
      if (fPrix === 'gratuit' && (m.tarif_30min || 0) !== 0) return false
      if (fPrix === 'payant'  && (m.tarif_30min || 0) === 0) return false
      if (fNiveau && m.niveau !== fNiveau) return false
      return true
    })
    .sort((a, b) => {
      if (tri === 'note')     return (b.note_moyenne || 0) - (a.note_moyenne || 0)
      if (tri === 'prix_asc') return (a.tarif_30min  || 0) - (b.tarif_30min  || 0)
      if (tri === 'recent')   return new Date(b.created_at) - new Date(a.created_at)
      return 0
    })

  // ── Réservation (identique à dashboard.js) ────────────────────
  const reserver = async (mentor) => {
    if (!user) { router.push('/auth/login'); return }
    setPaying(true); setMOpen(null)
    try {
      const prix = duree === 30 ? (mentor.tarif_30min || 1499) / 100 : (mentor.tarif_45min || 1999) / 100
      const sujetFinal = sujet.trim() || (mentor.sujets?.[0] || 'Général')
      const res  = await authFetch('/api/sessions/creer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentor.id, mentorNom: mentor.full_name, sujet: sujetFinal, dureeMinutes: duree, montantCAD: prix }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Configure ta clé Stripe dans .env.local')
    } catch (e) { alert(e.message) }
    finally { setPaying(false) }
  }

  // ── Helpers d'affichage ─────────────────────────────────────────
  const formatTarif = (centimes) => {
    if (!centimes || centimes === 0) return lang === 'fr' ? 'Gratuit 🎁' : 'Free 🎁'
    return `${(centimes / 100).toFixed(2)} $`
  }

  const niveauLabel = (n) => {
    const found = NIVEAUX.find(x => x.id === n)
    return found ? (lang === 'fr' ? found.fr : found.en) : n
  }

  const chip = (active, color = C.accent) => ({
    padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? color + '60' : C.border}`,
    background: active ? color + '18' : 'transparent',
    color: active ? color : C.muted,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  })

  // ── Loading ─────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
        <p style={{ color: C.muted, fontSize: 14 }}>{t.loading}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      

      {/* Overlay paiement */}
      {paying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>
            {lang === 'fr' ? 'Redirection vers le paiement...' : 'Redirecting to payment...'}
          </p>
        </div>
      )}

      {/* ── MODAL DE RÉSERVATION ── */}
      {mOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setMOpen(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 440, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            {/* En-tête modal */}
            <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: C.accent2, flexShrink: 0 }}>
                  {(mOpen.full_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 17, color: C.text }}>{mOpen.full_name}</p>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{mOpen.pays_origine} → {mOpen.ville_accueil}</p>
                  {mOpen.note_moyenne > 0 && (
                    <p style={{ fontSize: 12, color: C.warning, marginTop: 2 }}>★ {Number(mOpen.note_moyenne).toFixed(1)} · {mOpen.sessions_total} sessions</p>
                  )}
                </div>
              </div>
              <button onClick={() => setMOpen(null)} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            <div style={{ padding: '18px 24px' }}>
              {/* Sujet */}
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {lang === 'fr' ? 'Sujet de la session' : 'Session topic'}
              </p>
              <input
                value={sujet}
                onChange={e => setSujet(e.target.value)}
                placeholder={mOpen.sujets?.[0] || (lang === 'fr' ? 'Ex: Renouvellement permis, Logement...' : 'E.g.: Permit renewal, Housing...')}
                style={{ width: '100%', padding: '10px 13px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 18, colorScheme: 'dark' }}
              />

              {/* Durée */}
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                {lang === 'fr' ? 'Durée' : 'Duration'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[30, 45].map(d => {
                  const tarif = ((d === 30 ? mOpen.tarif_30min : mOpen.tarif_45min) || (d === 30 ? 1499 : 1999)) / 100
                  return (
                    <button key={d} onClick={() => setDuree(d)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: `1px solid ${duree === d ? C.accent + '60' : C.border}`, background: duree === d ? `${C.accent}15` : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: duree === d ? C.accent2 : C.text }}>{tarif.toFixed(2)} $</span>
                      <span style={{ fontSize: 12, color: C.muted }}>{d} min · CAD</span>
                    </button>
                  )
                })}
              </div>

              {!user && (
                <div style={{ padding: '10px 14px', background: `${C.warning}10`, border: `1px solid ${C.warning}30`, borderRadius: 9, marginBottom: 14 }}>
                  <p style={{ fontSize: 13, color: C.warning }}>
                    {lang === 'fr' ? '👤 Connecte-toi pour réserver une session.' : '👤 Sign in to book a session.'}
                  </p>
                </div>
              )}

              <button onClick={() => reserver(mOpen)} style={{ width: '100%', padding: '13px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                🔒 {user ? t.mentor_book : (lang === 'fr' ? 'Se connecter pour réserver' : 'Sign in to book')}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 8 }}>{t.refund_policy}</p>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 6 }}>
              🤝 {lang === 'fr' ? 'Trouve ton mentor' : 'Find your mentor'}
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              {profile?.ville_accueil
                ? (lang === 'fr' ? `Mentors disponibles pour toi à ${profile.ville_accueil}` : `Mentors available for you in ${profile.ville_accueil}`)
                : (lang === 'fr' ? '30 ou 45 minutes avec quelqu\'un qui a vécu ce que tu vis.' : '30 or 45 minutes with someone who lived what you\'re living.')}
            </p>
          </div>
          <a href="/auth/register-mentor" style={{ padding: '10px 20px', background: `${C.accent}18`, border: `1px solid ${C.accent}40`, borderRadius: 10, color: C.accent2, fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {lang === 'fr' ? 'Devenir mentor →' : 'Become a mentor →'}
          </a>
        </div>

        {/* ── BANNIÈRE MON AVENIR ── */}
        {!progSujet && (
          <div style={{ padding: '12px 16px', background: `${C.accent}08`, border: `1px solid ${C.accent}25`, borderRadius: 10, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ fontSize: 13, color: C.muted, flex: 1, margin: 0 }}>
              {lang === 'fr'
                ? 'Découvre ton orientation idéale pour trouver des mentors dans ton secteur.'
                : 'Discover your ideal orientation to find mentors in your sector.'}
            </p>
            <a href="/mon-avenir" style={{ fontSize: 13, color: C.accent2, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {lang === 'fr' ? 'Mon Avenir →' : 'My Future →'}
            </a>
          </div>
        )}

        {/* ── FILTRES ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>

          {/* Villes */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              {lang === 'fr' ? 'Ville' : 'City'}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {VILLES_CHIPS.map(v => (
                <button key={v} onClick={() => setFVille(v)} style={chip(fVille === v)}>
                  {v === 'Toutes' ? (lang === 'fr' ? 'Toutes' : 'All') : v}
                </button>
              ))}
            </div>
          </div>

          {/* Sujets */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              {lang === 'fr' ? 'Sujet' : 'Topic'}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setFSujet('')} style={chip(fSujet === '')}>
                {lang === 'fr' ? 'Tous' : 'All'}
              </button>
              {SUJETS_OPTS.map(s => (
                <button key={s} onClick={() => setFSujet(fSujet === s ? '' : s)} style={chip(fSujet === s, '#60A5FA')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Ligne 3 : Langue + Niveau + Prix + Tri */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {lang === 'fr' ? 'Langue' : 'Language'}
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => setFLangue('')} style={chip(fLangue === '')}>
                  {lang === 'fr' ? 'Toutes' : 'All'}
                </button>
                {LANGUES_OPTS.map(l => (
                  <button key={l.id} onClick={() => setFLangue(fLangue === l.id ? '' : l.id)} style={chip(fLangue === l.id, C.rose)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {lang === 'fr' ? 'Niveau' : 'Level'}
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => setFNiveau('')} style={chip(fNiveau === '')}>
                  {lang === 'fr' ? 'Tous' : 'All'}
                </button>
                {NIVEAUX.map(n => (
                  <button key={n.id} onClick={() => setFNiveau(fNiveau === n.id ? '' : n.id)} style={chip(fNiveau === n.id, C.warning)}>
                    {lang === 'fr' ? n.fr : n.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {lang === 'fr' ? 'Prix' : 'Price'}
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                {[
                  { id: 'tous',    fr: 'Tous',    en: 'All'     },
                  { id: 'gratuit', fr: 'Gratuit', en: 'Free'    },
                  { id: 'payant',  fr: 'Payant',  en: 'Paid'    },
                ].map(p => (
                  <button key={p.id} onClick={() => setFPrix(p.id)} style={chip(fPrix === p.id, C.success)}>
                    {lang === 'fr' ? p.fr : p.en}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {lang === 'fr' ? 'Trier par' : 'Sort by'}
              </p>
              <select value={tri} onChange={e => setTri(e.target.value)}
                style={{ padding: '7px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}>
                <option value="note">{lang === 'fr' ? 'Meilleure note' : 'Best rating'}</option>
                <option value="prix_asc">{lang === 'fr' ? 'Prix croissant' : 'Price ↑'}</option>
                <option value="recent">{lang === 'fr' ? 'Plus récent' : 'Most recent'}</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── COMPTEUR RÉSULTATS ── */}
        {ready && (
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>
            {mentorsFiltres.length === 0
              ? (lang === 'fr' ? 'Aucun mentor pour ces critères' : 'No mentors for these filters')
              : lang === 'fr'
                ? `${mentorsFiltres.length} mentor${mentorsFiltres.length > 1 ? 's' : ''} disponible${mentorsFiltres.length > 1 ? 's' : ''}`
                : `${mentorsFiltres.length} mentor${mentorsFiltres.length > 1 ? 's' : ''} available`}
          </p>
        )}

        {/* ── ÉTAT VIDE ── */}
        {ready && mentorsFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🤝</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 8 }}>
              {lang === 'fr' ? 'Aucun mentor disponible' : 'No mentors available'}
            </p>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              {lang === 'fr'
                ? 'Aucun mentor ne correspond à ces critères. Essaie de modifier les filtres ou deviens le premier mentor de ta région.'
                : 'No mentor matches these filters. Try adjusting them or become the first mentor in your area.'}
            </p>
            <a href="/auth/register-mentor" style={{ padding: '11px 24px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'fr' ? 'Devenir le premier mentor →' : 'Become the first mentor →'}
            </a>
            {progSujet && (
              <p style={{ fontSize: 13, color: C.muted, marginTop: 16 }}>
                {lang === 'fr'
                  ? `Pas encore de mentor en "${progSujet}". Tu veux devenir le premier ? →`
                  : `No mentor in "${progSujet}" yet. Want to be the first? →`}
                {' '}
                <a href="/parrainage" style={{ color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>
                  {lang === 'fr' ? 'Programme de parrainage' : 'Referral program'}
                </a>
              </p>
            )}
          </div>
        )}

        {/* ── GRILLE MENTORS ── */}
        {!ready && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 180, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, opacity: 0.5 }} />
            ))}
          </div>
        )}

        {ready && mentorsFiltres.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mentorsFiltres.map(m => {
              const bio = m.bio || ''
              const bioShort = bio.length > 120 ? bio.slice(0, 120) + '…' : bio
              const isExpanded = expanded[m.id]
              const tarif30 = m.tarif_30min || 0
              const tarif45 = m.tarif_45min || 0
              const sujets  = Array.isArray(m.sujets)  ? m.sujets  : []
              const langues = Array.isArray(m.langues) ? m.langues : []

              return (
                <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', transition: 'border-color 0.15s' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Avatar */}
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: `${C.accent}20`, border: `2px solid ${C.accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: C.accent2, flexShrink: 0 }}>
                      {(m.full_name || '?')[0].toUpperCase()}
                    </div>

                    {/* Infos principales */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{m.full_name}</p>
                        {m.note_moyenne > 0 && (
                          <span style={{ fontSize: 13, color: C.warning }}>★ {Number(m.note_moyenne).toFixed(1)}</span>
                        )}
                        {progSujet && (m.sujets || []).includes(progSujet) && (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#52B78820', color: '#52B788', border: '1px solid #52B78840', fontWeight: 600 }}>
                            🎯 {lang === 'fr' ? 'Recommandé pour toi' : 'Recommended for you'}
                          </span>
                        )}
                        {m.avis_count > 0 && (
                          <span style={{ fontSize: 12, color: C.muted }}>({m.avis_count} {lang === 'fr' ? 'avis' : 'reviews'})</span>
                        )}
                        {m.sessions_total > 0 && (
                          <span style={{ fontSize: 12, color: C.muted }}>· {m.sessions_total} sessions</span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
                        🌍 {m.pays_origine} → {m.ville_accueil}
                        {m.annee_arrivee ? ` · ${lang === 'fr' ? 'Arrivé en' : 'Arrived'} ${m.annee_arrivee}` : ''}
                      </p>

                      {/* Sujets */}
                      {sujets.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                          {sujets.slice(0, 5).map(s => (
                            <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: `${C.accent}12`, color: C.accent2, border: `1px solid ${C.accent}20` }}>
                              {s}
                            </span>
                          ))}
                          {sujets.length > 5 && (
                            <span style={{ fontSize: 11, color: C.muted }}>+{sujets.length - 5}</span>
                          )}
                        </div>
                      )}

                      {/* Langues + Niveau */}
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
                        {langues.length > 0 && (
                          <span style={{ fontSize: 12, color: C.muted }}>
                            🗣️ {langues.map(l => l.toUpperCase()).join(' · ')}
                          </span>
                        )}
                        {m.niveau && (
                          <span style={{ fontSize: 12, color: C.muted }}>
                            🎓 {niveauLabel(m.niveau)}
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      {bio.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                            {isExpanded ? bio : bioShort}
                          </p>
                          {bio.length > 120 && (
                            <button onClick={() => setExpanded(p => ({ ...p, [m.id]: !p[m.id] }))}
                              style={{ background: 'none', border: 'none', color: C.accent2, fontSize: 12, cursor: 'pointer', padding: 0, marginTop: 2 }}>
                              {isExpanded ? (lang === 'fr' ? 'voir moins' : 'see less') : (lang === 'fr' ? 'voir plus' : 'read more')}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Tarifs + Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div>
                            <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>30 min</p>
                            <p style={{ fontSize: 17, fontWeight: 700, color: tarif30 === 0 ? C.success : C.accent2 }}>
                              {formatTarif(tarif30)}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>45 min</p>
                            <p style={{ fontSize: 17, fontWeight: 700, color: tarif45 === 0 ? C.success : C.accent2 }}>
                              {formatTarif(tarif45)}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setMOpen(m); setDuree(30); setSujet('') }}
                            style={{ padding: '9px 20px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                            {lang === 'fr' ? 'Réserver →' : 'Book →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CTA DEVENIR MENTOR ── */}
        {ready && (
          <div style={{ marginTop: 40, padding: '28px 28px', background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>
                {lang === 'fr' ? 'Tu as de l\'expérience à partager ?' : 'Do you have experience to share?'}
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>
                {lang === 'fr' ? 'Rejoins les mentors Novae · Garde 70% de chaque session.' : 'Join Novae mentors · Keep 70% of every session.'}
              </p>
            </div>
            <a href="/auth/register-mentor" style={{ padding: '11px 22px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {lang === 'fr' ? 'Devenir mentor →' : 'Become a mentor →'}
            </a>
          </div>
        )}


        <FeedbackSection page="mentors" />
      </main>
    </div>
  )
}
