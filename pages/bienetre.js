// pages/bienetre.js — NOVAE v5 — Indice de bien-être étudiant
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ── Semaine courante (lundi) ─────────────────────────────────────
const getSemaineLundi = () => {
  const now  = new Date()
  const day  = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const d    = new Date(now)
  d.setDate(now.getDate() - diff)
  return d.toISOString().split('T')[0]
}

const formatSemaine = (dateStr, lang) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'short' })
}

// ── Config ───────────────────────────────────────────────────────
const SCORE_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const SCORE_LABELS_FR = ['Très difficile', 'Difficile', 'Correct', 'Bien', 'Très bien']
const SCORE_LABELS_EN = ['Very hard', 'Hard', 'Okay', 'Good', 'Very good']

const HUMEURS_FR = ['Solitude / isolement', 'Finances', 'Études / charge de travail', 'Logement', 'Langue / communication', 'Famille éloignée', 'Santé', 'Tout va bien ✨']
const HUMEURS_EN = ['Loneliness / isolation', 'Finances', 'Studies / workload', 'Housing', 'Language / communication', 'Family far away', 'Health', 'All good ✨']

const SCORE_COLOR = (s) => s <= 2 ? '#F87171' : s === 3 ? '#FBBF24' : '#34D399'

const ENCOURAGEMENTS_FR = [
  '', // index 0 unused
  "Tu traverses quelque chose de difficile. Prends soin de toi. 🤗",
  "Les débuts sont durs. C'est normal de ne pas toujours aller bien. 💙",
  "Tu tiens bon — c'est déjà beaucoup. Chaque semaine compte. 💪",
  "Tu gères bien ! Continue à prendre soin de toi. 🌿",
  "Tu rayonnes cette semaine ! Partage cette énergie. 🌟",
]
const ENCOURAGEMENTS_EN = [
  '',
  "You're going through something difficult. Take care of yourself. 🤗",
  "Beginnings are hard. It's okay not to always feel great. 💙",
  "You're holding on — that's already a lot. Every week counts. 💪",
  "You're managing well! Keep taking care of yourself. 🌿",
  "You're shining this week! Share that energy. 🌟",
]

export default function Bienetre() {
  const { C, lang, user, loading: authLoading, sb } = useApp()

  const hasFetched = useRef(false)
  const [historique,   setHistorique]   = useState([])
  const [checkinSem,   setCheckinSem]   = useState(null) // check-in semaine courante
  const [ready,        setReady]        = useState(false)

  // Formulaire
  const [score,        setScore]        = useState(null)
  const [humeurs,      setHumeurs]      = useState([])
  const [note,         setNote]         = useState('')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)

  const semaineCourante = getSemaineLundi()

  useEffect(() => {
    if (authLoading || !sb || !user) return
    if (hasFetched.current) return
    hasFetched.current = true
    charger()
  }, [authLoading, user?.id])

  const getToken = async () => {
    const { data } = await sb.auth.getSession()
    return data.session?.access_token
  }

  const charger = async () => {
    try {
      const token = await getToken()
      const res   = await fetch('/api/bienetre/historique', { headers: { Authorization: `Bearer ${token}` } })
      const { data } = await res.json()
      const hist = data || []
      setHistorique(hist)
      const semCourante = hist.find(h => h.semaine === semaineCourante)
      setCheckinSem(semCourante || null)
    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  const toggleHumeur = (h) => {
    if (humeurs.includes(h)) { setHumeurs(p => p.filter(x => x !== h)); return }
    if (humeurs.length >= 2) return
    setHumeurs(p => [...p, h])
  }

  const enregistrer = async () => {
    if (score === null) return
    setSaving(true)
    try {
      const token  = await getToken()
      const humStr = humeurs.join(' · ')
      const res    = await fetch('/api/bienetre/creer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ score, humeur: humStr, note }),
      })
      const json = await res.json()
      if (res.ok) {
        setCheckinSem(json.data)
        setHistorique(p => {
          const exists = p.find(h => h.semaine === semaineCourante)
          return exists ? p.map(h => h.semaine === semaineCourante ? json.data : h) : [...p, json.data].sort((a, b) => a.semaine.localeCompare(b.semaine))
        })
        setSaved(true)
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  // ── Insights ─────────────────────────────────────────────────
  const derniers4 = historique.slice(-4)
  const moyenne   = derniers4.length > 0 ? derniers4.reduce((s, h) => s + h.score, 0) / derniers4.length : null

  const insight = moyenne === null ? null :
    moyenne >= 4 ? { txt_fr: "🌟 Tu traverses cette période avec résilience !", txt_en: "🌟 You're navigating this period with resilience!", color: '#34D399' } :
    moyenne >= 3 ? { txt_fr: "💪 Tu gères bien — continue à prendre soin de toi", txt_en: "💪 You're managing well — keep taking care of yourself", color: '#FBBF24' } :
    { txt_fr: "🤗 Les débuts sont difficiles — tu n'es pas seul(e)", txt_en: "🤗 Beginnings are hard — you're not alone", color: '#F87171' }

  const besoinRessources = score !== null && score <= 2

  if (!user && !authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
        <p style={{ fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 8 }}>{lang === 'fr' ? 'Connexion requise' : 'Login required'}</p>
        <a href="/auth/login" style={{ padding: '10px 24px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          {lang === 'fr' ? 'Se connecter →' : 'Log in →'}
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
          🌱 {lang === 'fr' ? 'Mon Bien-être' : 'My Wellbeing'}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>
          {lang === 'fr' ? 'Un suivi hebdomadaire pour prendre soin de toi.' : 'A weekly check-in to take care of yourself.'}
        </p>

        {/* ═══ SECTION 1 — Check-in ═══ */}
        {ready && !checkinSem && !saved && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px', marginBottom: 24 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              {lang === 'fr' ? 'Comment tu vas cette semaine ? 🌱' : 'How are you this week? 🌱'}
            </p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
              {lang === 'fr' ? 'Semaine du ' : 'Week of '}{formatSemaine(semaineCourante, lang)}
            </p>

            {/* Q1 — Score */}
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              {lang === 'fr' ? '1. Mon moral général' : '1. My overall mood'}
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {SCORE_EMOJIS.map((emoji, i) => (
                <button key={i} onClick={() => setScore(i + 1)}
                  style={{ flex: 1, padding: '12px 4px', borderRadius: 12, border: `2px solid ${score === i + 1 ? SCORE_COLOR(i + 1) : C.border}`, background: score === i + 1 ? SCORE_COLOR(i + 1) + '18' : C.surface2, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 26 }}>{emoji}</span>
                  <span style={{ fontSize: 10, color: score === i + 1 ? SCORE_COLOR(i + 1) : C.muted, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                    {lang === 'fr' ? SCORE_LABELS_FR[i] : SCORE_LABELS_EN[i]}
                  </span>
                </button>
              ))}
            </div>

            {/* Q2 — Ce qui me pèse */}
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              {lang === 'fr' ? '2. Ce qui me pèse le plus' : '2. What weighs on me most'}
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 400, marginLeft: 8 }}>{lang === 'fr' ? '(max 2)' : '(max 2)'}</span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {(lang === 'fr' ? HUMEURS_FR : HUMEURS_EN).map((h, i) => {
                const selected = humeurs.includes(h)
                const disabled = !selected && humeurs.length >= 2
                return (
                  <button key={i} onClick={() => toggleHumeur(h)} disabled={disabled}
                    style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${selected ? C.accent + '60' : C.border}`, background: selected ? `${C.accent}18` : 'transparent', color: selected ? C.accent2 : disabled ? C.muted + '60' : C.muted, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: selected ? 600 : 400, transition: 'all 0.15s', opacity: disabled ? 0.4 : 1 }}>
                    {selected ? '✓ ' : ''}{h}
                  </button>
                )
              })}
            </div>

            {/* Q3 — Note */}
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {lang === 'fr' ? '3. Un mot pour décrire ma semaine' : '3. One word to describe my week'}
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 400, marginLeft: 8 }}>{lang === 'fr' ? '(optionnel)' : '(optional)'}</span>
            </p>
            <input value={note} onChange={e => setNote(e.target.value.slice(0, 50))}
              placeholder={lang === 'fr' ? 'ex. Stressante, Productive, Solitaire...' : 'e.g. Stressful, Productive, Lonely...'}
              style={{ width: '100%', padding: '10px 13px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />
            <p style={{ fontSize: 11, color: C.muted, textAlign: 'right', marginTop: -16, marginBottom: 20 }}>{note.length}/50</p>

            {/* Ressources si score <= 2 */}
            {besoinRessources && (
              <div style={{ padding: '14px 16px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, marginBottom: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.error, marginBottom: 10 }}>
                  {lang === 'fr' ? '💙 Tu n\'es pas seul(e). Voici des ressources :' : '💙 You\'re not alone. Here are some resources:'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="https://www.torontodistresscentre.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>
                    📞 Distress Centre Canada : 1-800-268-9688
                  </a>
                  <a href="/mentors" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>
                    🤝 {lang === 'fr' ? 'Parler à un mentor Novae →' : 'Talk to a Novae mentor →'}
                  </a>
                  <p style={{ fontSize: 12, color: C.muted }}>
                    {lang === 'fr' ? '🏫 Contacte le service de counseling de ton université' : '🏫 Contact your university counseling service'}
                  </p>
                </div>
              </div>
            )}

            <button onClick={enregistrer} disabled={score === null || saving}
              style={{ width: '100%', padding: '13px', background: score !== null && !saving ? C.accent : C.border, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: score !== null && !saving ? 'pointer' : 'not-allowed', opacity: score !== null ? 1 : 0.5 }}>
              {saving ? '...' : (lang === 'fr' ? '✓ Enregistrer mon check-in' : '✓ Save my check-in')}
            </button>
          </div>
        )}

        {/* ═══ Confirmation après save ═══ */}
        {(saved || (ready && checkinSem)) && (
          <div style={{ padding: '18px 22px', background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 30 }}>{SCORE_EMOJIS[(checkinSem?.score || score || 3) - 1]}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                {lang === 'fr'
                  ? (ENCOURAGEMENTS_FR[checkinSem?.score || score || 3])
                  : (ENCOURAGEMENTS_EN[checkinSem?.score || score || 3])}
              </p>
              <p style={{ fontSize: 12, color: C.muted }}>
                {lang === 'fr' ? 'Check-in enregistré · Semaine du ' : 'Check-in saved · Week of '}
                {formatSemaine(checkinSem?.semaine || semaineCourante, lang)}
              </p>
            </div>
            <button onClick={() => { setCheckinSem(null); setSaved(false); setScore(null); setHumeurs([]); setNote('') }}
              style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: 'pointer' }}>
              {lang === 'fr' ? 'Modifier' : 'Edit'}
            </button>
          </div>
        )}

        {/* Ressources si dernier score <= 2 */}
        {checkinSem?.score <= 2 && (
          <div style={{ padding: '14px 16px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.error, marginBottom: 10 }}>
              {lang === 'fr' ? '💙 Tu n\'es pas seul(e). Des ressources pour toi :' : '💙 You\'re not alone. Resources for you:'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <a href="https://www.torontodistresscentre.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>📞 Distress Centre Canada : 1-800-268-9688</a>
              <a href="/mentors" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>🤝 {lang === 'fr' ? 'Parler à un mentor →' : 'Talk to a mentor →'}</a>
            </div>
          </div>
        )}

        {/* ═══ SECTION 2 — Graphique historique ═══ */}
        {historique.length > 0 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>
              {lang === 'fr' ? '📈 Évolution sur 8 semaines' : '📈 8-week evolution'}
            </p>

            {/* Graphique simplifié en barres verticales */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
              {historique.map((h, i) => {
                const pct    = (h.score / 5) * 100
                const color  = SCORE_COLOR(h.score)
                const isLast = i === historique.length - 1
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                    title={`${formatSemaine(h.semaine, lang)} · ${SCORE_EMOJIS[h.score - 1]} ${lang === 'fr' ? SCORE_LABELS_FR[h.score - 1] : SCORE_LABELS_EN[h.score - 1]}${h.note ? ` · "${h.note}"` : ''}`}>
                    <div style={{ width: '100%', height: `${pct}%`, background: color, borderRadius: '4px 4px 0 0', opacity: isLast ? 1 : 0.65, transition: 'height 0.4s', minHeight: 8 }} />
                    <span style={{ fontSize: 16 }}>{SCORE_EMOJIS[h.score - 1]}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {historique.map((h, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: C.muted }}>{formatSemaine(h.semaine, lang)}</p>
                </div>
              ))}
            </div>

            {/* Score moyen */}
            {moyenne !== null && (
              <p style={{ fontSize: 13, color: C.muted, marginTop: 12, textAlign: 'center' }}>
                {lang === 'fr' ? 'Moyenne sur 4 semaines :' : '4-week average:'} <strong style={{ color: SCORE_COLOR(Math.round(moyenne)) }}>{moyenne.toFixed(1)}/5 {SCORE_EMOJIS[Math.round(moyenne) - 1]}</strong>
              </p>
            )}
          </div>
        )}

        {/* ═══ SECTION 3 — Insights ═══ */}
        {insight && (
          <div style={{ padding: '16px 18px', background: insight.color + '10', border: `1px solid ${insight.color}30`, borderRadius: 14, marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: insight.color, lineHeight: 1.6 }}>
              {lang === 'fr' ? insight.txt_fr : insight.txt_en}
            </p>
            {moyenne !== null && moyenne < 3 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <a href="https://www.torontodistresscentre.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>📞 Distress Centre Canada : 1-800-268-9688</a>
                <a href="/mentors" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>🤝 {lang === 'fr' ? 'Parler à un mentor →' : 'Talk to a mentor →'}</a>
                <a href="/parrainage" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none' }}>🤝 {lang === 'fr' ? 'Trouver un parrain →' : 'Find a peer mentor →'}</a>
              </div>
            )}
          </div>
        )}

        {/* Vide — premier check-in */}
        {ready && !authLoading && !user && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌱</p>
            <p style={{ fontSize: 14, color: C.muted }}>{lang === 'fr' ? 'Connecte-toi pour accéder à ton suivi bien-être.' : 'Log in to access your wellbeing tracker.'}</p>
          </div>
        )}
      </main>
    </div>
  )
}
