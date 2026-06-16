// pages/dashboard.js — NOVAE v5 — Profil vivant
import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import FeedbackSection from '../components/FeedbackSection'
import { useAuthFetch } from '../lib/useAuthFetch'
import SAFE_LINKS from '../lib/safeLinks'

// ── Widget Bien-être compact ──────────────────────────────────────
const SCORE_EMOJIS_DB = ['😔', '😕', '😐', '🙂', '😊']
const getSemLundi = () => {
  const now = new Date(); const day = now.getDay()
  const d = new Date(now); d.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split('T')[0]
}
function BienetreWidget({ C, lang, sb }) {
  const [checkin, setCheckin] = useState(undefined) // undefined=loading, null=absent, obj=présent
  useEffect(() => {
    if (!sb) return
    const load = async () => {
      try {
        const { data: { session } } = await sb.auth.getSession()
        if (!session?.access_token) { setCheckin(null); return }
        const res  = await fetch('/api/bienetre/historique', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const json = await res.json()
        const sem  = getSemLundi()
        const found = (json.data || []).find(h => h.semaine === sem)
        setCheckin(found || null)
      } catch { setCheckin(null) }
    }
    load()
  }, [sb])

  if (checkin === undefined) return null

  if (checkin === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', background: '#0E111607', border: '1px solid #0E111620', borderRadius: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🌱</span>
        <p style={{ fontSize: 13, color: 'var(--text-h1)', fontWeight: 500 }}>
          {lang === 'fr' ? 'Check-in bien-être — 1 minute' : 'Wellbeing check-in — 1 minute'}
        </p>
      </div>
      <a href="/bienetre" style={{ padding: '6px 14px', background: '#0E1116', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        {lang === 'fr' ? 'Commencer →' : 'Start →'}
      </a>
    </div>
  )

  const numSem = Math.ceil((new Date(checkin.semaine) - new Date(new Date().getFullYear(), 0, 1)) / 604800000)
  const scoreColor = checkin.score <= 2 ? '#DC2626' : checkin.score === 3 ? '#6B6F76' : '#3A3D40'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: scoreColor + '08', border: `1px solid ${scoreColor}25`, borderRadius: 12, marginBottom: 16 }}>
      <span style={{ fontSize: 22 }}>{SCORE_EMOJIS_DB[checkin.score - 1]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(checkin.score / 5) * 100}%`, height: '100%', background: scoreColor, borderRadius: 3 }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {lang === 'fr' ? `Semaine ${numSem}/52` : `Week ${numSem}/52`}
          {checkin.note ? ` · "${checkin.note}"` : ''}
        </p>
      </div>
      <a href="/bienetre" style={{ fontSize: 12, color: scoreColor, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        {lang === 'fr' ? 'Voir →' : 'View →'}
      </a>
    </div>
  )
}

// ── Calcul jours bulletproof ──────────────────────────────────────
const calcJours = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff > 36500) return null
  return diff // négatif = dans le futur, positif = passé
}

// ── Complétion du profil ──────────────────────────────────────────
const calcCompletion = (p) => {
  if (!p) return 0
  const champs = ['full_name','pays_origine','pays_accueil','ville_accueil','statut','date_arrivee','universite','programme']
  const remplis = champs.filter(c => p[c] && p[c] !== '').length
  return Math.round((remplis / champs.length) * 100)
}

// ── Alertes intelligentes basées sur le profil réel ──────────────
const getAlertes = (profil, lang) => {
  if (!profil?.date_arrivee) return []
  const jours = calcJours(profil.date_arrivee)
  if (jours === null) return []
  const alertes = []
  const now = new Date()

  if (jours < 0) {
    const joursAvant = Math.abs(jours)
    if (joursAvant <= 30)
      alertes.push({
        type: 'info',
        titre: lang === 'fr' ? `Dans ${joursAvant} jour${joursAvant > 1 ? 's' : ''} — Prépare ton arrivée` : `In ${joursAvant} day${joursAvant > 1 ? 's' : ''} — Prepare your arrival`,
        message: lang === 'fr' ? "Vérifie que ton visa, permis d'études et logement sont confirmés." : 'Make sure your visa, study permit and housing are confirmed.',
        lien: null,
      })
    return alertes
  }

  if (profil.pays_accueil === 'Canada') {
    const arrivee = new Date(profil.date_arrivee)
    const villesQC = ['montréal','montreal','québec','quebec','gatineau','laval','sherbrooke','longueuil']
    const estQC = villesQC.some(v => (profil.ville_accueil || '').toLowerCase().includes(v))

    if (estQC) {
      const ecRAMQ = new Date(arrivee.getTime() + 84 * 86400000)
      const jRAMQ = Math.ceil((ecRAMQ - now) / 86400000)
      if (jRAMQ > 0 && jRAMQ <= 84)
        alertes.push({ type: jRAMQ <= 14 ? 'urgent' : 'warning', titre: lang === 'fr' ? `RAMQ — ${jRAMQ} jour${jRAMQ > 1 ? 's' : ''} restant${jRAMQ > 1 ? 's' : ''}` : `RAMQ — ${jRAMQ} day${jRAMQ > 1 ? 's' : ''} left`, message: lang === 'fr' ? "Inscris-toi maintenant. Passeport + permis + preuve d'adresse." : 'Register now. Passport + permit + proof of address.', lien: SAFE_LINKS.ramq.url })
    }

    const annee = now.getFullYear()
    const ecImp = new Date(`${annee}-04-30`)
    const jImp = Math.ceil((ecImp - now) / 86400000)
    if (jImp > 0 && jImp <= 75)
      alertes.push({ type: 'info', titre: lang === 'fr' ? `Impôts — ${jImp} jours avant le 30 avril` : `Taxes — ${jImp} days before April 30`, message: lang === 'fr' ? 'Tu as droit à des crédits. Ne rate pas ça.' : "You have tax credits available. Don't miss them.", lien: SAFE_LINKS.arc.url })
  }
  return alertes
}

// ── Tâches adaptées selon province ───────────────────────────────
const TACHES_CANADA = [
  { id:1,  titre:"Obtenir ton NAS (Numéro d'Assurance Sociale)",   titre_en:"Get your SIN (Social Insurance Number)",      cat:'admin',   prio:'critique', lien:SAFE_LINKS.serviceCanada.url, icone:'🪪', provinces:null },
  { id:2,  titre:"Ouvrir un compte bancaire étudiant",             titre_en:"Open a student bank account",                 cat:'banque',  prio:'critique', lien:null, icone:'🏦', provinces:null },
  { id:3,  titre:"S'inscrire à la RAMQ (Québec uniquement)",       titre_en:"Register for RAMQ (Quebec only)",             cat:'sante',   prio:'critique', lien:SAFE_LINKS.ramq.url, icone:'🏥', provinces:['QC'] },
  { id:4,  titre:"S'inscrire à OHIP (Ontario uniquement)",         titre_en:"Register for OHIP (Ontario only)",            cat:'sante',   prio:'critique', lien:SAFE_LINKS.ohip.url, icone:'🏥', provinces:['ON'] },
  { id:5,  titre:"Demander une carte de crédit sécurisée",         titre_en:"Apply for a secured credit card",             cat:'banque',  prio:'haute',    lien:null, icone:'💳', provinces:null },
  { id:6,  titre:"Activer le permis de travail hors campus",       titre_en:"Activate off-campus work permit",             cat:'admin',   prio:'haute',    lien:SAFE_LINKS.ircc.url, icone:'📋', provinces:null },
  { id:7,  titre:"S'inscrire à l'assurance maladie universitaire", titre_en:"Register for university health insurance",     cat:'sante',   prio:'haute',    lien:null, icone:'🩺', provinces:null },
  { id:8,  titre:"Explorer les quartiers et le transport",         titre_en:"Explore neighborhoods and transit",           cat:'logement',prio:'normale',  lien:null, icone:'🗺️', provinces:null },
  { id:9,  titre:"Rejoindre un groupe de compatriotes",            titre_en:"Join a community group",                      cat:'social',  prio:'normale',  lien:null, icone:'🤝', provinces:null },
  { id:10, titre:"Comprendre ton programme universitaire",         titre_en:"Understand your university program",          cat:'univ',    prio:'haute',    lien:null, icone:'🎓', provinces:null },
]

const PRIO_ORDER = { critique: 0, haute: 1, normale: 2 }

const WHY_MSG = {
  admin:    { fr: "Tes droits légaux et ton accès aux services en dépendent.", en: "Your legal rights and access to services depend on it." },
  banque:   { fr: "Sans compte bancaire tu ne peux pas recevoir de paiements ni payer en ligne.", en: "Without a bank account you cannot receive or make payments online." },
  sante:    { fr: "La couverture santé est prioritaire — tout imprévu médical peut coûter très cher.", en: "Health coverage is a priority — any medical surprise can be very costly." },
  logement: { fr: "Un logement stable te permettra de te concentrer sur tes études.", en: "Stable housing will let you focus on your studies." },
  social:   { fr: "Ton réseau est ta force — commence à le bâtir maintenant.", en: "Your network is your strength — start building it now." },
  univ:     { fr: "Comprendre ton programme dès le départ te donnera un avantage certain.", en: "Understanding your program from day one gives you a real edge." },
}

const CAT_STYLE = {
  admin:    { label:'Admin',      labelEn:'Admin',     color:'var(--text-body)', bg:'#F0F0EE' },
  banque:   { label:'Banque',     labelEn:'Banking',   color:'var(--text-body)', bg:'#F0F0EE' },
  sante:    { label:'Santé',      labelEn:'Health',    color:'var(--text-body)', bg:'#EBEBE9'  },
  logement: { label:'Logement',   labelEn:'Housing',   color:'var(--text-body)', bg:'#EBEBE9' },
  social:   { label:'Social',     labelEn:'Social',    color:'var(--text-muted)', bg:'#F7F7F5' },
  univ:     { label:'Université', labelEn:'University',color:'var(--text-body)', bg:'#F0F0EE'  },
}

const getProvince = (ville) => {
  if (!ville) return null
  const v = ville.toLowerCase()
  const ON = ['ottawa','toronto','hamilton','london','windsor','kingston','waterloo','mississauga','brampton','markham','vaughan','richmond hill','oakville','burlington','oshawa','barrie','sudbury','thunder bay','guelph']
  const QC = ['montréal','montreal','québec','quebec','gatineau','laval','sherbrooke','longueuil','lévis','levis','terrebonne','brossard','repentigny','saint-jean','drummondville','saguenay','trois-rivières']
  if (ON.some(c => v.includes(c))) return 'ON'
  if (QC.some(c => v.includes(c))) return 'QC'
  return null
}

const filtrerTaches = (taches, province) => taches.filter(t => {
  if (!t.provinces) return true
  if (!province) return false
  return t.provinces.includes(province)
})

export default function Dashboard() {
  const { C, t, lang, theme, user, profile, loading: authLoading, sb, refreshProfile } = useApp()
  const { authFetch } = useAuthFetch()

  const hasFetched    = useRef(false)
  const checklistRef  = useRef(null)

  const [tab,       setTab]       = useState('checklist')
  const [filtre,    setFiltre]    = useState('tous')
  const [faites,    setFaites]    = useState([])
  const [mentors,   setMentors]   = useState([])
  const [guides,    setGuides]    = useState([])
  const [todos,     setTodos]     = useState([])
  const [todoInput, setTodoInput] = useState('')
  const [mOpen,     setMOpen]     = useState(null)
  const [duree,     setDuree]     = useState(30)
  const [paying,    setPaying]    = useState(false)
  const [ready,     setReady]     = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [monAvenirResult, setMonAvenirResult] = useState(null)
  const [scoreDoc,   setScoreDoc]   = useState(null) // nb docs ajoutés

  const genererRecommandations = async () => {
    if (!profile || !user) return
    setGenLoading(true)
    try {
      const payload = { profile: { ...profile, id: user.id } }
      const res = await authFetch('/api/generate-recommendations', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) refreshProfile()
      else console.error('[generer] Erreur API:', data.error)
    } catch (e) {
      console.error('[generer] Erreur fetch:', e.message)
    }
    finally { setGenLoading(false) }
  }

  useEffect(() => {
    if (authLoading || !sb) return
    if (hasFetched.current) return
    hasFetched.current = true
    loadAll()
    // Charge le résultat du quiz Mon Avenir depuis localStorage
    try {
      const saved = localStorage.getItem('novae_quiz_result')
      if (saved) setMonAvenirResult(JSON.parse(saved))
    } catch {}
    // Charge le nombre de documents (non bloquant)
    if (user) chargerScoreDoc()
  }, [authLoading, user?.id])

  const chargerScoreDoc = async () => {
    try {
      const res = await authFetch('/api/documents')
      const json = await res.json()
      setScoreDoc((json.data || []).length)
    } catch {}
  }

  const loadAll = async () => {
    try {
      if (user) {
        // Cache localStorage pour affichage immédiat
        try {
          const cached = JSON.parse(localStorage.getItem('novae_faites') || '[]')
          if (cached.length) setFaites(cached)
        } catch {}

        const { data: faitesData } = await sb
          .from('taches_completees')
          .select('tache_id')
          .eq('user_id', user.id)
          .eq('completee', true)

        const ids = (faitesData || []).map(f => Number(f.tache_id) || f.tache_id)
        setFaites(ids)
        try { localStorage.setItem('novae_faites', JSON.stringify(ids)) } catch {}

        const { data: todosData } = await sb.from('todos').select('*').eq('utilisateur_id', user.id).order('created_at')
        setTodos(todosData || [])
      } else {
        setFaites(JSON.parse(localStorage.getItem('novae_faites') || '[]'))
        setTodos(JSON.parse(localStorage.getItem('novae_todos') || '[]'))
      }

      const { data: mentorsData } = await sb.from('mentors').select('*').eq('actif', true).eq('disponible', true).order('note_moyenne', { ascending: false })
      setMentors(mentorsData || [])

      const { data: guidesData } = await sb.from('guides').select('*').eq('publie', true).order('ordre')
      setGuides(guidesData || [])

    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  const toggleTache = async (id) => {
    const estFaite = faites.includes(id)
    const next = estFaite ? faites.filter(i => i !== id) : [...faites, id]
    setFaites(next)
    try { localStorage.setItem('novae_faites', JSON.stringify(next)) } catch {}
    if (user) {
      await sb.from('taches_completees').upsert(
        { user_id: user.id, tache_id: String(id), completee: !estFaite },
        { onConflict: 'user_id,tache_id' }
      )
    }
  }

  const addTodo = async () => {
    if (!todoInput.trim()) return
    if (user) {
      const { data } = await sb.from('todos').insert({ utilisateur_id: user.id, titre: todoInput.trim() }).select().single()
      if (data) setTodos(p => [...p, data])
    } else {
      const todo = { id: Date.now().toString(), titre: todoInput.trim(), complete: false }
      const next = [...todos, todo]
      setTodos(next); localStorage.setItem('novae_todos', JSON.stringify(next))
    }
    setTodoInput('')
  }

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const next = todos.map(t => t.id === id ? { ...t, complete: !t.complete } : t)
    setTodos(next)
    if (user) await sb.from('todos').update({ complete: !todo.complete }).eq('id', id)
    else localStorage.setItem('novae_todos', JSON.stringify(next))
  }

  const deleteTodo = async (id) => {
    const next = todos.filter(t => t.id !== id)
    setTodos(next)
    if (user) await sb.from('todos').delete().eq('id', id)
    else localStorage.setItem('novae_todos', JSON.stringify(next))
  }

  const reserver = async (mentor) => {
    setPaying(true); setMOpen(null)
    try {
      const prix = duree === 30 ? (mentor.tarif_30min || 1499) / 100 : (mentor.tarif_45min || 1999) / 100
      const res = await fetch('/api/sessions/creer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mentorId: mentor.id, mentorNom: mentor.full_name, sujet: (mentor.sujets || ['Général'])[0], dureeMinutes: duree, montantCAD: prix }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Configure ta clé Stripe dans .env.local')
    } catch (e) { alert(e.message) }
    finally { setPaying(false) }
  }

  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'#0E1116', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', margin:'0 auto 14px' }}>N</div>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>{t.loading}</p>
      </div>
    </div>
  )

  // ── Données calculées depuis le profil Supabase (AppContext) ──────
  const province   = getProvince(profile?.ville_accueil)
  const taches     = filtrerTaches(TACHES_CANADA, province)
  const jours      = calcJours(profile?.date_arrivee)
  const completion = calcCompletion(profile)
  const alertes    = getAlertes(profile, lang)
  const prog       = taches.length > 0 ? Math.round((faites.length / taches.length) * 100) : 0
  const tF         = filtre === 'tous' ? taches : filtre === 'a_faire' ? taches.filter(t => !faites.includes(t.id)) : taches.filter(t => faites.includes(t.id))
  const nextAction = ready
    ? (taches.filter(t => !faites.includes(t.id))
        .sort((a, b) => (PRIO_ORDER[a.prio] ?? 3) - (PRIO_ORDER[b.prio] ?? 3))[0] || null)
    : null

  // ── Score préparation dossier ─────────────────────────────────
  const calcScore = () => {
    if (!user) return null
    const pts = []
    // 1. Profil (30 pts)
    pts.push({ label: lang === 'fr' ? 'Profil complété'  : 'Profile',    labelEn: 'Profile',    pts: Math.round((completion / 100) * 30), max: 30, color: 'var(--text-body)', href: '/profile_1' })
    // 2. Checklist (25 pts)
    const pctCheck = taches.length > 0 ? faites.length / taches.length : 0
    pts.push({ label: lang === 'fr' ? 'Tâches checklist' : 'Checklist',  labelEn: 'Checklist',  pts: Math.round(pctCheck * 25),          max: 25, color: 'var(--text-body)', href: null })
    // 3. Documents (20 pts)
    const ptsDoc = scoreDoc === null ? null : Math.min(Math.round((scoreDoc / 5) * 20), 20)
    pts.push({ label: lang === 'fr' ? 'Documents ajoutés': 'Documents',  labelEn: 'Documents',  pts: ptsDoc ?? 0, max: 20, color: 'var(--text-body)', href: '/documents', loading: scoreDoc === null })
    // 4. CV créé (15 pts)
    const hasCv = typeof window !== 'undefined' && !!localStorage.getItem('novae_cv_nom')
    pts.push({ label: lang === 'fr' ? 'CV créé'           : 'Resume',    labelEn: 'Resume',     pts: hasCv ? 15 : 0,                       max: 15, color: 'var(--text-body)', href: '/cv' })
    // 5. Mon Avenir (10 pts)
    pts.push({ label: lang === 'fr' ? 'Projet d\'avenir'  : 'Future plan',labelEn:'Future plan', pts: monAvenirResult ? 10 : 0,             max: 10, color: 'var(--text-muted)', href: '/mon-avenir' })
    return pts
  }
  const scoreItems = calcScore()
  const scoreTotal = scoreItems ? scoreItems.reduce((s, i) => s + i.pts, 0) : 0
  const scoreColor = scoreTotal >= 80 ? '#3A3D40' : scoreTotal >= 50 ? '#6B6F76' : '#DC2626'
  const scoreBadge = scoreTotal >= 80
    ? (lang === 'fr' ? 'Excellent' : 'Excellent')
    : scoreTotal >= 50
    ? (lang === 'fr' ? 'En bonne voie' : 'On track')
    : (lang === 'fr' ? 'À compléter' : 'Needs work')

  const jouDisplayVal   = jours === null ? 'J+0' : jours < 0 ? `J-${Math.abs(jours)}` : `J+${jours}`
  const jouDisplayColor = jours !== null && jours < 0 ? '#6B6F76' : '#9A9D9F'
  const jouDisplayLabel = jours !== null && jours < 0 ? (lang === 'fr' ? 'Avant l\'arrivée' : 'Before arrival') : (lang === 'fr' ? 'Depuis l\'arrivée' : 'Since arrival')

  const prenom = profile?.full_name ? profile.full_name.split(' ')[0] : null

  const TABS = [
    { id:'checklist', label: t.nav_checklist },
    { id:'mentors',   label: t.nav_mentors   },
    { id:'guides',    label: t.ebook_title   },
    { id:'todo',      label: t.nav_todo      },
  ]

  const isDark = theme === 'dark'
  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    boxShadow: 'none',
    padding: '20px 22px',
    marginBottom: 12,
  }

  // Stepper parcours
  const stepIdx = scoreTotal < 33 ? 0 : scoreTotal < 67 ? 1 : 2
  const STEPS = [
    { fr: 'Arrivée',      en: 'Arrival'    },
    { fr: 'Installation', en: 'Settlement' },
    { fr: 'Autonomie',    en: 'Autonomy'   },
  ]

  return (
    <div style={{ color: 'var(--text-h1)' }}>

      {paying && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <p style={{ color:'var(--text-h1)', fontSize:16, fontWeight:600 }}>{lang === 'fr' ? 'Redirection vers le paiement...' : 'Redirecting to payment...'}</p>
        </div>
      )}

      {/* Modal mentor */}
      {mOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={() => setMOpen(null)}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, width:'100%', maxWidth:420, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:'#0E111620', border:'1.5px solid #0E111640', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, color:'var(--text-body)' }}>{(mOpen.full_name||'?')[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:17, color:'var(--text-h1)' }}>{mOpen.full_name}</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{mOpen.pays_origine} → {mOpen.ville_accueil}</p>
                  {mOpen.note_moyenne > 0 && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>★ {Number(mOpen.note_moyenne).toFixed(1)} · {mOpen.sessions_total} sessions</p>}
                </div>
              </div>
              <button onClick={() => setMOpen(null)} style={{ width:30, height:30, borderRadius:'50%', border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
            <div style={{ padding:'18px 24px' }}>
              {mOpen.bio && <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7, marginBottom:18 }}>{mOpen.bio}</p>}
              <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>{lang === 'fr' ? 'Durée' : 'Duration'}</p>
              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                {[30,45].map(d => {
                  const tarif = ((d === 30 ? mOpen.tarif_30min : mOpen.tarif_45min) || (d === 30 ? 1499 : 1999)) / 100
                  return (
                    <button key={d} onClick={() => setDuree(d)} style={{ flex:1, padding:'13px', borderRadius:10, border:`1px solid ${duree === d ? '#0E111660' : '#EBEBE9'}`, background: duree === d ? '#0E111615' : 'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:18, fontWeight:700, color: duree === d ? '#3A3D40' : '#0E1116' }}>{tarif.toFixed(2)} $</span>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d} min · CAD</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => reserver(mOpen)} style={{ width:'100%', padding:'13px', background:'#0E1116', border:'none', borderRadius:10, color:'#fff', fontWeight:600, fontSize:15, cursor:'pointer' }}>🔒 {t.mentor_book}</button>
              <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:8 }}>{t.refund_policy}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 24, maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' }}>

        {/* ── COLONNE PRINCIPALE ── */}
        <div style={{ minWidth: 0 }}>

        {/* ── STEPPER PARCOURS ── */}
        {user && (
          <div style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              {lang === 'fr' ? 'Ton parcours' : 'Your journey'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((s, i) => {
                const done   = i < stepIdx
                const active = i === stepIdx
                const future = i > stepIdx
                return (
                  <React.Fragment key={i}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? '#0E1116' : active ? '#FFFFFF' : '#FFFFFF',
                        border: done ? 'none' : active ? '1.5px solid #0E1116' : '1.5px solid #D5D5D2',
                        flexShrink: 0,
                      }}>
                        {done
                          ? <span style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 700 }}>✓</span>
                          : <span style={{ fontSize: 10, color: active ? '#0E1116' : '#9A9D9F', fontWeight: 600 }}>{i + 1}</span>
                        }
                      </div>
                      <span style={{ fontSize: 11, fontWeight: active || done ? 500 : 400, color: future ? '#9A9D9F' : '#0E1116', whiteSpace: 'nowrap' }}>
                        {lang === 'fr' ? s.fr : s.en}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 1, background: i < stepIdx ? '#0E1116' : '#EBEBE9', margin: '0 8px', marginBottom: 20 }} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* ── HEADER PERSONNALISÉ ── */}
        {profile && prenom ? (
          <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 28, padding: '24px 28px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            {/* Skyline SVG décoratif */}
            <svg
              style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '45%', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }}
              viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax slice"
            >
              <rect x="320" y="60" width="30" height="140" fill="#0E1116"/>
              <rect x="280" y="80" width="25" height="120" fill="#0E1116"/>
              <rect x="240" y="100" width="20" height="100" fill="#0E1116"/>
              <rect x="200" y="70" width="28" height="130" fill="#0E1116"/>
              <rect x="160" y="110" width="22" height="90" fill="#0E1116"/>
              <rect x="130" y="90" width="18" height="110" fill="#0E1116"/>
              <rect x="100" y="120" width="20" height="80" fill="#0E1116"/>
              <rect x="60"  y="95"  width="26" height="105" fill="#0E1116"/>
              <rect x="20"  y="130" width="24" height="70"  fill="#0E1116"/>
              <rect x="330" y="40" width="8"  height="20"  fill="#0E1116"/>
              <rect x="204" y="50" width="6"  height="20"  fill="#0E1116"/>
              <rect x="283" y="62" width="5"  height="18"  fill="#0E1116"/>
            </svg>
            {/* Contenu header */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-h1)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 4 }}>
                {lang === 'fr' ? `Bienvenue, ${prenom} 👋` : `Welcome, ${prenom} 👋`}
              </h1>
              <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginTop: 4 }}>
                {[
                  profile.statut === 'etudiant'    ? (lang === 'fr' ? 'Étudiant(e)' : 'Student')      : null,
                  profile.statut === 'travailleur' ? (lang === 'fr' ? 'Travailleur(se)' : 'Worker')   : null,
                  profile.statut === 'famille'     ? (lang === 'fr' ? 'Famille' : 'Family')           : null,
                  profile.programme  ? `${lang === 'fr' ? 'en' : 'in'} ${profile.programme}`          : null,
                  profile.universite ? `${lang === 'fr' ? 'à' : 'at'} ${profile.universite}`          : null,
                  profile.ville_accueil ? `· ${profile.ville_accueil}${profile.pays_accueil ? `, ${profile.pays_accueil}` : ''}` : null,
                ].filter(Boolean).join(' ')}
              </p>
            </div>
          </div>
        ) : user ? (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-h1)', letterSpacing: '-0.03em', marginBottom: 8 }}>
              {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            </h1>
            <a href="/profile_1" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
              {lang === 'fr' ? '→ Complète ton profil pour personnaliser ton expérience' : '→ Complete your profile for a personalized experience'}
            </a>
          </div>
        ) : (
          <div style={{ padding: '12px 18px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Crée un compte pour sauvegarder ta progression.' : 'Create an account to save your progress.'}</p>
            <a href="/auth/register" style={{ padding: '7px 16px', background: '#0E1116', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{lang === 'fr' ? "S'inscrire gratuitement →" : 'Sign up for free →'}</a>
          </div>
        )}

        {/* ── BARRE DE COMPLÉTION DU PROFIL ── */}
        {user && completion < 80 && (
          <div style={{ padding:'14px 18px', background:'#6B6F7608', border:'1px solid #6B6F7625', borderRadius:12, marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>
                {lang === 'fr' ? `Profil complété à ${completion}%` : `Profile ${completion}% complete`}
              </p>
              <div style={{ height:6, background:'#6B6F7620', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${completion}%`, height:'100%', background:'#6B6F76', borderRadius:3, transition:'width 0.5s' }} />
              </div>
            </div>
            <a href="/profile_1" style={{ padding:'7px 14px', background:'#6B6F7615', border:'1px solid #6B6F7635', borderRadius:8, color:'var(--text-muted)', fontWeight:600, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
              {lang === 'fr' ? 'Compléter mon profil →' : 'Complete profile →'}
            </a>
          </div>
        )}

        {/* ── ALERTES INTELLIGENTES ── */}
        {alertes.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderRadius:11, border:'1px solid', marginBottom:10, borderColor: a.type === 'urgent' ? '#DC2626' : a.type === 'warning' ? '#6B6F76' : '#0E111650', background: a.type === 'urgent' ? 'rgba(220,38,38,0.06)' : a.type === 'warning' ? '#F7F7F5' : '#0E111608' }}>
            <span style={{ fontSize:16 }}>{a.type === 'urgent' ? '🔴' : a.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600, fontSize:13, color:'var(--text-h1)', marginBottom:2 }}>{a.titre}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{a.message}</p>
            </div>
            {a.lien && <a href={a.lien} target="_blank" rel="noreferrer" style={{ padding:'6px 12px', background:'#0E111618', border:'1px solid #0E111635', borderRadius:7, color:'var(--text-body)', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>{lang === 'fr' ? 'Agir →' : 'Act →'}</a>}
          </div>
        ))}

        {/* ── PROCHAINE ACTION RECOMMANDÉE ── */}
        {user && nextAction && (
          <div style={{ padding: '20px 22px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16, boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#0E1116', flexShrink: 0 }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                {lang === 'fr' ? 'Prochaine étape' : 'Next step'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, background: 'var(--bg-subtle)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {nextAction.icone}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h1)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  {lang === 'fr' ? nextAction.titre : (nextAction.titre_en || nextAction.titre)}
                </p>
                <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {WHY_MSG[nextAction.cat]?.[lang] || ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setTab('checklist')
                  setFiltre('a_faire')
                  setTimeout(() => checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
                }}
                style={{ padding: '10px 20px', background: '#0E1116', border: 'none', borderRadius: 6, color: '#FFFFFF', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {lang === 'fr' ? "Je m'en occupe →" : "I'll handle it →"}
              </button>
            </div>
          </div>
        )}

        {/* ── SCORE PRÉPARATION DOSSIER ── */}
        {user && scoreItems && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.03)' }}>
            {/* Header score */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-h1)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  {lang === 'fr' ? 'Score de préparation' : 'Readiness Score'}
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-faint)' }}>{lang === 'fr' ? "Ton dossier d'immigration en un coup d'œil" : 'Your immigration file at a glance'}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-h1)', letterSpacing: '-0.04em', lineHeight: 1 }}>{scoreTotal}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-faint)', paddingBottom: 6, marginLeft: 2 }}>/100</span>
                </div>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: scoreTotal >= 80 ? '#F0F0EE' : '#F7F7F5', color: scoreTotal >= 80 ? '#3A3D40' : '#6B6F76' }}>
                  {scoreBadge}
                </span>
              </div>
            </div>

            {/* Barre globale */}
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${scoreTotal}%`, height: '100%', background: '#0E1116', borderRadius: 999, transition: 'width 0.6s ease' }} />
            </div>

            {/* Lignes détail */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {scoreItems.map((item, i) => {
                const done = item.pts === item.max
                const extra = item.max - item.pts
                const content = (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < scoreItems.length - 1 ? '1px solid #F7F7F5' : 'none', cursor: item.href ? 'pointer' : 'default' }}>
                    {done
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#0E1116', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>✓</span></span>
                      : <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                    }
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', flex: 1 }}>{item.label}</p>
                    {item.loading
                      ? <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>…</span>
                      : <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>{item.pts}/{item.max}</span>
                    }
                    {done && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'var(--badge-done-bg)', color: 'var(--text-body)' }}>{lang === 'fr' ? 'Terminé' : 'Done'}</span>}
                    {!done && item.href && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>+{extra}</span>}
                  </div>
                )
                return item.href && !done
                  ? <a key={i} href={item.href} style={{ textDecoration: 'none' }}>{content}</a>
                  : <div key={i}>{content}</div>
              })}
            </div>

            {scoreTotal < 100 && (
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, textAlign: 'center' }}>
                ℹ️ {lang === 'fr' ? 'Clique sur une ligne pour compléter ce point.' : 'Click a line to complete that item.'}
              </p>
            )}
          </div>
        )}

        {/* ── MINI-CARDS SCORE + DEPUIS ARRIVÉE ── */}
        {user && scoreItems && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Score</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-h1)' }}>{scoreTotal}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-faint)' }}>/100</span></p>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{lang === 'fr' ? 'Depuis arrivée' : 'Since arrival'}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-h1)' }}>{jouDisplayVal}</p>
            </div>
          </div>
        )}

        {/* ── WIDGET BIEN-ÊTRE ── */}
        {user && <BienetreWidget C={C} lang={lang} sb={sb} />}

        {/* ── CARTE MON AVENIR ── */}
        {user && (
          monAvenirResult ? (
            /* Quiz déjà complété — carte compacte */
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 18px', background:'#0E111608', border:'1px solid #0E111620', borderRadius:12, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{monAvenirResult.top?.[0]?.emoji || '📊'}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-h1)' }}>
                    {lang === 'fr' ? 'Ton orientation' : 'Your path'} : {monAvenirResult.top?.[0]?.nom?.[lang] || '—'}
                  </p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {lang === 'fr' ? 'Compatibilité' : 'Match'} {monAvenirResult.top?.[0]?.pct || 0}%
                  </p>
                </div>
              </div>
              <a href="/mon-avenir" style={{ padding:'7px 16px', background:'#0E111615', border:'1px solid #0E111635', borderRadius:8, color:'var(--text-body)', fontWeight:600, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
                {lang === 'fr' ? 'Explorer ma vision →' : 'Explore my vision →'}
              </a>
            </div>
          ) : (
            /* Quiz pas encore fait — carte CTA */
            <div style={{ padding:'20px 22px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:15, color:'var(--text-h1)', marginBottom:4 }}>
                  🎯 {lang === 'fr' ? "As-tu défini ton projet d'avenir ?" : 'Have you defined your future project?'}
                </p>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
                  {lang === 'fr' ? "Découvre les programmes qui correspondent à ton profil et les opportunités dans ton pays d'origine." : 'Discover the programs that match your profile and opportunities in your home country.'}
                </p>
              </div>
              <a href="/mon-avenir" style={{ padding:'10px 22px', background:'#0E1116', border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
                {lang === 'fr' ? 'Découvrir mon orientation →' : 'Discover my path →'}
              </a>
            </div>
          )
        )}

        {/* ── RECOMMANDATIONS IA ── */}
        {user && profile && (
          <>
            {/* Profil assez complet mais pas encore de reco → bouton générer */}
            {!profile.ai_recommendations && completion >= 60 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', padding:'18px 22px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:20 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:'var(--text-h1)', marginBottom:4 }}>
                    ✨ {lang === 'fr' ? 'Recommandations personnalisées' : 'Personalized Recommendations'}
                  </p>
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                    {lang === 'fr' ? 'Génère des conseils, livres et ressources adaptés à ton profil.' : 'Generate advice, books and resources tailored to your profile.'}
                  </p>
                </div>
                <button onClick={genererRecommandations} disabled={genLoading}
                  style={{ padding:'10px 20px', background: genLoading ? '#EBEBE9' : '#0E1116', border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:13, cursor: genLoading ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', opacity: genLoading ? 0.7 : 1, flexShrink:0 }}>
                  {genLoading ? '...' : (lang === 'fr' ? '✨ Générer' : '✨ Generate')}
                </button>
              </div>
            )}

            {/* Recommandations disponibles → affichage des 4 blocs */}
            {profile.ai_recommendations && (() => {
              const rec = profile.ai_recommendations
              return (
                <div style={{ marginBottom:24 }}>

                  {/* BLOC 1 — Message de bienvenue */}
                  {rec.welcome_message && (
                    <div style={{ padding:'20px 24px', background:'#0E1116', borderRadius:14, marginBottom:16 }}>
                      <p style={{ color:'#fff', fontSize:15, lineHeight:1.75, fontStyle:'italic', margin:0 }}>{rec.welcome_message}</p>
                    </div>
                  )}

                  {/* BLOC 2 — Livres recommandés */}
                  {rec.books?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--text-h1)', marginBottom:12 }}>
                        📚 {lang === 'fr' ? 'Livres recommandés pour toi' : 'Books recommended for you'}
                      </p>
                      <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:6 }}>
                        {rec.books.map((b, i) => (
                          <div key={i} style={{ minWidth:200, maxWidth:220, flexShrink:0, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 14px' }}>
                            <span style={{ fontSize:26, display:'block', marginBottom:10 }}>{b.emoji}</span>
                            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-h1)', marginBottom:3, lineHeight:1.4 }}>{b.title}</p>
                            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>{b.author}</p>
                            <p style={{ fontSize:12, color:'var(--text-body)', lineHeight:1.5 }}>{b.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BLOC 3 — Conseils personnalisés */}
                  {rec.tips?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--text-h1)', marginBottom:12 }}>
                        💡 {lang === 'fr' ? 'Conseils pour toi' : 'Tips for you'}
                      </p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                        {rec.tips.map((tip, i) => {
                          const bs =
                            tip.category === 'finance'    ? { bg:'#F0F0EE', color:'var(--text-h1)'   } :
                            tip.category === 'social'     ? { bg:'#F0F0EE', color:'var(--text-body)'   } :
                            tip.category === 'academique' ? { bg:'#F0F0EE', color:'var(--text-body)'   } :
                            tip.category === 'sante'      ? { bg:'#F7F7F5', color:'#DC2626'     } :
                            { bg:'#F7F7F5', color:'var(--text-muted)' }
                          return (
                            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 16px', background:bs.bg, borderRadius:99 }}>
                              <span style={{ fontSize:15, flexShrink:0, lineHeight:1.5 }}>{tip.emoji}</span>
                              <span style={{ fontSize:13, color:bs.color, lineHeight:1.5 }}>{tip.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bouton régénérer */}
                  <button onClick={genererRecommandations} disabled={genLoading}
                    style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', fontSize:12, cursor: genLoading ? 'not-allowed' : 'pointer', marginTop:4 }}>
                    {genLoading ? '...' : (lang === 'fr' ? '↻ Régénérer' : '↻ Regenerate')}
                  </button>

                </div>
              )
            })()}
          </>
        )}

        {/* ── STATS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:28 }}>
          {[
            { val:`${prog}%`, label: t.dash_progress,                       bar:prog },
            { val:faites.length,                    label: t.dash_done      },
            { val:taches.length - faites.length,    label: t.dash_remaining },
            { val:jouDisplayVal,                    label: jouDisplayLabel  },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'14px 16px' }}>
              <p style={{ fontSize:28, fontWeight:700, color:'var(--text-h1)', marginBottom:3, lineHeight:1 }}>{s.val}</p>
              <p style={{ fontSize:10, fontWeight:500, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
              {s.bar != null && <div style={{ height:3, background:'var(--border)', borderRadius:3, marginTop:8, overflow:'hidden' }}><div style={{ width:`${s.bar}%`, height:'100%', background:'#0E1116', borderRadius:3, transition:'width 0.5s' }} /></div>}
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:4, marginBottom:22, background:'var(--bg-subtle)', borderRadius:8, padding:4 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex:1, padding:'8px 16px', borderRadius:6, border:'none', fontSize:13, fontWeight: tab === tb.id ? 600 : 500, cursor:'pointer', transition:'all 0.15s', background: tab === tb.id ? '#0E1116' : 'transparent', color: tab === tb.id ? '#FFFFFF' : '#6B6F76' }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── CHECKLIST ── */}
        {tab === 'checklist' && (
          <div ref={checklistRef}>
            {province && (
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
                📍 {lang === 'fr' ? `Tâches adaptées pour ${profile?.ville_accueil} (${province === 'QC' ? 'Québec' : 'Ontario'})` : `Tasks adapted for ${profile?.ville_accueil} (${province === 'QC' ? 'Quebec' : 'Ontario'})`}
              </p>
            )}
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {['tous','a_faire','faites'].map(f => (
                <button key={f} onClick={() => setFiltre(f)} style={{ padding:'5px 12px', borderRadius:999, border: filtre === f ? 'none' : '1px solid #EBEBE9', background: filtre === f ? '#F0F0EE' : 'transparent', color: filtre === f ? '#0E1116' : '#9A9D9F', fontSize:12, fontWeight: filtre === f ? 600 : 500, cursor:'pointer' }}>
                  {f === 'tous' ? `${t.checklist_all} (${taches.length})` : f === 'a_faire' ? `${t.checklist_todo} (${taches.length - faites.length})` : `${t.checklist_done} (${faites.length})`}
                </button>
              ))}
            </div>
            {!ready ? (
              <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px', fontSize:14 }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {tF.length === 0 && taches.length === 0 && !province ? (
                  <div style={{ textAlign:'center', padding:'32px 24px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}>
                    <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:12 }}>
                      {lang === 'fr' ? 'Renseigne ta ville dans ton profil pour voir les tâches adaptées.' : 'Add your city in your profile to see adapted tasks.'}
                    </p>
                    <a href="/profile_1" style={{ padding:'8px 18px', background:'#0E1116', border:'none', borderRadius:6, color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>
                      {lang === 'fr' ? 'Compléter mon profil →' : 'Complete profile →'}
                    </a>
                  </div>
                ) : tF.length === 0 ? (
                  <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px', fontSize:14 }}>{lang === 'fr' ? 'Aucune tâche dans cette catégorie.' : 'No tasks in this category.'}</p>
                ) : (
                  tF.map(tache => {
                    const done  = faites.includes(tache.id)
                    const cat   = CAT_STYLE[tache.cat] || CAT_STYLE.admin
                    const titre = lang === 'fr' ? tache.titre : (tache.titre_en || tache.titre)
                    return (
                      <div key={tache.id} onClick={() => toggleTache(tache.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', opacity: done ? 0.5 : 1, transition:'opacity 0.15s', marginBottom:8 }}>
                        {/* Icône SVG neutre dans cercle léger */}
                        <div style={{ width:36, height:36, background:'var(--bg-subtle)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                          </svg>
                        </div>
                        {/* Checkbox */}
                        <div style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${done ? '#0E1116' : '#D5D5D2'}`, background: done ? '#0E1116' : '#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                          {done && <span style={{ color:'#FFFFFF', fontSize:10, fontWeight:800 }}>✓</span>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:14, fontWeight:600, color:'var(--text-h1)', marginBottom:5, textDecoration: done ? 'line-through' : 'none' }}>{titre}</p>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            <span style={{ fontSize:11, fontWeight:500, padding:'3px 9px', borderRadius:999, background:'var(--bg-subtle)', color:'var(--text-muted)' }}>{lang === 'fr' ? cat.label : cat.labelEn}</span>
                            {tache.prio === 'critique' && <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:999, background:'var(--bg-subtle)', color:'var(--text-body)' }}>{lang === 'fr' ? 'Critique' : 'Critical'}</span>}
                          </div>
                        </div>
                        {tache.lien && !done && (
                          <a href={tache.lien} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding:'5px 8px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-faint)', fontSize:13, flexShrink:0 }}>↗</a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MENTORS ── */}
        {tab === 'mentors' && (
          <>
            <p style={{ fontSize:18, fontWeight:700, color:'var(--text-h1)', marginBottom:6 }}>{t.mentor_title}</p>
            <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:20, lineHeight:1.6 }}>
              {lang === 'fr' ? "30 ou 45 minutes avec quelqu'un qui a vécu ce que tu vis." : '30 or 45 minutes with someone who lived what you\'re living.'}
            </p>
            {mentors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 24px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16 }}>
                <p style={{ fontSize:36, marginBottom:14 }}>🤝</p>
                <p style={{ fontWeight:600, fontSize:16, color:'var(--text-h1)', marginBottom:8 }}>{t.mentor_empty}</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, marginBottom:22 }}>{lang === 'fr' ? 'Les mentors sont vérifiés avant activation.' : 'Mentors are verified before activation.'}</p>
                <a href="/auth/register-mentor" style={{ padding:'10px 22px', background:'#0E1116', border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>{t.mentor_become} →</a>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {mentors.map(m => {
                  const tarif  = ((m.tarif_30min || 1499) / 100).toFixed(2)
                  const sujets = Array.isArray(m.sujets) ? m.sujets : []
                  return (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                      <div style={{ width:46, height:46, borderRadius:'50%', background:'#0E111618', border:'1.5px solid #0E111635', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:17, color:'var(--text-body)', flexShrink:0 }}>
                        {(m.full_name||'?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:15, color:'var(--text-h1)', marginBottom:2 }}>{m.full_name}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:7 }}>{m.pays_origine} → {m.ville_accueil}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {sujets.map(s => <span key={s} style={{ fontSize:11, padding:'2px 9px', background:'#0E111610', color:'var(--text-body)', borderRadius:20, border:'1px solid #0E111620' }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:20, fontWeight:700, color:'var(--text-body)' }}>{tarif} $</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>CAD · 30 min</p>
                        {m.note_moyenne > 0 && <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>★ {Number(m.note_moyenne).toFixed(1)}</p>}
                        <button onClick={() => { setMOpen(m); setDuree(30) }} style={{ padding:'8px 16px', background:'#0E1116', border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>{t.mentor_book}</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── GUIDES ── */}
        {tab === 'guides' && (
          <>
            <p style={{ fontSize:18, fontWeight:700, color:'var(--text-h1)', marginBottom:6 }}>{t.ebook_title}</p>
            <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:20 }}>{lang === 'fr' ? 'Télécharge et lis gratuitement.' : 'Download and read for free.'}</p>
            {guides.length === 0 ? (
              <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'32px' }}>{lang === 'fr' ? 'Aucun guide disponible.' : 'No guides available.'}</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
                {guides.map(g => (
                  <div key={g.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:g.gratuit ? '#3A3D4018' : '#0E111618', color:g.gratuit ? '#3A3D40' : '#3A3D40', letterSpacing:0.5 }}>
                        {g.gratuit ? (lang === 'fr' ? 'GRATUIT' : 'FREE') : `${(3.99).toFixed(2)} $`}
                      </span>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>⏱ {g.temps_lecture} min</span>
                    </div>
                    <p style={{ fontWeight:600, fontSize:15, color:'var(--text-h1)', marginBottom:8, lineHeight:1.4 }}>{lang === 'fr' ? g.titre : (g.titre_en || g.titre)}</p>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>{g.resume}</p>
                    <button onClick={() => {
                      const contenu = lang === 'fr' ? g.contenu : (g.contenu_en || g.contenu)
                      const blob = new Blob([contenu], { type:'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `novae-${g.slug}.txt`; a.click()
                      URL.revokeObjectURL(url)
                    }} style={{ width:'100%', padding:'10px', background:'#0E111615', border:'1px solid #0E111630', borderRadius:9, color:'var(--text-body)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                      {t.ebook_read} →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TODO ── */}
        {tab === 'todo' && (
          <>
            <p style={{ fontSize:18, fontWeight:700, color:'var(--text-h1)', marginBottom:20 }}>{t.todo_title}</p>
            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              <input value={todoInput} onChange={e => setTodoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder={t.todo_placeholder}
                style={{ flex:1, padding:'11px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-h1)', fontSize:14, outline:'none', colorScheme:'dark' }} />
              <button onClick={addTodo} disabled={!todoInput.trim()} style={{ padding:'11px 18px', background: todoInput.trim() ? '#0E1116' : '#EBEBE9', border:'none', borderRadius:10, color: todoInput.trim() ? '#fff' : '#6B6F76', fontWeight:600, fontSize:14, cursor: todoInput.trim() ? 'pointer' : 'not-allowed' }}>
                {t.todo_add}
              </button>
            </div>
            {todos.length === 0 ? (
              <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px', fontSize:14 }}>{t.todo_empty}</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {todos.map(todo => (
                  <div key={todo.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, opacity: todo.complete ? 0.5 : 1 }}>
                    <button onClick={() => toggleTodo(todo.id)} style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${todo.complete ? '#3A3D40' : '#EBEBE9'}`, background: todo.complete ? '#3A3D40' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      {todo.complete && <span style={{ color:'#FAFAF9', fontSize:11, fontWeight:800 }}>✓</span>}
                    </button>
                    <p style={{ flex:1, fontSize:14, color:'var(--text-h1)', textDecoration: todo.complete ? 'line-through' : 'none' }}>{todo.titre}</p>
                    <button onClick={() => deleteTodo(todo.id)} style={{ padding:'4px 9px', background:'#DC262612', border:'1px solid #DC262625', borderRadius:7, color:'#DC2626', fontSize:12, cursor:'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── RESSOURCES UTILES (bas de page) ── */}
        {user && profile?.ai_recommendations?.resources?.length > 0 && (
          <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 14 }}>
              🔗 {lang === 'fr' ? 'Ressources utiles' : 'Useful Resources'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.ai_recommendations.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{r.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', marginBottom: 2 }}>{r.name} ↗</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

          <FeedbackSection page="dashboard" />
        </div>{/* fin colonne principale */}

        {/* ── PANNEAU DROIT ── */}
        <aside style={{ position: 'sticky', top: 24 }} className="dashboard-aside">

          {/* Vue d'ensemble */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h1)', margin: 0 }}>
                {lang === 'fr' ? "Vue d'ensemble" : 'Overview'}
              </h3>
              <span style={{ fontSize: 18, color: 'var(--text-faint)' }}>↗</span>
            </div>
            {[
              { label: lang === 'fr' ? 'Points complétés'  : 'Points completed',  value: `${scoreTotal} / 100` },
              { label: lang === 'fr' ? 'Tâches en cours'   : 'Tasks in progress', value: taches.length - faites.length },
              { label: lang === 'fr' ? 'Documents'         : 'Documents',         value: scoreDoc !== null ? scoreDoc : '—' },
              { label: lang === 'fr' ? "Dernière activité" : 'Last activity',     value: lang === 'fr' ? "Aujourd'hui" : 'Today' },
            ].map((stat, i, arr) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #FAFAF9' : 'none',
              }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h1)' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Conseil du jour */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h1)' }}>
                {lang === 'fr' ? 'Conseil du jour' : "Today's tip"}
              </p>
            </div>
            <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {lang === 'fr'
                ? "Assure-toi que toutes tes informations sont à jour. Un dossier complet augmente considérablement tes chances de succès."
                : "Make sure all your information is up to date. A complete file greatly increases your chances of success."}
            </p>
          </div>

          {/* Besoin d'aide */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🎧</span>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h1)' }}>
                {lang === 'fr' ? "Besoin d'aide ?" : 'Need help?'}
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              {lang === 'fr'
                ? "Consulte notre centre d'aide ou contacte un conseiller spécialisé."
                : "Check our help center or contact a specialized advisor."}
            </p>
            <a href="/arrivee" style={{ display: 'block', padding: '9px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-body)', fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              {lang === 'fr' ? "Obtenir de l'aide" : 'Get help'}
            </a>
          </div>

        </aside>

      </div>{/* fin flex layout */}

      <style jsx global>{`
        @media (max-width: 900px) {
          .dashboard-aside { display: none !important; }
        }
      `}</style>
    </div>
  )
}
