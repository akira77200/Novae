// pages/reseau.js — NOVAE v5 — Tracker réseau professionnel
import { useState, useEffect, useRef, useMemo } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ── Données statiques ─────────────────────────────────────────────
const SECTEURS = [
  'Technologie','Finance','Santé','Éducation','Gouvernement',
  'Commerce','Construction','Médias','ONG','Autre',
]

const CONTEXTES = [
  { id: 'networking', fr: 'Événement networking',       en: 'Networking event'       },
  { id: 'linkedin',   fr: 'LinkedIn / Réseaux sociaux', en: 'LinkedIn / Social media' },
  { id: 'universite', fr: 'Université / Cours',          en: 'University / Classes'   },
  { id: 'travail',    fr: 'Travail / Stage',             en: 'Work / Internship'      },
  { id: 'communaute', fr: 'Communauté africaine',        en: 'African community'      },
  { id: 'autre',      fr: 'Autre',                       en: 'Other'                  },
]

const RAPPELS = [
  { val: 7,   fr: 'Dans 1 semaine',  en: 'In 1 week'   },
  { val: 14,  fr: 'Dans 2 semaines', en: 'In 2 weeks'  },
  { val: 30,  fr: 'Dans 1 mois',     en: 'In 1 month'  },
  { val: null,fr: 'Pas de rappel',   en: 'No reminder' },
]

const EVENTBRITE = {
  Montreal: 'https://www.eventbrite.ca/d/canada--montreal/networking/',
  Toronto:  'https://www.eventbrite.ca/d/canada--toronto/networking/',
  Ottawa:   'https://www.eventbrite.ca/d/canada--ottawa/networking/',
  Vancouver:'https://www.eventbrite.ca/d/canada--vancouver/networking/',
  default:  'https://www.eventbrite.ca/d/canada/networking/',
}

// ── Helpers ───────────────────────────────────────────────────────
const today    = () => new Date().toISOString().split('T')[0]
const joursDepuis = (dateStr) => {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
const joursAvant = (dateStr, rappelDans) => {
  if (!dateStr || !rappelDans) return null
  const echeance = new Date(new Date(dateStr).getTime() + rappelDans * 86400000)
  return Math.ceil((echeance - Date.now()) / 86400000)
}
const formatDate = (dateStr, lang) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day:'numeric', month:'short', year:'numeric' })
}
const initiales = (prenom, nom) =>
  ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '?'

const FORM_VIDE = {
  prenom:'', nom:'', poste:'', entreprise:'', secteur:'', contexte_rencontre:'',
  date_rencontre: today(), derniere_interaction:'', rappel_dans: 7, notes:'', linkedin_url:'',
}

// ── Composant champ formulaire ────────────────────────────────────
function Field({ C, label, value, onChange, placeholder, type='text', rows, required }) {
  const base = {
    width:'100%', padding:'9px 12px', background: C.bg2,
    border:`1px solid ${C.border}`, borderRadius:9,
    color: C.text, fontSize:13, outline:'none',
    boxSizing:'border-box', fontFamily:'system-ui,sans-serif',
  }
  return (
    <div style={{ marginBottom:14 }}>
      {label && (
        <label style={{ fontSize:11, fontWeight:600, color: C.muted, textTransform:'uppercase', letterSpacing:0.6, display:'block', marginBottom:5 }}>
          {label}{required && <span style={{ color: C.error }}> *</span>}
        </label>
      )}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize:'vertical' }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} />
      }
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function Reseau() {
  const { C, lang, user, profile, loading: authLoading, sb } = useApp()

  const hasFetched = useRef(false)
  const [contacts,  setContacts]  = useState([])
  const [ready,     setReady]     = useState(false)
  const [filtre,    setFiltre]    = useState('tous')     // 'tous'|'rappel'|secteur
  const [tri,       setTri]       = useState('recent')   // 'recent'|'nom'|'secteur'
  const [modal,     setModal]     = useState(null)        // null|'new'|contact (edit)
  const [form,      setForm]      = useState(FORM_VIDE)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(null)
  const [err,       setErr]       = useState('')
  const [contacte,  setContacte]  = useState(null)       // id du contact marqué contacté

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
      const res   = await fetch('/api/reseau', { headers: { Authorization: `Bearer ${token}` } })
      const { data } = await res.json()
      setContacts(data || [])
    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  const ouvrirAjout  = () => { setForm({ ...FORM_VIDE, date_rencontre: today() }); setErr(''); setModal('new') }
  const ouvrirEdition = (c) => {
    setForm({
      prenom: c.prenom, nom: c.nom || '', poste: c.poste || '',
      entreprise: c.entreprise || '', secteur: c.secteur || '',
      contexte_rencontre: c.contexte_rencontre || '',
      date_rencontre: c.date_rencontre || today(),
      derniere_interaction: c.derniere_interaction || '',
      rappel_dans: c.rappel_dans ?? 7, notes: c.notes || '',
      linkedin_url: c.linkedin_url || '',
    })
    setErr(''); setModal(c)
  }

  const sauvegarder = async () => {
    if (!form.prenom.trim()) { setErr(lang === 'fr' ? 'Prénom requis' : 'First name required'); return }
    setSaving(true); setErr('')
    try {
      const token  = await getToken()
      const isEdit = modal && modal !== 'new'
      const url    = isEdit ? `/api/reseau/${modal.id}` : '/api/reseau'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'Erreur'); return }
      if (isEdit) setContacts(p => p.map(c => c.id === modal.id ? json.data : c))
      else        setContacts(p => [json.data, ...p])
      setModal(null)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const supprimer = async (id) => {
    if (!confirm(lang === 'fr' ? 'Supprimer ce contact ?' : 'Delete this contact?')) return
    setDeleting(id)
    try {
      const token = await getToken()
      await fetch(`/api/reseau/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
      setContacts(p => p.filter(c => c.id !== id))
    } catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  const marquerContacte = async (c) => {
    setContacte(c.id)
    try {
      const token = await getToken()
      const res   = await fetch(`/api/reseau/${c.id}`, {
        method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ derniere_interaction: today() }),
      })
      const json = await res.json()
      if (res.ok) setContacts(p => p.map(x => x.id === c.id ? json.data : x))
    } catch (e) { console.error(e) }
    finally { setTimeout(() => setContacte(null), 1500) }
  }

  // ── Filtrage + tri ────────────────────────────────────────────
  const rappelsUrgents = contacts.filter(c => {
    const j = joursAvant(c.date_rencontre, c.rappel_dans)
    return j !== null && j <= 7
  })

  const contactsFiltres = useMemo(() => {
    let list = [...contacts]
    if (filtre === 'rappel') list = list.filter(c => {
      const j = joursAvant(c.date_rencontre, c.rappel_dans)
      return j !== null && j <= 7
    })
    else if (filtre !== 'tous') list = list.filter(c => c.secteur === filtre)

    if (tri === 'nom')     list.sort((a,b) => a.prenom.localeCompare(b.prenom))
    if (tri === 'secteur') list.sort((a,b) => (a.secteur||'').localeCompare(b.secteur||''))
    // 'recent' = ordre par défaut (date_rencontre DESC depuis API)
    return list
  }, [contacts, filtre, tri])

  // Stats
  const secteursDiff  = new Set(contacts.map(c => c.secteur).filter(Boolean)).size
  const plusRecent    = contacts[0]
  const prochainRapp  = contacts
    .map(c => ({ ...c, jAvant: joursAvant(c.date_rencontre, c.rappel_dans) }))
    .filter(c => c.jAvant !== null && c.jAvant > 0)
    .sort((a,b) => a.jAvant - b.jAvant)[0]

  const villeProfile  = (profile?.ville_accueil || '').split(',')[0].trim()
  const lienEvent     = EVENTBRITE[villeProfile] || EVENTBRITE.default

  // ── Gate auth ─────────────────────────────────────────────────
  if (!user && !authLoading) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:500, margin:'80px auto', padding:'0 20px', textAlign:'center' }}>
        <p style={{ fontSize:40, marginBottom:16 }}>🔒</p>
        <p style={{ fontSize:16, color:C.text, fontWeight:600, marginBottom:8 }}>
          {lang==='fr' ? 'Connexion requise' : 'Login required'}
        </p>
        <a href="/auth/login" style={{ padding:'10px 24px', background:C.accent, borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>
          {lang==='fr' ? 'Se connecter →' : 'Log in →'}
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />

      {/* ── Modal ajout / édition ── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflowY:'auto' }}
          onClick={() => setModal(null)}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, width:'100%', maxWidth:500, overflow:'hidden', margin:'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:'18px 22px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontWeight:700, fontSize:15, color:C.text }}>
                {modal === 'new'
                  ? (lang==='fr' ? '+ Nouveau contact' : '+ New contact')
                  : (lang==='fr' ? 'Modifier le contact' : 'Edit contact')}
              </p>
              <button onClick={() => setModal(null)} style={{ width:28, height:28, borderRadius:'50%', border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:13 }}>✕</button>
            </div>

            <div style={{ padding:'20px 22px', maxHeight:'70vh', overflowY:'auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <Field C={C} label={lang==='fr'?'Prénom':'First name'} value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))} placeholder="Marie" required />
                <Field C={C} label={lang==='fr'?'Nom':'Last name'} value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Dupont" />
                <Field C={C} label={lang==='fr'?'Poste':'Job title'} value={form.poste} onChange={e=>setForm(p=>({...p,poste:e.target.value}))} placeholder="Développeuse web" />
                <Field C={C} label={lang==='fr'?'Entreprise':'Company'} value={form.entreprise} onChange={e=>setForm(p=>({...p,entreprise:e.target.value}))} placeholder="Desjardins" />
              </div>

              {/* Secteur */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, display:'block', marginBottom:5 }}>
                  {lang==='fr'?'Secteur':'Sector'}
                </label>
                <select value={form.secteur} onChange={e=>setForm(p=>({...p,secteur:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', background:C.bg2, border:`1px solid ${C.border}`, borderRadius:9, color:C.text, fontSize:13, outline:'none' }}>
                  <option value="">{lang==='fr'?'Choisir...':'Choose...'}</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Contexte */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, display:'block', marginBottom:8 }}>
                  {lang==='fr'?'Contexte de rencontre':'How you met'}
                </label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {CONTEXTES.map(c => {
                    const sel = form.contexte_rencontre === c.id
                    return (
                      <button key={c.id} onClick={()=>setForm(p=>({...p,contexte_rencontre:c.id}))}
                        style={{ padding:'6px 12px', borderRadius:20, border:`1px solid ${sel?C.accent+'50':C.border}`, background:sel?`${C.accent}15`:'transparent', color:sel?C.accent2:C.muted, fontSize:12, cursor:'pointer', fontWeight:sel?600:400 }}>
                        {lang==='fr'?c.fr:c.en}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <Field C={C} label={lang==='fr'?'Date de rencontre':'Date met'} type="date" value={form.date_rencontre} onChange={e=>setForm(p=>({...p,date_rencontre:e.target.value}))} />
                <Field C={C} label={lang==='fr'?'Dernière interaction':'Last interaction'} type="date" value={form.derniere_interaction} onChange={e=>setForm(p=>({...p,derniere_interaction:e.target.value}))} />
              </div>

              {/* Rappel */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, display:'block', marginBottom:8 }}>
                  {lang==='fr'?'Rappel de suivi':'Follow-up reminder'}
                </label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {RAPPELS.map(r => {
                    const sel = form.rappel_dans === r.val
                    return (
                      <button key={String(r.val)} onClick={()=>setForm(p=>({...p,rappel_dans:r.val}))}
                        style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${sel?C.warning+'50':C.border}`, background:sel?`${C.warning}12`:'transparent', color:sel?C.warning:C.muted, fontSize:12, cursor:'pointer', fontWeight:sel?600:400 }}>
                        {lang==='fr'?r.fr:r.en}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Field C={C} label="LinkedIn (optionnel)" value={form.linkedin_url} onChange={e=>setForm(p=>({...p,linkedin_url:e.target.value}))} placeholder="linkedin.com/in/marie-dupont" />
              <Field C={C} label="Notes" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder={lang==='fr'?'Infos supplémentaires...':'Additional info...'} rows={3} />

              {err && <p style={{ fontSize:13, color:C.error, marginBottom:12 }}>{err}</p>}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setModal(null)} style={{ flex:1, padding:'11px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  {lang==='fr'?'Annuler':'Cancel'}
                </button>
                <button onClick={sauvegarder} disabled={saving}
                  style={{ flex:2, padding:'11px', background:saving?C.border:C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:700, fontSize:14, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                  {saving?'...':(lang==='fr'?'Sauvegarder':'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth:860, margin:'0 auto', padding:'32px 20px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:-0.5, marginBottom:4 }}>
              🎯 {lang==='fr'?'Mon Réseau Professionnel':'My Professional Network'}
            </h1>
            <p style={{ fontSize:14, color:C.muted }}>
              {contacts.length} {lang==='fr'?'contact(s)':'contact(s)'}
              {rappelsUrgents.length > 0 && (
                <span style={{ color:C.warning, fontWeight:600 }}>
                  {' '}· {rappelsUrgents.length} {lang==='fr'?'rappel(s) cette semaine':'reminder(s) this week'} ⏰
                </span>
              )}
            </p>
          </div>
          <button onClick={ouvrirAjout}
            style={{ padding:'10px 20px', background:C.accent, border:'none', borderRadius:10, color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer' }}>
            + {lang==='fr'?'Ajouter':'Add'}
          </button>
        </div>

        {/* Sous-titre */}
        <p style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.6 }}>
          {lang==='fr'
            ? 'Les connexions que tu fais au Canada peuvent changer ta carrière.'
            : 'The connections you make in Canada can change your career.'}
        </p>

        {/* ── Alertes rappels ── */}
        {rappelsUrgents.map(c => {
          const jRestants = joursAvant(c.date_rencontre, c.rappel_dans)
          return (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:`${C.warning}08`, border:`1px solid ${C.warning}30`, borderRadius:12, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:18 }}>⏰</span>
              <p style={{ fontSize:13, color:C.text, flex:1 }}>
                <strong>{c.prenom}{c.nom?' '+c.nom:''}</strong>
                {' — '}
                {lang==='fr'
                  ? `tu devrais le/la recontacter (rencontré il y a ${joursDepuis(c.date_rencontre)}j)`
                  : `you should reconnect (met ${joursDepuis(c.date_rencontre)} days ago)`}
              </p>
              <button onClick={()=>marquerContacte(c)} disabled={contacte===c.id}
                style={{ padding:'7px 14px', background:contacte===c.id?C.success:C.warning, border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', opacity:contacte===c.id?0.8:1 }}>
                {contacte===c.id?'✓':(lang==='fr'?'Marquer contacté':'Mark as contacted')}
              </button>
            </div>
          )
        })}

        {/* ── Filtres + Tri ── */}
        {contacts.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
            {/* Filtre */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1 }}>
              {[
                { id:'tous',   fr:'Tous', en:'All' },
                { id:'rappel', fr:'Rappels urgents', en:'Urgent reminders' },
                ...SECTEURS.filter(s => contacts.some(c=>c.secteur===s)).map(s=>({ id:s, fr:s, en:s })),
              ].map(f => (
                <button key={f.id} onClick={()=>setFiltre(f.id)}
                  style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filtre===f.id?C.accent+'50':C.border}`, background:filtre===f.id?`${C.accent}15`:'transparent', color:filtre===f.id?C.accent2:C.muted, fontSize:12, fontWeight:500, cursor:'pointer' }}>
                  {lang==='fr'?f.fr:f.en}
                </button>
              ))}
            </div>
            {/* Tri */}
            <select value={tri} onChange={e=>setTri(e.target.value)}
              style={{ padding:'7px 12px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, color:C.text, fontSize:12, outline:'none' }}>
              <option value="recent">{lang==='fr'?'↓ Plus récents':'↓ Most recent'}</option>
              <option value="nom">{lang==='fr'?'A → Z (prénom)':'A → Z (name)'}</option>
              <option value="secteur">{lang==='fr'?'Par secteur':'By sector'}</option>
            </select>
          </div>
        )}

        {/* ── Liste contacts ── */}
        {!ready ? (
          <p style={{ textAlign:'center', color:C.muted, padding:'40px' }}>{lang==='fr'?'Chargement...':'Loading...'}</p>
        ) : contactsFiltres.length === 0 && contacts.length === 0 ? (
          /* État vide */
          <div style={{ textAlign:'center', padding:'52px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, marginBottom:24 }}>
            <p style={{ fontSize:36, marginBottom:14 }}>🎯</p>
            <p style={{ fontWeight:600, fontSize:15, color:C.text, marginBottom:8 }}>
              {lang==='fr'?'Ton réseau commence ici.':'Your network starts here.'}
            </p>
            <p style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
              {lang==='fr'
                ? 'Ajoute les personnes que tu rencontres — événements, université, LinkedIn.'
                : 'Add people you meet — events, university, LinkedIn.'}
            </p>
            <button onClick={ouvrirAjout} style={{ padding:'10px 22px', background:C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>
              + {lang==='fr'?'Ajouter mon premier contact':'Add my first contact'}
            </button>
          </div>
        ) : contactsFiltres.length === 0 ? (
          <p style={{ textAlign:'center', color:C.muted, padding:'32px' }}>{lang==='fr'?'Aucun contact dans ce filtre.':'No contacts in this filter.'}</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:12, marginBottom:32 }}>
            {contactsFiltres.map(c => {
              const jDep   = joursDepuis(c.date_rencontre)
              const jAv    = joursAvant(c.date_rencontre, c.rappel_dans)
              const urgent = jAv !== null && jAv <= 7
              const ctx    = CONTEXTES.find(x => x.id === c.contexte_rencontre)

              return (
                <div key={c.id} style={{ background:C.surface, border:`1px solid ${urgent?C.warning+'40':C.border}`, borderRadius:14, padding:'16px 18px' }}>
                  {/* Header carte */}
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:`${C.accent}18`, border:`1.5px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:C.accent2, flexShrink:0 }}>
                      {initiales(c.prenom, c.nom)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.prenom}{c.nom?' '+c.nom:''}
                      </p>
                      {(c.poste || c.entreprise) && (
                        <p style={{ fontSize:12, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {[c.poste, c.entreprise].filter(Boolean).join(' @ ')}
                        </p>
                      )}
                    </div>
                    {c.secteur && (
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:`${C.accent}10`, color:C.accent2, flexShrink:0 }}>{c.secteur}</span>
                    )}
                  </div>

                  {/* Infos */}
                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12, fontSize:12, color:C.muted }}>
                    {c.date_rencontre && (
                      <p>📅 {lang==='fr'?'Rencontré le':'Met on'} {formatDate(c.date_rencontre, lang)}
                        {jDep !== null && <span style={{ color:C.muted }}> · {jDep}j</span>}
                      </p>
                    )}
                    {ctx && <p>📍 {lang==='fr'?ctx.fr:ctx.en}</p>}
                    {jAv !== null && (
                      <p style={{ color: urgent?C.warning:C.muted, fontWeight: urgent?600:400 }}>
                        🔔 {urgent
                          ? (lang==='fr'?`Rappel dans ${jAv}j`:`Reminder in ${jAv}d`)
                          : (lang==='fr'?`Rappel dans ${jAv}j`:`Reminder in ${jAv}d`)}
                      </p>
                    )}
                    {c.notes && <p style={{ fontStyle:'italic', lineHeight:1.5 }}>"{c.notes}"</p>}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    {c.linkedin_url && (
                      <a href={c.linkedin_url.startsWith('http')?c.linkedin_url:`https://${c.linkedin_url}`}
                        target="_blank" rel="noreferrer"
                        style={{ padding:'6px 12px', background:`${C.accent}12`, border:`1px solid ${C.accent}25`, borderRadius:8, color:C.accent2, fontSize:12, fontWeight:600, textDecoration:'none' }}>
                        LinkedIn →
                      </a>
                    )}
                    <button onClick={()=>ouvrirEdition(c)}
                      style={{ padding:'6px 10px', background:`${C.accent}08`, border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:'pointer' }}>✏️</button>
                    <button onClick={()=>supprimer(c.id)} disabled={deleting===c.id}
                      style={{ padding:'6px 10px', background:`${C.error}08`, border:`1px solid ${C.error}20`, borderRadius:8, color:C.error, fontSize:13, cursor:deleting===c.id?'not-allowed':'pointer', opacity:deleting===c.id?0.5:1 }}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Stats réseau ── */}
        {contacts.length > 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 22px', marginBottom:20 }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>
              📊 {lang==='fr'?'Ton réseau au Canada':'Your network in Canada'}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12 }}>
              {[
                { val:contacts.length,  label:lang==='fr'?'contacts':'contacts',          color:C.accent2   },
                { val:secteursDiff,     label:lang==='fr'?'secteurs différents':'sectors', color:C.warning   },
                { val:plusRecent ? `${plusRecent.prenom}` : '—', label:lang==='fr'?'contact récent':'latest contact', color:C.success, small:true },
                { val:prochainRapp ? `J-${prochainRapp.jAvant}` : '—', label:lang==='fr'?'prochain rappel':'next reminder', color:C.rose },
              ].map((s,i) => (
                <div key={i} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 14px' }}>
                  <p style={{ fontSize:s.small?16:24, fontWeight:700, color:s.color, marginBottom:3 }}>{s.val}</p>
                  <p style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Conseil IA si réseau < 5 ── */}
        {ready && contacts.length < 5 && (
          <div style={{ display:'flex', gap:12, padding:'14px 16px', background:`${C.accent}06`, border:`1px solid ${C.accent}18`, borderRadius:12 }}>
            <span style={{ fontSize:20 }}>💡</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, color:C.text, lineHeight:1.6, marginBottom:8 }}>
                {lang==='fr'
                  ? `Conseil : participe à un événement networking dans ta ville pour agrandir ton réseau.`
                  : `Tip: attend a networking event in your city to grow your network.`}
              </p>
              <a href={lienEvent} target="_blank" rel="noreferrer"
                style={{ fontSize:12, color:C.accent2, fontWeight:600, textDecoration:'none' }}>
                🔗 {lang==='fr'?`Événements networking ${villeProfile||'Canada'} →`:`Networking events ${villeProfile||'Canada'} →`}
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
