// pages/dashboard.js — NOVAE v5 — zéro donnée fictive
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const calcJours = (dateStr) => {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 0
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff < 0 || diff > 36500) return 0
  return diff
}

const getAlertes = (profil) => {
  if (!profil?.date_arrivee || !profil?.pays_accueil) return []
  const arrivee = new Date(profil.date_arrivee)
  const now = new Date()
  const alertes = []
  if (profil.pays_accueil === 'Canada') {
    const ecRAMQ = new Date(arrivee.getTime() + 84 * 86400000)
    const jRAMQ = Math.ceil((ecRAMQ - now) / 86400000)
    if (jRAMQ > 0 && jRAMQ <= 84)
      alertes.push({ type: jRAMQ <= 14 ? 'urgent' : 'warning', titre: `RAMQ — ${jRAMQ} jour${jRAMQ > 1 ? 's' : ''} restant${jRAMQ > 1 ? 's' : ''}`, message: "Inscris-toi maintenant. Passeport + permis + preuve d'adresse.", lien: 'https://www.ramq.gouv.qc.ca' })
    const annee = now.getFullYear()
    const ecImp = new Date(`${annee}-04-30`)
    const jImp = Math.ceil((ecImp - now) / 86400000)
    if (jImp > 0 && jImp <= 75)
      alertes.push({ type: 'info', titre: `Impôts — ${jImp} jours avant le 30 avril`, message: 'Tu as droit à des crédits. Ne rate pas ça.', lien: 'https://www.canada.ca/fr/agence-revenu.html' })
  }
  return alertes
}

const CAT_STYLE = {
  admin:    { label: 'Admin',      color: '#52B788', bg: 'rgba(82,183,136,0.12)'  },
  banque:   { label: 'Banque',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  sante:    { label: 'Santé',      color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  logement: { label: 'Logement',   color: '#B5838D', bg: 'rgba(181,131,141,0.12)' },
  social:   { label: 'Social',     color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  univ:     { label: 'Université', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
}

export default function Dashboard() {
  const { C, t, user, profile, loading: authLoading, sb } = useApp()
  const router = useRouter()

  const [tab,       setTab]       = useState('checklist')
  const [filtre,    setFiltre]    = useState('tous')
  const [taches,    setTaches]    = useState([])
  const [faites,    setFaites]    = useState([])
  const [mentors,   setMentors]   = useState([])
  const [guides,    setGuides]    = useState([])
  const [todos,     setTodos]     = useState([])
  const [todoInput, setTodoInput] = useState('')
  const [mOpen,     setMOpen]     = useState(null)
  const [duree,     setDuree]     = useState(30)
  const [paying,    setPaying]    = useState(false)
  const [ready,     setReady]     = useState(false)

  const hasFetched = useRef(false)

  // Profil actif — connecté ou localStorage
  const localProfile = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('novae_profil') || 'null')
    : null
  const activeProfile = profile || localProfile

  useEffect(() => {
    if (authLoading) return
    if (hasFetched.current) return
    hasFetched.current = true
    loadData()
  }, [authLoading, user?.id])

  const loadData = async () => {
    try {
      const pays = activeProfile?.pays_accueil || profile?.pays_accueil || 'Canada'

      const { data: tachesData } = await sb
        .from('taches').select('*').eq('actif', true).order('ordre')
      setTaches((tachesData || []).filter(t =>
        !t.pays_accueil || t.pays_accueil.includes(pays)
      ))

      if (user) {
        const { data: faitesData } = await sb
          .from('taches_utilisateur').select('tache_id')
          .eq('utilisateur_id', user.id).eq('complete', true)
        setFaites((faitesData || []).map(f => f.tache_id))

        const { data: todosData } = await sb
          .from('todos').select('*').eq('utilisateur_id', user.id).order('created_at')
        setTodos(todosData || [])
      } else {
        setFaites(JSON.parse(localStorage.getItem('novae_faites') || '[]'))
        setTodos(JSON.parse(localStorage.getItem('novae_todos') || '[]'))
      }

      const { data: mentorsData } = await sb
        .from('mentors').select('*').eq('actif', true).eq('disponible', true)
        .order('note_moyenne', { ascending: false })
      setMentors(mentorsData || [])

      const { data: guidesData } = await sb
        .from('guides').select('*').eq('publie', true).order('ordre')
      setGuides(guidesData || [])

    } catch (e) {
      console.error(e)
    } finally {
      setReady(true)
    }
  }

  const toggleTache = async (id) => {
    const estFaite = faites.includes(id)
    const next = estFaite ? faites.filter(i => i !== id) : [...faites, id]
    setFaites(next)
    if (user) {
      await sb.from('taches_utilisateur').upsert(
        { utilisateur_id: user.id, tache_id: id, complete: !estFaite,
          complete_at: !estFaite ? new Date().toISOString() : null },
        { onConflict: 'utilisateur_id,tache_id' }
      )
    } else {
      localStorage.setItem('novae_faites', JSON.stringify(next))
    }
  }

  const addTodo = async () => {
    if (!todoInput.trim()) return
    if (user) {
      const { data } = await sb.from('todos')
        .insert({ utilisateur_id: user.id, titre: todoInput.trim() })
        .select().single()
      if (data) setTodos(p => [...p, data])
    } else {
      const todo = { id: Date.now().toString(), titre: todoInput.trim(), complete: false }
      const next = [...todos, todo]
      setTodos(next)
      localStorage.setItem('novae_todos', JSON.stringify(next))
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
      const prix = duree === 30
        ? (mentor.tarif_30min || 1499) / 100
        : (mentor.tarif_45min || 1999) / 100
      const res = await fetch('/api/sessions/creer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id, mentorNom: mentor.full_name,
          sujet: (mentor.sujets || ['Général'])[0],
          dureeMinutes: duree, montantCAD: prix,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Configure ta clé Stripe dans .env.local')
    } catch (e) { alert(e.message) }
    finally { setPaying(false) }
  }

  // Écran de chargement — seulement pendant authLoading
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
        <p style={{ color: C.muted, fontSize: 14 }}>{t.loading}</p>
      </div>
    </div>
  )

  const jours = calcJours(activeProfile?.date_arrivee || profile?.date_arrivee)
  const prog = taches.length > 0 ? Math.round((faites.length / taches.length) * 100) : 0
  const alertes = getAlertes(activeProfile || profile)
  const tF = filtre === 'tous' ? taches
    : filtre === 'a_faire' ? taches.filter(t => !faites.includes(t.id))
    : taches.filter(t => faites.includes(t.id))

  const TABS = [
    { id: 'checklist', label: t.nav_checklist },
    { id: 'mentors',   label: t.nav_mentors   },
    { id: 'guides',    label: t.ebook_title    },
    { id: 'todo',      label: t.nav_todo       },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />

      {paying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Redirection vers le paiement...</p>
        </div>
      )}

      {/* Modal mentor */}
      {mOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setMOpen(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 420, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: C.accent2 }}>
                  {(mOpen.full_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 17, color: C.text }}>{mOpen.full_name}</p>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{mOpen.pays_origine} → {mOpen.ville_accueil}</p>
                  {mOpen.note_moyenne > 0 && <p style={{ fontSize: 12, color: C.warning, marginTop: 2 }}>★ {Number(mOpen.note_moyenne).toFixed(1)} · {mOpen.sessions_total} sessions</p>}
                </div>
              </div>
              <button onClick={() => setMOpen(null)} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: '18px 24px' }}>
              {mOpen.bio && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>{mOpen.bio}</p>}
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Durée</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[30, 45].map(d => {
                  const tarif = ((d === 30 ? mOpen.tarif_30min : mOpen.tarif_45min) || (d === 30 ? 1499 : 1999)) / 100
                  return (
                    <button key={d} onClick={() => setDuree(d)}
                      style={{ flex: 1, padding: '13px', borderRadius: 10, border: `1px solid ${duree === d ? C.accent + '60' : C.border}`, background: duree === d ? `${C.accent}15` : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: duree === d ? C.accent2 : C.text }}>{tarif.toFixed(2)} $</span>
                      <span style={{ fontSize: 12, color: C.muted }}>{d} min · CAD</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => reserver(mOpen)}
                style={{ width: '100%', padding: '13px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                🔒 Réserver & Payer
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 8 }}>{t.refund_policy}</p>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Bannière invité */}
        {!user && (
          <div style={{ padding: '12px 18px', background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: C.accent2 }}>Crée un compte pour sauvegarder ta progression.</p>
            <a href="/auth/register" style={{ padding: '7px 16px', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>S'inscrire gratuitement →</a>
          </div>
        )}

        {/* Alertes */}
        {alertes.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 11, border: '1px solid', marginBottom: 10, borderColor: a.type === 'urgent' ? '#F87171' : a.type === 'warning' ? '#FBBF24' : C.accent + '50', background: a.type === 'urgent' ? 'rgba(248,113,113,0.07)' : a.type === 'warning' ? 'rgba(251,191,36,0.07)' : `${C.accent}08` }}>
            <span style={{ fontSize: 16 }}>{a.type === 'urgent' ? '🔴' : a.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 2 }}>{a.titre}</p>
              <p style={{ fontSize: 12, color: C.muted }}>{a.message}</p>
            </div>
            {a.lien && <a href={a.lien} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', background: `${C.accent}18`, border: `1px solid ${C.accent}35`, borderRadius: 7, color: C.accent2, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Agir →</a>}
          </div>
        ))}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { val: `${prog}%`, label: t.dash_progress, color: C.accent2, bar: prog },
            { val: faites.length, label: t.dash_done, color: C.success },
            { val: taches.length - faites.length, label: t.dash_remaining, color: C.warning },
            { val: `J+${jours}`, label: t.dash_since, color: C.rose },
          ].map((s, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.val}</p>
              <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500 }}>{s.label}</p>
              {s.bar != null && <div style={{ height: 3, background: C.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}><div style={{ width: `${s.bar}%`, height: '100%', background: C.accent2, borderRadius: 3, transition: 'width 0.5s' }} /></div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: tab === tb.id ? C.accent : 'transparent', color: tab === tb.id ? '#fff' : C.muted }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* CHECKLIST */}
        {tab === 'checklist' && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['tous', 'a_faire', 'faites'].map(f => (
                <button key={f} onClick={() => setFiltre(f)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filtre === f ? C.accent + '50' : C.border}`, background: filtre === f ? `${C.accent}15` : 'transparent', color: filtre === f ? C.accent2 : C.muted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  {f === 'tous' ? `${t.checklist_all} (${taches.length})` : f === 'a_faire' ? `${t.checklist_todo} (${taches.length - faites.length})` : `${t.checklist_done} (${faites.length})`}
                </button>
              ))}
            </div>
            {!ready ? (
              <p style={{ textAlign: 'center', color: C.muted, padding: '32px', fontSize: 14 }}>Chargement des tâches...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {tF.map(tache => {
                  const done = faites.includes(tache.id)
                  const cat = CAT_STYLE[tache.categorie] || CAT_STYLE.admin
                  return (
                    <div key={tache.id} onClick={() => toggleTache(tache.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, cursor: 'pointer', opacity: done ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{tache.icone || '📌'}</span>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${done ? C.success : C.border}`, background: done ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {done && <span style={{ color: C.bg, fontSize: 11, fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 5, textDecoration: done ? 'line-through' : 'none' }}>{tache.titre}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20, background: cat.bg, color: cat.color }}>{cat.label}</span>
                          {tache.priorite === 'critique' && <span style={{ fontSize: 11, color: C.error, fontWeight: 500 }}>· Critique</span>}
                        </div>
                      </div>
                      {tache.lien_officiel && !done && (
                        <a href={tache.lien_officiel} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ padding: '5px 10px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 7, color: C.accent2, fontSize: 12 }}>↗</a>
                      )}
                    </div>
                  )
                })}
                {tF.length === 0 && <p style={{ textAlign: 'center', color: C.muted, padding: '32px', fontSize: 14 }}>Aucune tâche dans cette catégorie.</p>}
              </div>
            )}
          </>
        )}

        {/* MENTORS */}
        {tab === 'mentors' && (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>{t.mentor_title}</p>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>30 ou 45 minutes avec quelqu'un qui a vécu ce que tu vis.</p>
            {mentors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                <p style={{ fontSize: 36, marginBottom: 14 }}>🤝</p>
                <p style={{ fontWeight: 600, fontSize: 16, color: C.text, marginBottom: 8 }}>{t.mentor_empty}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 22 }}>Les mentors sont vérifiés avant activation. Reviens bientôt.</p>
                <a href="/auth/register-mentor" style={{ padding: '10px 22px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{t.mentor_become} →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mentors.map(m => {
                  const tarif = ((m.tarif_30min || 1499) / 100).toFixed(2)
                  const sujets = Array.isArray(m.sujets) ? m.sujets : []
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${C.accent}18`, border: `1.5px solid ${C.accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, color: C.accent2, flexShrink: 0 }}>
                        {(m.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 2 }}>{m.full_name}</p>
                        <p style={{ fontSize: 12, color: C.muted, marginBottom: 7 }}>{m.pays_origine} → {m.ville_accueil}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {sujets.map(s => <span key={s} style={{ fontSize: 11, padding: '2px 9px', background: `${C.accent}10`, color: C.accent2, borderRadius: 20, border: `1px solid ${C.accent}20` }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: C.accent2 }}>{tarif} $</p>
                        <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>CAD · 30 min</p>
                        {m.note_moyenne > 0 && <p style={{ fontSize: 12, color: C.warning, marginBottom: 8 }}>★ {Number(m.note_moyenne).toFixed(1)}</p>}
                        <button onClick={() => { setMOpen(m); setDuree(30) }}
                          style={{ padding: '8px 16px', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.mentor_book}</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* GUIDES */}
        {tab === 'guides' && (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>{t.ebook_title}</p>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Télécharge et lis gratuitement.</p>
            {guides.length === 0 ? (
              <p style={{ color: C.muted, textAlign: 'center', padding: '32px' }}>Aucun guide disponible.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
                {guides.map(g => (
                  <div key={g.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: g.gratuit ? `${C.success}18` : `${C.accent}18`, color: g.gratuit ? C.success : C.accent2, letterSpacing: 0.5 }}>
                        {g.gratuit ? 'GRATUIT' : `${(3.99).toFixed(2)} $`}
                      </span>
                      <span style={{ fontSize: 11, color: C.muted }}>⏱ {g.temps_lecture} min</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{g.titre}</p>
                    <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>{g.resume}</p>
                    <button onClick={() => {
                      const blob = new Blob([g.contenu], { type: 'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `novae-${g.slug}.txt`; a.click()
                      URL.revokeObjectURL(url)
                    }} style={{ width: '100%', padding: '10px', background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 9, color: C.accent2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      {t.ebook_read} →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TODO */}
        {tab === 'todo' && (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>{t.todo_title}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <input value={todoInput} onChange={e => setTodoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder={t.todo_placeholder}
                style={{ flex: 1, padding: '11px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
              <button onClick={addTodo} disabled={!todoInput.trim()}
                style={{ padding: '11px 18px', background: todoInput.trim() ? C.accent : C.border, border: 'none', borderRadius: 10, color: todoInput.trim() ? '#fff' : C.muted, fontWeight: 600, fontSize: 14, cursor: todoInput.trim() ? 'pointer' : 'not-allowed' }}>
                {t.todo_add}
              </button>
            </div>
            {todos.length === 0 ? (
              <p style={{ textAlign: 'center', color: C.muted, padding: '32px', fontSize: 14 }}>{t.todo_empty}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {todos.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, opacity: todo.complete ? 0.5 : 1 }}>
                    <button onClick={() => toggleTodo(todo.id)}
                      style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${todo.complete ? C.success : C.border}`, background: todo.complete ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      {todo.complete && <span style={{ color: C.bg, fontSize: 11, fontWeight: 800 }}>✓</span>}
                    </button>
                    <p style={{ flex: 1, fontSize: 14, color: C.text, textDecoration: todo.complete ? 'line-through' : 'none' }}>{todo.titre}</p>
                    <button onClick={() => deleteTodo(todo.id)}
                      style={{ padding: '4px 9px', background: `${C.error}12`, border: `1px solid ${C.error}25`, borderRadius: 7, color: C.error, fontSize: 12, cursor: 'pointer' }}>✕</button>
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
