// pages/entrevue.js — NOVAE v5 — Simulation entrevue IA
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const TYPES = [
  { id: 'emploi',    fr: "💼 Entrevue d'emploi",       en: '💼 Job Interview',           color: '#52B788', desc_fr: 'Prépare-toi pour un poste au Canada', desc_en: 'Prepare for a Canadian job position' },
  { id: 'admission', fr: '🎓 Admission universitaire',  en: '🎓 University Admission',     color: '#60A5FA', desc_fr: 'Entretien de motivation pour un programme', desc_en: 'Motivation interview for a program' },
  { id: 'visa',      fr: '🛂 Entrevue visa / immigration', en: '🛂 Visa / Immigration',    color: '#FBBF24', desc_fr: 'Prépare-toi à l\'entretien consulaire', desc_en: 'Prepare for a consular interview' },
]

const EXEMPLES_CIBLE = {
  emploi:    ['Développeur web', 'Comptable', 'Infirmier(e)', 'Gérant de projet', 'Analyste financier', 'Ingénieur logiciel'],
  admission: ['Master Informatique', 'MBA', 'Maîtrise en droit', 'Master en santé publique', 'Bachelor Commerce'],
  visa:      ['Permis d\'études', 'Visa de travail', 'Résidence permanente', 'CAQ + permis d\'études'],
}

const CONSEILS = {
  emploi: [
    '💡 Utilise la méthode STAR : Situation → Tâche → Action → Résultat',
    '🍁 Mentionne ton intérêt pour la culture canadienne et l\'inclusion',
    '📊 Chiffre tes réalisations : "J\'ai augmenté les ventes de 30%"',
    '🤝 Prépare 2-3 questions à poser au recruteur à la fin',
  ],
  admission: [
    '🎯 Montre un projet professionnel clair et cohérent avec le programme',
    '🌍 Explique pourquoi le Canada et cette université en particulier',
    '📚 Connais le programme : cours, professeurs, laboratoires de recherche',
    '🔄 Parle de comment tu compteras retourner contribuer à ton pays',
  ],
  visa: [
    '📎 Aie tous tes documents prêts : passeport, relevés, lettre d\'admission',
    '🏠 Prouve tes liens avec ton pays d\'origine : famille, propriété, emploi',
    '💰 Justifie tes ressources financières de façon claire et documentée',
    '🎯 Sois précis sur ta date de retour et ton projet post-études',
  ],
}

export default function Entrevue() {
  const { C, lang, profile, sb, userPlan, planLimits } = useApp()

  // ── Étape 1 : config ─────────────────────────────────────────
  const [etape,    setEtape]    = useState('config')  // 'config' | 'session'
  const [typeId,   setTypeId]   = useState('emploi')
  const [cible,    setCible]    = useState('')
  const [cibleInput, setCibleInput] = useState('')

  // ── Étape 2 : session ────────────────────────────────────────
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [streaming,  setStreaming]   = useState(false)
  const [nbEchanges, setNbEchanges] = useState(0)
  const [termine,    setTermine]    = useState(false)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const abortRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (etape === 'session') setTimeout(() => inputRef.current?.focus(), 100)
  }, [etape])

  const demarrer = () => {
    const cibleFinale = cibleInput.trim() || cible
    if (!cibleFinale) return
    setCible(cibleFinale)
    setMessages([])
    setNbEchanges(0)
    setTermine(false)
    setEtape('session')
    // Déclenche la 1ère question de l'IA
    setTimeout(() => envoyer('Bonjour, je suis prêt(e) pour l\'entretien.', [], cibleFinale), 100)
  }

  const envoyer = async (texte, msgHistory, cibleOverride) => {
    const msg = (texte || input).trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg  = { role: 'user', content: msg }
    const history  = [...(msgHistory || messages), userMsg]
    setMessages(history)
    setStreaming(true)

    const assistantIdx = history.length
    setMessages(p => [...p, { role: 'assistant', content: '' }])

    abortRef.current = new AbortController()
    try {
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setMessages(p => {
          const copy = [...p]
          copy[assistantIdx] = { role: 'assistant', content: lang === 'fr' ? 'Connecte-toi pour utiliser cette fonctionnalité.' : 'Sign in to use this feature.' }
          return copy
        })
        return
      }

      const res = await fetch('/api/entrevue', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history, type: typeId, cible: cibleOverride || cible, lang }),
        signal: abortRef.current.signal,
      })
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break
          try {
            const { text } = JSON.parse(raw)
            if (text) setMessages(p => {
              const copy = [...p]
              copy[assistantIdx] = { ...copy[assistantIdx], content: copy[assistantIdx].content + text }
              return copy
            })
          } catch {}
        }
      }
      const nb = (msgHistory || messages).filter(m => m.role === 'user').length + 1
      setNbEchanges(nb)
      if (nb >= 6) setTermine(true)
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMessages(p => {
          const copy = [...p]
          copy[assistantIdx] = { role: 'assistant', content: lang === 'fr' ? "Désolé, une erreur s'est produite." : 'Sorry, an error occurred.' }
          return copy
        })
      }
    } finally { setStreaming(false) }
  }

  const recommencer = () => { setEtape('config'); setCibleInput('') }

  const typeActif  = TYPES.find(t => t.id === typeId) || TYPES[0]
  const exemples   = EXEMPLES_CIBLE[typeId] || []
  const conseils   = CONSEILS[typeId] || []

  // ── ÉCRAN CONFIG ──────────────────────────────────────────────
  if (etape === 'config') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 6 }}>
          🎙️ {lang === 'fr' ? 'Simulation d\'entrevue IA' : 'AI Interview Simulator'}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
          {lang === 'fr'
            ? 'Entraîne-toi avec un recruteur IA avant ton vrai entretien. Feedback en temps réel.'
            : 'Practice with an AI interviewer before your real interview. Real-time feedback.'}
        </p>

        {/* Message limite plan gratuit */}
        {userPlan === 'gratuit' && (
          <div style={{ padding: '20px 24px', background: `${C.warning}10`, border: `1px solid ${C.warning}30`, borderRadius: 12, marginBottom: 32 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              {lang === 'fr' ? 'Disponible à partir du plan Starter' : 'Available from Starter plan'}
            </p>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
              {lang === 'fr'
                ? 'La simulation d\'entrevue IA est une fonctionnalité premium. Passe au plan Starter pour accéder à cette fonctionnalité.'
                : 'AI interview simulation is a premium feature. Upgrade to Starter to access this feature.'}
            </p>
            <a href="/abonnement" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: C.accent, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'fr' ? 'Voir les abonnements →' : 'View plans →'}
            </a>
          </div>
        )}

        {/* Type d'entrevue */}
        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          {lang === 'fr' ? '1. Type d\'entrevue' : '1. Interview type'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => { setTypeId(t.id); setCible(''); setCibleInput('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${typeId === t.id ? t.color + '60' : C.border}`, background: typeId === t.id ? t.color + '10' : C.surface, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {t.id === 'emploi' ? '💼' : t.id === 'admission' ? '🎓' : '🛂'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{lang === 'fr' ? t.fr : t.en}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{lang === 'fr' ? t.desc_fr : t.desc_en}</p>
              </div>
              {typeId === t.id && <span style={{ color: t.color, fontSize: 18 }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Cible */}
        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          {lang === 'fr'
            ? typeId === 'emploi' ? '2. Poste visé' : typeId === 'admission' ? '2. Programme visé' : '2. Type de visa'
            : typeId === 'emploi' ? '2. Target position' : typeId === 'admission' ? '2. Target program' : '2. Visa type'}
        </p>
        <input value={cibleInput} onChange={e => setCibleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && demarrer()}
          placeholder={
            typeId === 'emploi'    ? (lang === 'fr' ? 'ex. Développeur web junior' : 'e.g. Junior web developer') :
            typeId === 'admission' ? (lang === 'fr' ? 'ex. Master Informatique — UdeM' : 'e.g. Master in Computer Science') :
            (lang === 'fr' ? 'ex. Permis d\'études' : 'e.g. Study permit')
          }
          style={{ width: '100%', padding: '11px 14px', background: C.surface, border: `1px solid ${cibleInput ? typeActif.color + '50' : C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

        {/* Suggestions rapides */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28 }}>
          {exemples.map(ex => (
            <button key={ex} onClick={() => setCibleInput(ex)}
              style={{ padding: '5px 13px', borderRadius: 20, border: `1px solid ${cibleInput === ex ? typeActif.color + '50' : C.border}`, background: cibleInput === ex ? typeActif.color + '12' : 'transparent', color: cibleInput === ex ? typeActif.color : C.muted, fontSize: 12, cursor: 'pointer' }}>
              {ex}
            </button>
          ))}
        </div>

        {/* Conseils */}
        <div style={{ padding: '16px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
            {lang === 'fr' ? 'Conseils avant de commencer' : 'Tips before you start'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {conseils.map((c, i) => (
              <p key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{c}</p>
            ))}
          </div>
        </div>

        <button onClick={demarrer} disabled={!cibleInput.trim()}
          style={{ width: '100%', padding: '14px', background: cibleInput.trim() ? typeActif.color : C.border, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, cursor: cibleInput.trim() ? 'pointer' : 'not-allowed', opacity: cibleInput.trim() ? 1 : 0.6 }}>
          🎙️ {lang === 'fr' ? 'Démarrer l\'entrevue →' : 'Start the interview →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 14 }}>
          {lang === 'fr' ? '5–6 questions · Feedback immédiat · Bilan final' : '5–6 questions · Immediate feedback · Final review'}
        </p>
      </main>
    </div>
  )

  // ── ÉCRAN SESSION ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header session */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, background: C.surface, flexShrink: 0 }}>
        <button onClick={recommencer} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: 'pointer' }}>
          ← {lang === 'fr' ? 'Nouvelle session' : 'New session'}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            {typeActif.id === 'emploi' ? '💼' : typeActif.id === 'admission' ? '🎓' : '🛂'} {cible}
          </p>
          <p style={{ fontSize: 11, color: C.muted }}>
            {lang === 'fr' ? typeActif.fr : typeActif.en} · {lang === 'fr' ? `Question ${Math.min(nbEchanges, 6)}/6` : `Question ${Math.min(nbEchanges, 6)}/6`}
          </p>
        </div>
        {/* Barre progression */}
        <div style={{ width: 80, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min((nbEchanges / 6) * 100, 100)}%`, height: '100%', background: typeActif.color, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', maxWidth: 720, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            // Détecte si c'est le message d'amorce invisible
            if (i === 0 && isUser && m.content === 'Bonjour, je suis prêt(e) pour l\'entretien.') return null
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
                {!isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: typeActif.color + '20', border: `1.5px solid ${typeActif.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {typeActif.id === 'emploi' ? '👔' : typeActif.id === 'admission' ? '🎓' : '🛂'}
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '11px 15px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? typeActif.color : C.surface,
                  border: isUser ? 'none' : `1px solid ${C.border}`,
                  fontSize: 14, lineHeight: 1.7,
                  color: isUser ? '#fff' : C.text,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {m.content || (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 0.2, 0.4].map((d, j) => (
                        <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: typeActif.color, display: 'inline-block', animation: `novaDot 1.2s infinite ${d}s` }} />
                      ))}
                    </span>
                  )}
                </div>
                {isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontWeight: 700, color: C.accent2 }}>
                    {profile?.full_name?.[0]?.toUpperCase() || '👤'}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bilan / Input */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface, padding: '12px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {termine && !streaming ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, color: C.success, fontWeight: 600, flex: 1 }}>
                ✅ {lang === 'fr' ? 'Entrevue terminée — le bilan est dans la conversation.' : 'Interview done — see the review above.'}
              </p>
              <button onClick={recommencer} style={{ padding: '9px 20px', background: typeActif.color, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {lang === 'fr' ? '↺ Recommencer' : '↺ Start over'}
              </button>
              <button onClick={() => { setTermine(false) }} style={{ padding: '9px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {lang === 'fr' ? '+ Continuer' : '+ Continue'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer() } }}
                placeholder={lang === 'fr' ? 'Ta réponse... (Entrée pour envoyer, Maj+Entrée pour saut de ligne)' : 'Your answer... (Enter to send, Shift+Enter for new line)'}
                disabled={streaming}
                rows={2}
                style={{ flex: 1, padding: '10px 13px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'system-ui,sans-serif', opacity: streaming ? 0.7 : 1 }}
              />
              <button onClick={() => envoyer()} disabled={!input.trim() || streaming}
                style={{ width: 48, borderRadius: 10, background: input.trim() && !streaming ? typeActif.color : C.border, border: 'none', color: '#fff', fontSize: 20, cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                ↑
              </button>
            </div>
          )}
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: 'center' }}>
            {lang === 'fr' ? 'Sois naturel(le) — réponds comme tu le ferais en vrai.' : 'Be natural — answer as you would in a real interview.'}
          </p>
        </div>
      </div>

      <style>{`@keyframes novaDot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}
