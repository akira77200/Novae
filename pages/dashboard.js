// pages/dashboard.js — NOVAE v5 — Profil vivant
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', background: `${C.accent}07`, border: `1px solid ${C.accent}20`, borderRadius: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🌱</span>
        <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
          {lang === 'fr' ? 'Check-in bien-être — 1 minute' : 'Wellbeing check-in — 1 minute'}
        </p>
      </div>
      <a href="/bienetre" style={{ padding: '6px 14px', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        {lang === 'fr' ? 'Commencer →' : 'Start →'}
      </a>
    </div>
  )

  const numSem = Math.ceil((new Date(checkin.semaine) - new Date(new Date().getFullYear(), 0, 1)) / 604800000)
  const scoreColor = checkin.score <= 2 ? '#F87171' : checkin.score === 3 ? '#FBBF24' : '#34D399'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: scoreColor + '08', border: `1px solid ${scoreColor}25`, borderRadius: 12, marginBottom: 16 }}>
      <span style={{ fontSize: 22 }}>{SCORE_EMOJIS_DB[checkin.score - 1]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(checkin.score / 5) * 100}%`, height: '100%', background: scoreColor, borderRadius: 3 }} />
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
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
        alertes.push({ type: jRAMQ <= 14 ? 'urgent' : 'warning', titre: lang === 'fr' ? `RAMQ — ${jRAMQ} jour${jRAMQ > 1 ? 's' : ''} restant${jRAMQ > 1 ? 's' : ''}` : `RAMQ — ${jRAMQ} day${jRAMQ > 1 ? 's' : ''} left`, message: lang === 'fr' ? "Inscris-toi maintenant. Passeport + permis + preuve d'adresse." : 'Register now. Passport + permit + proof of address.', lien: 'https://www.ramq.gouv.qc.ca' })
    }

    const annee = now.getFullYear()
    const ecImp = new Date(`${annee}-04-30`)
    const jImp = Math.ceil((ecImp - now) / 86400000)
    if (jImp > 0 && jImp <= 75)
      alertes.push({ type: 'info', titre: lang === 'fr' ? `Impôts — ${jImp} jours avant le 30 avril` : `Taxes — ${jImp} days before April 30`, message: lang === 'fr' ? 'Tu as droit à des crédits. Ne rate pas ça.' : "You have tax credits available. Don't miss them.", lien: 'https://www.canada.ca/fr/agence-revenu.html' })
  }
  return alertes
}

// ── Tâches adaptées selon province ───────────────────────────────
const TACHES_CANADA = [
  { id:1,  titre:"Obtenir ton NAS (Numéro d'Assurance Sociale)",   titre_en:"Get your SIN (Social Insurance Number)",      cat:'admin',   prio:'critique', lien:'https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html', icone:'🪪', provinces:null },
  { id:2,  titre:"Ouvrir un compte bancaire étudiant",             titre_en:"Open a student bank account",                 cat:'banque',  prio:'critique', lien:null, icone:'🏦', provinces:null },
  { id:3,  titre:"S'inscrire à la RAMQ (Québec uniquement)",       titre_en:"Register for RAMQ (Quebec only)",             cat:'sante',   prio:'critique', lien:'https://www.ramq.gouv.qc.ca', icone:'🏥', provinces:['QC'] },
  { id:4,  titre:"S'inscrire à OHIP (Ontario uniquement)",         titre_en:"Register for OHIP (Ontario only)",            cat:'sante',   prio:'critique', lien:'https://www.ontario.ca/fr/page/ohip', icone:'🏥', provinces:['ON'] },
  { id:5,  titre:"Demander une carte de crédit sécurisée",         titre_en:"Apply for a secured credit card",             cat:'banque',  prio:'haute',    lien:null, icone:'💳', provinces:null },
  { id:6,  titre:"Activer le permis de travail hors campus",       titre_en:"Activate off-campus work permit",             cat:'admin',   prio:'haute',    lien:'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-travail/hors-campus.html', icone:'📋', provinces:null },
  { id:7,  titre:"S'inscrire à l'assurance maladie universitaire", titre_en:"Register for university health insurance",     cat:'sante',   prio:'haute',    lien:null, icone:'🩺', provinces:null },
  { id:8,  titre:"Explorer les quartiers et le transport",         titre_en:"Explore neighborhoods and transit",           cat:'logement',prio:'normale',  lien:null, icone:'🗺️', provinces:null },
  { id:9,  titre:"Rejoindre un groupe de compatriotes",            titre_en:"Join a community group",                      cat:'social',  prio:'normale',  lien:null, icone:'🤝', provinces:null },
  { id:10, titre:"Comprendre ton programme universitaire",         titre_en:"Understand your university program",          cat:'univ',    prio:'haute',    lien:null, icone:'🎓', provinces:null },
]

const CAT_STYLE = {
  admin:    { label:'Admin',      labelEn:'Admin',     color:'#52B788', bg:'rgba(82,183,136,0.12)'  },
  banque:   { label:'Banque',     labelEn:'Banking',   color:'#F59E0B', bg:'rgba(245,158,11,0.12)'  },
  sante:    { label:'Santé',      labelEn:'Health',    color:'#60A5FA', bg:'rgba(96,165,250,0.12)'  },
  logement: { label:'Logement',   labelEn:'Housing',   color:'#B5838D', bg:'rgba(181,131,141,0.12)' },
  social:   { label:'Social',     labelEn:'Social',    color:'#A78BFA', bg:'rgba(167,139,250,0.12)' },
  univ:     { label:'Université', labelEn:'University',color:'#FBBF24', bg:'rgba(251,191,36,0.12)'  },
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
  const { C, t, lang, user, profile, loading: authLoading, sb, refreshProfile } = useApp()

  const hasFetched = useRef(false)

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
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const payload = { profile: { ...profile, id: user.id } }
      const res = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
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
      const { data: { session } } = await sb.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/documents', { headers: { Authorization: `Bearer ${session.access_token}` } })
      const json = await res.json()
      setScoreDoc((json.data || []).length)
    } catch {}
  }

  const loadAll = async () => {
    try {
      if (user) {
        const { data: faitesData } = await sb.from('taches_utilisateur').select('tache_id').eq('utilisateur_id', user.id).eq('complete', true)
        setFaites((faitesData || []).map(f => f.tache_id))

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
    if (user) await sb.from('taches_utilisateur').upsert({ utilisateur_id: user.id, tache_id: id, complete: !estFaite, complete_at: !estFaite ? new Date().toISOString() : null }, { onConflict: 'utilisateur_id,tache_id' })
    else localStorage.setItem('novae_faites', JSON.stringify(next))
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
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, borderRadius:10, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', margin:'0 auto 14px' }}>N</div>
        <p style={{ color:C.muted, fontSize:14 }}>{t.loading}</p>
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

  // ── Score préparation dossier ─────────────────────────────────
  const calcScore = () => {
    if (!user) return null
    const pts = []
    // 1. Profil (30 pts)
    pts.push({ label: lang === 'fr' ? 'Profil complété'  : 'Profile',    labelEn: 'Profile',    pts: Math.round((completion / 100) * 30), max: 30, color: '#52B788', href: '/profile_1' })
    // 2. Checklist (25 pts)
    const pctCheck = taches.length > 0 ? faites.length / taches.length : 0
    pts.push({ label: lang === 'fr' ? 'Tâches checklist' : 'Checklist',  labelEn: 'Checklist',  pts: Math.round(pctCheck * 25),          max: 25, color: '#60A5FA', href: null })
    // 3. Documents (20 pts)
    const ptsDoc = scoreDoc === null ? null : Math.min(Math.round((scoreDoc / 5) * 20), 20)
    pts.push({ label: lang === 'fr' ? 'Documents ajoutés': 'Documents',  labelEn: 'Documents',  pts: ptsDoc ?? 0, max: 20, color: '#FBBF24', href: '/documents', loading: scoreDoc === null })
    // 4. CV créé (15 pts)
    const hasCv = typeof window !== 'undefined' && !!localStorage.getItem('novae_cv_nom')
    pts.push({ label: lang === 'fr' ? 'CV créé'           : 'Resume',    labelEn: 'Resume',     pts: hasCv ? 15 : 0,                       max: 15, color: '#F97316', href: '/cv' })
    // 5. Mon Avenir (10 pts)
    pts.push({ label: lang === 'fr' ? 'Projet d\'avenir'  : 'Future plan',labelEn:'Future plan', pts: monAvenirResult ? 10 : 0,             max: 10, color: '#A78BFA', href: '/mon-avenir' })
    return pts
  }
  const scoreItems = calcScore()
  const scoreTotal = scoreItems ? scoreItems.reduce((s, i) => s + i.pts, 0) : 0
  const scoreColor = scoreTotal >= 80 ? '#34D399' : scoreTotal >= 50 ? '#FBBF24' : '#F87171'
  const scoreBadge = scoreTotal >= 80
    ? (lang === 'fr' ? 'Excellent' : 'Excellent')
    : scoreTotal >= 50
    ? (lang === 'fr' ? 'En bonne voie' : 'On track')
    : (lang === 'fr' ? 'À compléter' : 'Needs work')

  const jouDisplayVal   = jours === null ? 'J+0' : jours < 0 ? `J-${Math.abs(jours)}` : `J+${jours}`
  const jouDisplayColor = jours !== null && jours < 0 ? C.warning : C.rose
  const jouDisplayLabel = jours !== null && jours < 0 ? (lang === 'fr' ? 'Avant l\'arrivée' : 'Before arrival') : (lang === 'fr' ? 'Depuis l\'arrivée' : 'Since arrival')

  const prenom = profile?.full_name ? profile.full_name.split(' ')[0] : null

  const TABS = [
    { id:'checklist', label: t.nav_checklist },
    { id:'mentors',   label: t.nav_mentors   },
    { id:'guides',    label: t.ebook_title   },
    { id:'todo',      label: t.nav_todo      },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />

      {paying && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <p style={{ color:C.text, fontSize:16, fontWeight:600 }}>Redirection vers le paiement...</p>
        </div>
      )}

      {/* Modal mentor */}
      {mOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={() => setMOpen(null)}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, width:'100%', maxWidth:420, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'22px 24px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:`${C.accent}20`, border:`1.5px solid ${C.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, color:C.accent2 }}>{(mOpen.full_name||'?')[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:17, color:C.text }}>{mOpen.full_name}</p>
                  <p style={{ fontSize:13, color:C.muted, marginTop:2 }}>{mOpen.pays_origine} → {mOpen.ville_accueil}</p>
                  {mOpen.note_moyenne > 0 && <p style={{ fontSize:12, color:C.warning, marginTop:2 }}>★ {Number(mOpen.note_moyenne).toFixed(1)} · {mOpen.sessions_total} sessions</p>}
                </div>
              </div>
              <button onClick={() => setMOpen(null)} style={{ width:30, height:30, borderRadius:'50%', border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
            <div style={{ padding:'18px 24px' }}>
              {mOpen.bio && <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:18 }}>{mOpen.bio}</p>}
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>Durée</p>
              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                {[30,45].map(d => {
                  const tarif = ((d === 30 ? mOpen.tarif_30min : mOpen.tarif_45min) || (d === 30 ? 1499 : 1999)) / 100
                  return (
                    <button key={d} onClick={() => setDuree(d)} style={{ flex:1, padding:'13px', borderRadius:10, border:`1px solid ${duree === d ? C.accent+'60' : C.border}`, background: duree === d ? `${C.accent}15` : 'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:18, fontWeight:700, color: duree === d ? C.accent2 : C.text }}>{tarif.toFixed(2)} $</span>
                      <span style={{ fontSize:12, color:C.muted }}>{d} min · CAD</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => reserver(mOpen)} style={{ width:'100%', padding:'13px', background:C.accent, border:'none', borderRadius:10, color:'#fff', fontWeight:600, fontSize:15, cursor:'pointer' }}>🔒 {t.mentor_book}</button>
              <p style={{ textAlign:'center', fontSize:12, color:C.muted, marginTop:8 }}>{t.refund_policy}</p>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth:780, margin:'0 auto', padding:'32px 20px 80px' }}>

        {/* ── HEADER PERSONNALISÉ ── */}
        {profile && prenom ? (
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:-0.5, marginBottom:6 }}>
              {lang === 'fr' ? `Bienvenue, ${prenom} 👋` : `Welcome, ${prenom} 👋`}
            </h1>
            <p style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>
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
        ) : user ? (
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:8 }}>
              {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            </h1>
            <a href="/profile_1" style={{ fontSize:13, color:C.accent2, textDecoration:'none' }}>
              {lang === 'fr' ? '→ Complète ton profil pour personnaliser ton expérience' : '→ Complete your profile for a personalized experience'}
            </a>
          </div>
        ) : (
          <div style={{ padding:'12px 18px', background:`${C.accent}10`, border:`1px solid ${C.accent}30`, borderRadius:12, marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:13, color:C.accent2 }}>{lang === 'fr' ? 'Crée un compte pour sauvegarder ta progression.' : 'Create an account to save your progress.'}</p>
            <a href="/auth/register" style={{ padding:'7px 16px', background:C.accent, border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>{lang === 'fr' ? "S'inscrire gratuitement →" : 'Sign up for free →'}</a>
          </div>
        )}

        {/* ── BARRE DE COMPLÉTION DU PROFIL ── */}
        {user && completion < 80 && (
          <div style={{ padding:'14px 18px', background:`${C.warning}08`, border:`1px solid ${C.warning}25`, borderRadius:12, marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:C.warning, marginBottom:6 }}>
                {lang === 'fr' ? `Profil complété à ${completion}%` : `Profile ${completion}% complete`}
              </p>
              <div style={{ height:6, background:`${C.warning}20`, borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${completion}%`, height:'100%', background:C.warning, borderRadius:3, transition:'width 0.5s' }} />
              </div>
            </div>
            <a href="/profile_1" style={{ padding:'7px 14px', background:`${C.warning}15`, border:`1px solid ${C.warning}35`, borderRadius:8, color:C.warning, fontWeight:600, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
              {lang === 'fr' ? 'Compléter mon profil →' : 'Complete profile →'}
            </a>
          </div>
        )}

        {/* ── ALERTES INTELLIGENTES ── */}
        {alertes.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderRadius:11, border:'1px solid', marginBottom:10, borderColor: a.type === 'urgent' ? '#F87171' : a.type === 'warning' ? '#FBBF24' : C.accent+'50', background: a.type === 'urgent' ? 'rgba(248,113,113,0.07)' : a.type === 'warning' ? 'rgba(251,191,36,0.07)' : `${C.accent}08` }}>
            <span style={{ fontSize:16 }}>{a.type === 'urgent' ? '🔴' : a.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600, fontSize:13, color:C.text, marginBottom:2 }}>{a.titre}</p>
              <p style={{ fontSize:12, color:C.muted }}>{a.message}</p>
            </div>
            {a.lien && <a href={a.lien} target="_blank" rel="noreferrer" style={{ padding:'6px 12px', background:`${C.accent}18`, border:`1px solid ${C.accent}35`, borderRadius:7, color:C.accent2, fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>Agir →</a>}
          </div>
        ))}

        {/* ── SCORE PRÉPARATION DOSSIER ── */}
        {user && scoreItems && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 18 }}>
            {/* Header score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                  📋 {lang === 'fr' ? 'Score de préparation' : 'Readiness Score'}
                </p>
                <p style={{ fontSize: 12, color: C.muted }}>{lang === 'fr' ? 'Ton dossier d\'immigration en un coup d\'œil' : 'Your immigration file at a glance'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: scoreColor, letterSpacing: -1, lineHeight: 1 }}>{scoreTotal}<span style={{ fontSize: 16, fontWeight: 500, color: C.muted }}>/100</span></p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: scoreColor + '18', color: scoreColor }}>{scoreBadge}</span>
              </div>
            </div>

            {/* Barre globale */}
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${scoreTotal}%`, height: '100%', background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`, borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>

            {/* Lignes détail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scoreItems.map((item, i) => {
                const pct = Math.round((item.pts / item.max) * 100)
                const done = item.pts === item.max
                const content = (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: C.surface2, border: `1px solid ${done ? item.color + '30' : C.border}`, cursor: item.href ? 'pointer' : 'default', transition: 'border-color 0.15s' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? item.color : C.border, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: done ? C.text : C.muted, flex: 1, fontWeight: done ? 500 : 400 }}>{item.label}</p>
                    {item.loading
                      ? <span style={{ fontSize: 11, color: C.muted }}>…</span>
                      : <span style={{ fontSize: 13, fontWeight: 700, color: done ? item.color : C.muted }}>{item.pts}/{item.max}</span>
                    }
                    {!done && item.href && <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>+{item.max - item.pts} →</span>}
                    {done && <span style={{ fontSize: 14 }}>✅</span>}
                  </div>
                )
                return item.href && !done
                  ? <a key={i} href={item.href} style={{ textDecoration: 'none' }}>{content}</a>
                  : <div key={i}>{content}</div>
              })}
            </div>

            {scoreTotal < 100 && (
              <p style={{ fontSize: 12, color: C.muted, marginTop: 12, textAlign: 'center' }}>
                {lang === 'fr' ? '👆 Clique sur une ligne pour compléter ce point.' : '👆 Click a line to complete that item.'}
              </p>
            )}
          </div>
        )}

        {/* ── WIDGET BIEN-ÊTRE ── */}
        {user && <BienetreWidget C={C} lang={lang} sb={sb} />}

        {/* ── CARTE MON AVENIR ── */}
        {user && (
          monAvenirResult ? (
            /* Quiz déjà complété — carte compacte */
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 18px', background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:12, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{monAvenirResult.top?.[0]?.emoji || '📊'}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text }}>
                    {lang === 'fr' ? 'Ton orientation' : 'Your path'} : {monAvenirResult.top?.[0]?.nom?.[lang] || '—'}
                  </p>
                  <p style={{ fontSize:12, color:C.muted }}>
                    {lang === 'fr' ? 'Compatibilité' : 'Match'} {monAvenirResult.top?.[0]?.pct || 0}%
                  </p>
                </div>
              </div>
              <a href="/mon-avenir" style={{ padding:'7px 16px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:8, color:C.accent2, fontWeight:600, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
                {lang === 'fr' ? 'Explorer ma vision →' : 'Explore my vision →'}
              </a>
            </div>
          ) : (
            /* Quiz pas encore fait — carte CTA */
            <div style={{ padding:'20px 22px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>
                  🎯 {lang === 'fr' ? "As-tu défini ton projet d'avenir ?" : 'Have you defined your future project?'}
                </p>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                  {lang === 'fr' ? "Découvre les programmes qui correspondent à ton profil et les opportunités dans ton pays d'origine." : 'Discover the programs that match your profile and opportunities in your home country.'}
                </p>
              </div>
              <a href="/mon-avenir" style={{ padding:'10px 22px', background:C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
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
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', padding:'18px 22px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:20 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>
                    ✨ {lang === 'fr' ? 'Recommandations personnalisées' : 'Personalized Recommendations'}
                  </p>
                  <p style={{ fontSize:13, color:C.muted }}>
                    {lang === 'fr' ? 'Génère des conseils, livres et ressources adaptés à ton profil.' : 'Generate advice, books and resources tailored to your profile.'}
                  </p>
                </div>
                <button onClick={genererRecommandations} disabled={genLoading}
                  style={{ padding:'10px 20px', background: genLoading ? C.border : C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:13, cursor: genLoading ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', opacity: genLoading ? 0.7 : 1, flexShrink:0 }}>
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
                    <div style={{ padding:'20px 24px', background:'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)', borderRadius:14, marginBottom:16 }}>
                      <p style={{ color:'#fff', fontSize:15, lineHeight:1.75, fontStyle:'italic', margin:0 }}>{rec.welcome_message}</p>
                    </div>
                  )}

                  {/* BLOC 2 — Livres recommandés */}
                  {rec.books?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>
                        📚 {lang === 'fr' ? 'Livres recommandés pour toi' : 'Books recommended for you'}
                      </p>
                      <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:6 }}>
                        {rec.books.map((b, i) => (
                          <div key={i} style={{ minWidth:200, maxWidth:220, flexShrink:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 14px' }}>
                            <span style={{ fontSize:26, display:'block', marginBottom:10 }}>{b.emoji}</span>
                            <p style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3, lineHeight:1.4 }}>{b.title}</p>
                            <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{b.author}</p>
                            <p style={{ fontSize:12, color:C.accent2, lineHeight:1.5 }}>{b.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BLOC 3 — Conseils personnalisés */}
                  {rec.tips?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>
                        💡 {lang === 'fr' ? 'Conseils pour toi' : 'Tips for you'}
                      </p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                        {rec.tips.map((tip, i) => {
                          const bs =
                            tip.category === 'finance'    ? { bg:`rgba(45,106,79,0.18)`,   color:C.accent2   } :
                            tip.category === 'social'     ? { bg:`rgba(96,165,250,0.18)`,  color:'#60A5FA'   } :
                            tip.category === 'academique' ? { bg:`rgba(251,191,36,0.18)`,  color:C.warning   } :
                            tip.category === 'sante'      ? { bg:`rgba(248,113,113,0.18)`, color:C.error     } :
                            { bg:C.surface2, color:C.muted }
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

                  {/* BLOC 4 — Ressources utiles */}
                  {rec.resources?.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>
                        🔗 {lang === 'fr' ? 'Ressources utiles' : 'Useful Resources'}
                      </p>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {rec.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noreferrer"
                            style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, textDecoration:'none' }}>
                            <span style={{ fontSize:18, flexShrink:0 }}>{r.emoji}</span>
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:C.accent2, marginBottom:2 }}>{r.name} ↗</p>
                              <p style={{ fontSize:12, color:C.muted }}>{r.description}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bouton régénérer */}
                  <button onClick={genererRecommandations} disabled={genLoading}
                    style={{ padding:'6px 14px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor: genLoading ? 'not-allowed' : 'pointer', marginTop:4 }}>
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
            { val:`${prog}%`,       label: t.dash_progress,  color:C.accent2, bar:prog },
            { val:faites.length,    label: t.dash_done,      color:C.success },
            { val:taches.length - faites.length, label: t.dash_remaining, color:C.warning },
            { val:jouDisplayVal,    label: jouDisplayLabel,  color:jouDisplayColor },
          ].map((s, i) => (
            <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
              <p style={{ fontSize:24, fontWeight:700, color:s.color, marginBottom:3 }}>{s.val}</p>
              <p style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, fontWeight:500 }}>{s.label}</p>
              {s.bar != null && <div style={{ height:3, background:C.border, borderRadius:3, marginTop:8, overflow:'hidden' }}><div style={{ width:`${s.bar}%`, height:'100%', background:C.accent2, borderRadius:3, transition:'width 0.5s' }} /></div>}
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:4, marginBottom:22, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:4 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'none', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s', background: tab === tb.id ? C.accent : 'transparent', color: tab === tb.id ? '#fff' : C.muted }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── CHECKLIST ── */}
        {tab === 'checklist' && (
          <>
            {province && (
              <p style={{ fontSize:12, color:C.muted, marginBottom:14 }}>
                📍 {lang === 'fr' ? `Tâches adaptées pour ${profile?.ville_accueil} (${province === 'QC' ? 'Québec' : 'Ontario'})` : `Tasks adapted for ${profile?.ville_accueil} (${province === 'QC' ? 'Quebec' : 'Ontario'})`}
              </p>
            )}
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {['tous','a_faire','faites'].map(f => (
                <button key={f} onClick={() => setFiltre(f)} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${filtre === f ? C.accent+'50' : C.border}`, background: filtre === f ? `${C.accent}15` : 'transparent', color: filtre === f ? C.accent2 : C.muted, fontSize:12, fontWeight:500, cursor:'pointer' }}>
                  {f === 'tous' ? `${t.checklist_all} (${taches.length})` : f === 'a_faire' ? `${t.checklist_todo} (${taches.length - faites.length})` : `${t.checklist_done} (${faites.length})`}
                </button>
              ))}
            </div>
            {!ready ? (
              <p style={{ textAlign:'center', color:C.muted, padding:'32px', fontSize:14 }}>Chargement...</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {tF.length === 0 && taches.length === 0 && !province ? (
                  <div style={{ textAlign:'center', padding:'32px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14 }}>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:12 }}>
                      {lang === 'fr' ? 'Renseigne ta ville dans ton profil pour voir les tâches adaptées.' : 'Add your city in your profile to see adapted tasks.'}
                    </p>
                    <a href="/profile_1" style={{ padding:'8px 18px', background:C.accent, border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>
                      {lang === 'fr' ? 'Compléter mon profil →' : 'Complete profile →'}
                    </a>
                  </div>
                ) : tF.length === 0 ? (
                  <p style={{ textAlign:'center', color:C.muted, padding:'32px', fontSize:14 }}>{lang === 'fr' ? 'Aucune tâche dans cette catégorie.' : 'No tasks in this category.'}</p>
                ) : (
                  tF.map(tache => {
                    const done  = faites.includes(tache.id)
                    const cat   = CAT_STYLE[tache.cat] || CAT_STYLE.admin
                    const titre = lang === 'fr' ? tache.titre : (tache.titre_en || tache.titre)
                    return (
                      <div key={tache.id} onClick={() => toggleTache(tache.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, cursor:'pointer', opacity: done ? 0.5 : 1, transition:'opacity 0.15s' }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{tache.icone}</span>
                        <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${done ? C.success : C.border}`, background: done ? C.success : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                          {done && <span style={{ color:C.bg, fontSize:11, fontWeight:800 }}>✓</span>}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:5, textDecoration: done ? 'line-through' : 'none' }}>{titre}</p>
                          <div style={{ display:'flex', gap:6 }}>
                            <span style={{ fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:20, background:cat.bg, color:cat.color }}>{lang === 'fr' ? cat.label : cat.labelEn}</span>
                            {tache.prio === 'critique' && <span style={{ fontSize:11, color:C.error, fontWeight:500 }}>· {lang === 'fr' ? 'Critique' : 'Critical'}</span>}
                          </div>
                        </div>
                        {tache.lien && !done && (
                          <a href={tache.lien} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding:'5px 10px', background:`${C.accent}12`, border:`1px solid ${C.accent}25`, borderRadius:7, color:C.accent2, fontSize:12 }}>↗</a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}

        {/* ── MENTORS ── */}
        {tab === 'mentors' && (
          <>
            <p style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:6 }}>{t.mentor_title}</p>
            <p style={{ fontSize:14, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
              {lang === 'fr' ? "30 ou 45 minutes avec quelqu'un qui a vécu ce que tu vis." : '30 or 45 minutes with someone who lived what you\'re living.'}
            </p>
            {mentors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16 }}>
                <p style={{ fontSize:36, marginBottom:14 }}>🤝</p>
                <p style={{ fontWeight:600, fontSize:16, color:C.text, marginBottom:8 }}>{t.mentor_empty}</p>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:22 }}>{lang === 'fr' ? 'Les mentors sont vérifiés avant activation.' : 'Mentors are verified before activation.'}</p>
                <a href="/auth/register-mentor" style={{ padding:'10px 22px', background:C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>{t.mentor_become} →</a>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {mentors.map(m => {
                  const tarif  = ((m.tarif_30min || 1499) / 100).toFixed(2)
                  const sujets = Array.isArray(m.sujets) ? m.sujets : []
                  return (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14 }}>
                      <div style={{ width:46, height:46, borderRadius:'50%', background:`${C.accent}18`, border:`1.5px solid ${C.accent}35`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:17, color:C.accent2, flexShrink:0 }}>
                        {(m.full_name||'?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:15, color:C.text, marginBottom:2 }}>{m.full_name}</p>
                        <p style={{ fontSize:12, color:C.muted, marginBottom:7 }}>{m.pays_origine} → {m.ville_accueil}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {sujets.map(s => <span key={s} style={{ fontSize:11, padding:'2px 9px', background:`${C.accent}10`, color:C.accent2, borderRadius:20, border:`1px solid ${C.accent}20` }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:20, fontWeight:700, color:C.accent2 }}>{tarif} $</p>
                        <p style={{ fontSize:11, color:C.muted, marginBottom:6 }}>CAD · 30 min</p>
                        {m.note_moyenne > 0 && <p style={{ fontSize:12, color:C.warning, marginBottom:8 }}>★ {Number(m.note_moyenne).toFixed(1)}</p>}
                        <button onClick={() => { setMOpen(m); setDuree(30) }} style={{ padding:'8px 16px', background:C.accent, border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>{t.mentor_book}</button>
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
            <p style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:6 }}>{t.ebook_title}</p>
            <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>{lang === 'fr' ? 'Télécharge et lis gratuitement.' : 'Download and read for free.'}</p>
            {guides.length === 0 ? (
              <p style={{ color:C.muted, textAlign:'center', padding:'32px' }}>{lang === 'fr' ? 'Aucun guide disponible.' : 'No guides available.'}</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
                {guides.map(g => (
                  <div key={g.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:g.gratuit ? `${C.success}18` : `${C.accent}18`, color:g.gratuit ? C.success : C.accent2, letterSpacing:0.5 }}>
                        {g.gratuit ? 'GRATUIT' : `${(3.99).toFixed(2)} $`}
                      </span>
                      <span style={{ fontSize:11, color:C.muted }}>⏱ {g.temps_lecture} min</span>
                    </div>
                    <p style={{ fontWeight:600, fontSize:15, color:C.text, marginBottom:8, lineHeight:1.4 }}>{lang === 'fr' ? g.titre : (g.titre_en || g.titre)}</p>
                    <p style={{ fontSize:13, color:C.muted, marginBottom:14, lineHeight:1.6 }}>{g.resume}</p>
                    <button onClick={() => {
                      const contenu = lang === 'fr' ? g.contenu : (g.contenu_en || g.contenu)
                      const blob = new Blob([contenu], { type:'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `novae-${g.slug}.txt`; a.click()
                      URL.revokeObjectURL(url)
                    }} style={{ width:'100%', padding:'10px', background:`${C.accent}15`, border:`1px solid ${C.accent}30`, borderRadius:9, color:C.accent2, fontWeight:600, fontSize:13, cursor:'pointer' }}>
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
            <p style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:20 }}>{t.todo_title}</p>
            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              <input value={todoInput} onChange={e => setTodoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder={t.todo_placeholder}
                style={{ flex:1, padding:'11px 14px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none', colorScheme:'dark' }} />
              <button onClick={addTodo} disabled={!todoInput.trim()} style={{ padding:'11px 18px', background: todoInput.trim() ? C.accent : C.border, border:'none', borderRadius:10, color: todoInput.trim() ? '#fff' : C.muted, fontWeight:600, fontSize:14, cursor: todoInput.trim() ? 'pointer' : 'not-allowed' }}>
                {t.todo_add}
              </button>
            </div>
            {todos.length === 0 ? (
              <p style={{ textAlign:'center', color:C.muted, padding:'32px', fontSize:14 }}>{t.todo_empty}</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {todos.map(todo => (
                  <div key={todo.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, opacity: todo.complete ? 0.5 : 1 }}>
                    <button onClick={() => toggleTodo(todo.id)} style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${todo.complete ? C.success : C.border}`, background: todo.complete ? C.success : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      {todo.complete && <span style={{ color:C.bg, fontSize:11, fontWeight:800 }}>✓</span>}
                    </button>
                    <p style={{ flex:1, fontSize:14, color:C.text, textDecoration: todo.complete ? 'line-through' : 'none' }}>{todo.titre}</p>
                    <button onClick={() => deleteTodo(todo.id)} style={{ padding:'4px 9px', background:`${C.error}12`, border:`1px solid ${C.error}25`, borderRadius:7, color:C.error, fontSize:12, cursor:'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}
