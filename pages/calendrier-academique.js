// pages/calendrier-academique.js — NOVAE v5 — Calendrier académique par université
import { useState, useMemo } from 'react'

import { useApp } from '../context/AppContext'
import { useAuthFetch } from '../lib/useAuthFetch'
import SAFE_LINKS from '../lib/safeLinks'

// ─────────────────────────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────────────────────────
const CALENDRIER_DB = {
  uottawa: {
    nom: "Université d'Ottawa",
    ville: 'Ottawa',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-02', titre: { fr: 'Début session automne', en: 'Fall session begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-11', titre: { fr: 'Jour du Souvenir — congé', en: 'Remembrance Day — holiday' }, type: 'conge' },
      { date: '2025-11-21', titre: { fr: 'Dernière journée cours automne', en: 'Last day of fall classes' }, type: 'important' },
      { date: '2025-12-06', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-20', titre: { fr: 'Fin examens — vacances de Noël', en: 'Exams end — Winter break' }, type: 'conge' },
      { date: '2026-01-05', titre: { fr: 'Début session hiver', en: 'Winter session begins' }, type: 'session' },
      { date: '2026-02-16', titre: { fr: 'Semaine de relâche hiver', en: 'Winter Reading Week' }, type: 'conge' },
      { date: '2026-04-03', titre: { fr: 'Dernière journée cours hiver', en: 'Last day of winter classes' }, type: 'important' },
      { date: '2026-04-07', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-24', titre: { fr: 'Fin examens finaux hiver', en: 'Winter final exams end' }, type: 'important' },
      { date: '2026-04-30', titre: { fr: 'Date limite déclaration revenus', en: 'Tax filing deadline' }, type: 'important' },
      { date: '2026-05-11', titre: { fr: 'Début session printemps/été', en: 'Spring/Summer session begins' }, type: 'session' },
    ],
  },
  mcgill: {
    nom: 'Université McGill',
    ville: 'Montréal',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-02', titre: { fr: 'Début session automne', en: 'Fall semester begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-01', titre: { fr: 'Journée portes ouvertes', en: 'Open House Day' }, type: 'important' },
      { date: '2025-12-02', titre: { fr: 'Dernière journée cours automne', en: 'Last day of fall classes' }, type: 'important' },
      { date: '2025-12-05', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-19', titre: { fr: 'Fin examens — vacances', en: 'Exams end — holidays' }, type: 'conge' },
      { date: '2026-01-05', titre: { fr: 'Début session hiver', en: 'Winter semester begins' }, type: 'session' },
      { date: '2026-02-23', titre: { fr: 'Semaine de relâche', en: 'Study break week' }, type: 'conge' },
      { date: '2026-04-09', titre: { fr: 'Dernière journée cours hiver', en: 'Last day of winter classes' }, type: 'important' },
      { date: '2026-04-14', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-30', titre: { fr: 'Fin examens finaux + deadline impôts', en: 'Final exams end + tax deadline' }, type: 'important' },
    ],
  },
  udem: {
    nom: 'Université de Montréal',
    ville: 'Montréal',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-01', titre: { fr: 'Début session automne', en: 'Fall session begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-11', titre: { fr: 'Remembrance Day — congé', en: 'Remembrance Day — holiday' }, type: 'conge' },
      { date: '2025-12-05', titre: { fr: 'Fin des cours automne', en: 'End of fall classes' }, type: 'important' },
      { date: '2025-12-08', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-19', titre: { fr: 'Fin examens — Noël', en: 'Exams end — Christmas break' }, type: 'conge' },
      { date: '2026-01-06', titre: { fr: 'Début session hiver', en: 'Winter session begins' }, type: 'session' },
      { date: '2026-03-02', titre: { fr: 'Semaine de relâche hiver', en: 'Winter break week' }, type: 'conge' },
      { date: '2026-04-10', titre: { fr: 'Fin des cours hiver', en: 'End of winter classes' }, type: 'important' },
      { date: '2026-04-13', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-30', titre: { fr: 'Fin examens + deadline impôts', en: 'Exams end + tax deadline' }, type: 'important' },
    ],
  },
  utoronto: {
    nom: 'Université de Toronto',
    ville: 'Toronto',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-08', titre: { fr: 'Début session automne', en: 'Fall session begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-11', titre: { fr: 'Jour du Souvenir — congé', en: 'Remembrance Day — holiday' }, type: 'conge' },
      { date: '2025-12-02', titre: { fr: 'Dernière journée cours automne', en: 'Last day of fall classes' }, type: 'important' },
      { date: '2025-12-08', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-22', titre: { fr: 'Fin examens — vacances de Noël', en: 'Exams end — holiday break' }, type: 'conge' },
      { date: '2026-01-05', titre: { fr: 'Début session hiver', en: 'Winter session begins' }, type: 'session' },
      { date: '2026-02-16', titre: { fr: 'Reading Week (relâche)', en: 'Reading Week break' }, type: 'conge' },
      { date: '2026-04-06', titre: { fr: 'Dernière journée cours hiver', en: 'Last day of winter classes' }, type: 'important' },
      { date: '2026-04-09', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-28', titre: { fr: 'Fin examens finaux hiver', en: 'Winter final exams end' }, type: 'important' },
      { date: '2026-04-30', titre: { fr: 'Deadline déclaration de revenus', en: 'Income tax filing deadline' }, type: 'important' },
    ],
  },
  ubc: {
    nom: 'Université de la Colombie-Britannique',
    ville: 'Vancouver',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-03', titre: { fr: 'Début session automne', en: 'Fall session begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-11', titre: { fr: 'Jour du Souvenir — congé', en: 'Remembrance Day — holiday' }, type: 'conge' },
      { date: '2025-12-01', titre: { fr: 'Fin des cours automne', en: 'End of fall classes' }, type: 'important' },
      { date: '2025-12-05', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-20', titre: { fr: 'Fin examens — vacances', en: 'Exams end — holidays' }, type: 'conge' },
      { date: '2026-01-05', titre: { fr: 'Début session hiver (S2)', en: 'Winter session (S2) begins' }, type: 'session' },
      { date: '2026-02-16', titre: { fr: 'Reading Break (relâche)', en: 'Reading Break' }, type: 'conge' },
      { date: '2026-04-08', titre: { fr: 'Fin des cours hiver', en: 'End of winter classes' }, type: 'important' },
      { date: '2026-04-10', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-25', titre: { fr: 'Fin examens finaux hiver', en: 'Winter final exams end' }, type: 'important' },
      { date: '2026-04-30', titre: { fr: 'Deadline impôts Canada', en: 'Canada tax deadline' }, type: 'important' },
    ],
  },
  concordia: {
    nom: 'Université Concordia',
    ville: 'Montréal',
    annee: '2025–2026',
    evenements: [
      { date: '2025-09-02', titre: { fr: 'Début session automne', en: 'Fall session begins' }, type: 'session' },
      { date: '2025-10-13', titre: { fr: 'Thanksgiving — congé', en: 'Thanksgiving — holiday' }, type: 'conge' },
      { date: '2025-11-28', titre: { fr: 'Fin des cours automne', en: 'End of fall classes' }, type: 'important' },
      { date: '2025-12-04', titre: { fr: 'Début examens finaux automne', en: 'Fall final exams begin' }, type: 'examen' },
      { date: '2025-12-18', titre: { fr: 'Fin examens — congé des Fêtes', en: 'Exams end — holiday break' }, type: 'conge' },
      { date: '2026-01-07', titre: { fr: 'Début session hiver', en: 'Winter session begins' }, type: 'session' },
      { date: '2026-03-02', titre: { fr: 'Semaine de relâche', en: 'Study break' }, type: 'conge' },
      { date: '2026-04-09', titre: { fr: 'Fin des cours hiver', en: 'End of winter classes' }, type: 'important' },
      { date: '2026-04-14', titre: { fr: 'Début examens finaux hiver', en: 'Winter final exams begin' }, type: 'examen' },
      { date: '2026-04-29', titre: { fr: 'Fin examens finaux hiver', en: 'Winter final exams end' }, type: 'important' },
      { date: '2026-04-30', titre: { fr: 'Deadline déclaration revenus', en: 'Tax return deadline' }, type: 'important' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────
// CONFIG TYPES
// ─────────────────────────────────────────────────────────────────
const TYPE_CFG = {
  session:   { label: { fr: 'Session',   en: 'Session'   }, color: 'var(--text-body)', bg: 'rgba(52,211,153,0.10)',  dot: '#3A3D40', icon: '📅' },
  examen:    { label: { fr: 'Examens',   en: 'Exams'     }, color: '#DC2626', bg: 'rgba(248,113,113,0.10)', dot: '#DC2626', icon: '📝' },
  conge:     { label: { fr: 'Congé',     en: 'Holiday'   }, color: 'var(--text-muted)', bg: 'rgba(96,165,250,0.10)',  dot: '#6B6F76', icon: '🏖️' },
  important: { label: { fr: 'Important', en: 'Important' }, color: 'var(--text-muted)', bg: 'rgba(251,191,36,0.10)',  dot: '#6B6F76', icon: '⚡' },
}

const FILTRES = [
  { id: 'tous',      fr: 'Tous',      en: 'All'       },
  { id: 'session',   fr: 'Sessions',  en: 'Sessions'  },
  { id: 'examen',    fr: 'Examens',   en: 'Exams'     },
  { id: 'conge',     fr: 'Congés',    en: 'Holidays'  },
  { id: 'important', fr: 'Importants',en: 'Important' },
]

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
const joursRestants = (dateStr) => {
  const d   = new Date(dateStr); d.setHours(0,0,0,0)
  const now = new Date();        now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

const formatDate = (dateStr, lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday:'short', day:'numeric', month:'long', year:'numeric' })

const formatDateCourt = (dateStr, lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day:'numeric', month:'short' })

const getMoisGroupes = (events, lang) => {
  const groupes = {}
  events.forEach(e => {
    const d   = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const lbl = d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month:'long', year:'numeric' })
    if (!groupes[key]) groupes[key] = { label: lbl, events: [] }
    groupes[key].events.push(e)
  })
  return Object.entries(groupes).sort(([a],[b]) => a.localeCompare(b))
}

// Detect university from profile
const detectUniv = (profile) => {
  if (!profile?.universite) return null
  const u = profile.universite.toLowerCase()
  if (u.includes('ottawa') || u.includes('uottawa'))   return 'uottawa'
  if (u.includes('mcgill'))                             return 'mcgill'
  if (u.includes('montréal') || u.includes('montreal') || u.includes('udem')) return 'udem'
  if (u.includes('toronto') || u.includes('utoronto')) return 'utoronto'
  if (u.includes('british columbia') || u.includes('ubc')) return 'ubc'
  if (u.includes('concordia'))                          return 'concordia'
  return null
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function CalendrierAcademique() {
  const { C, lang, user, profile } = useApp()
  const { authFetch } = useAuthFetch()

  const detectedUniv = detectUniv(profile)
  const defaultUniv  = detectedUniv || 'uottawa'
  const unknownUniv  = profile?.universite && !detectedUniv
  const [univId,     setUnivId]     = useState(defaultUniv)
  const [filtre,     setFiltre]     = useState('tous')
  const [ajouts,     setAjouts]     = useState(new Set())  // ids d'événements ajoutés
  const [ajoutEnCours, setAjoutEnCours] = useState(null)

  const univ   = CALENDRIER_DB[univId]
  const events = univ?.evenements || []

  // Filtrage + tri chronologique
  const eventsFiltres = useMemo(() =>
    events
      .filter(e => filtre === 'tous' || e.type === filtre)
      .sort((a,b) => a.date.localeCompare(b.date))
  , [events, filtre])

  // Prochain événement important (non passé)
  const prochainImportant = useMemo(() =>
    events
      .filter(e => (e.type === 'examen' || e.type === 'important') && joursRestants(e.date) >= 0)
      .sort((a,b) => a.date.localeCompare(b.date))[0]
  , [events])

  const groupes = useMemo(() => getMoisGroupes(eventsFiltres, lang), [eventsFiltres, lang])

  // ── Ajouter aux échéances ──────────────────────────────────────
  const ajouterEcheance = async (evt) => {
    if (!user || ajouts.has(evt.date + evt.titre.fr)) return
    setAjoutEnCours(evt.date + evt.titre.fr)
    try {
      const res = await authFetch('/api/echeances', {
        method: 'POST',
        body: JSON.stringify({
          type:          evt.type === 'examen' ? 'urgent' : evt.type === 'important' ? 'warning' : 'info',
          titre:         `${univ.nom} · ${evt.titre[lang] || evt.titre.fr}`,
          message:       `${lang === 'fr' ? 'Calendrier académique' : 'Academic calendar'} ${univ.annee}`,
          date_echeance: evt.date,
          date_alerte:   evt.date,
        }),
      })
      if (res.ok) setAjouts(p => new Set([...p, evt.date + evt.titre.fr]))
    } catch (e) { console.error(e) }
    finally { setAjoutEnCours(null) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)', color:'var(--text-h1)', fontFamily:'system-ui,sans-serif' }}>
      
      <main style={{ maxWidth:820, margin:'0 auto', padding:'32px 20px 80px' }}>

        {/* Header */}
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-h1)', letterSpacing:-0.5, marginBottom:4 }}>
          🗓️ {lang==='fr'?'Calendrier académique':'Academic Calendar'}
        </h1>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28, lineHeight:1.6 }}>
          {lang==='fr'
            ? 'Dates clés de session, examens et congés — ajoutables en un clic à tes échéances.'
            : 'Key session dates, exams and holidays — add them to your deadlines in one click.'}
        </p>

        {/* Sélecteur université */}
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>
            {lang==='fr'?'Ton université':'Your university'}
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {Object.entries(CALENDRIER_DB).map(([id, u]) => (
              <button key={id} onClick={() => setUnivId(id)}
                style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${univId===id?'var(--border-strong)':'var(--border)'}`, background:univId===id?'var(--bg-subtle)':'transparent', color:univId===id?'var(--text-h1)':'var(--text-muted)', fontSize:12, fontWeight:univId===id?700:400, cursor:'pointer', transition:'all 0.15s' }}>
                {u.nom.split(' ').slice(0,3).join(' ')}
                {univId===id && profile?.universite && detectUniv(profile)===id && <span style={{ marginLeft:6, fontSize:10, color:'var(--text-body)' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Université inconnue — calendrier générique Québec/Ontario */}
        {unknownUniv && (
          <div style={{ marginBottom:20, padding:'12px 16px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--text-body)', marginBottom:4 }}>
                🏫 {lang==='fr' ? `"${profile.universite}" non reconnue` : `"${profile.universite}" not recognized`}
              </p>
              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                {lang==='fr'
                  ? 'Nous affichons le calendrier générique. Sélectionne l\'université la plus proche ci-dessus ou consulte le site officiel.'
                  : 'We\'re showing the closest calendar. Select the nearest university above or check the official website.'}
              </p>
            </div>
            <a href={`https://www.google.com/search?q=${encodeURIComponent((profile.universite || '') + ' calendrier académique')}`}
              target="_blank" rel="noreferrer"
              style={{ padding:'7px 14px', background:'var(--btn-primary-bg)', borderRadius:8, color:'var(--bg-page)', fontWeight:600, fontSize:12, textDecoration:'none', flexShrink:0 }}>
              {lang==='fr' ? 'Chercher →' : 'Search →'}
            </a>
          </div>
        )}

        {/* Compte à rebours prochain événement */}
        {prochainImportant && (
          <div style={{ padding:'14px 18px', background: joursRestants(prochainImportant.date) <= 14 ? 'rgba(248,113,113,0.08)' : 'var(--bg-subtle)', border:`1px solid ${joursRestants(prochainImportant.date) <= 14 ? 'var(--color-danger)' : 'var(--border)'}`, borderRadius:14, marginBottom:24, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div style={{ width:52, height:52, borderRadius:12, background: joursRestants(prochainImportant.date) <= 14 ? 'rgba(248,113,113,0.15)' : 'var(--bg-subtle)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <p style={{ fontSize:22, fontWeight:900, color: joursRestants(prochainImportant.date) <= 14 ? 'var(--color-danger)' : 'var(--text-body)', lineHeight:1 }}>
                {Math.max(0, joursRestants(prochainImportant.date))}
              </p>
              <p style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5 }}>
                {lang==='fr'?'jours':'days'}
              </p>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-h1)', marginBottom:2 }}>
                {TYPE_CFG[prochainImportant.type]?.icon} {prochainImportant.titre[lang] || prochainImportant.titre.fr}
              </p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(prochainImportant.date, lang)} · {univ.nom}</p>
            </div>
            {user && (
              <button onClick={() => ajouterEcheance(prochainImportant)}
                disabled={ajouts.has(prochainImportant.date+prochainImportant.titre.fr) || ajoutEnCours===prochainImportant.date+prochainImportant.titre.fr}
                style={{ padding:'8px 16px', background: ajouts.has(prochainImportant.date+prochainImportant.titre.fr)?'var(--bg-subtle)':'var(--btn-primary-bg)', border:'none', borderRadius:9, color:ajouts.has(prochainImportant.date+prochainImportant.titre.fr)?'var(--text-muted)':'var(--bg-page)', fontWeight:600, fontSize:12, cursor:'pointer', flexShrink:0, opacity: ajoutEnCours===prochainImportant.date+prochainImportant.titre.fr?0.7:1 }}>
                {ajouts.has(prochainImportant.date+prochainImportant.titre.fr) ? (lang==='fr'?'✓ Ajouté':'✓ Added') : (lang==='fr'?'+ Mes échéances':'+ My deadlines')}
              </button>
            )}
          </div>
        )}

        {/* Légende + filtres */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          {FILTRES.map(f => {
            const cfg = f.id !== 'tous' ? TYPE_CFG[f.id] : null
            return (
              <button key={f.id} onClick={() => setFiltre(f.id)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, border:`1px solid ${filtre===f.id?(cfg?.color||'var(--border-strong)'):'var(--border)'}`, background:filtre===f.id?`${cfg?.color||'var(--bg-subtle)'}12`:'transparent', color:filtre===f.id?(cfg?.color||'var(--text-h1)'):'var(--text-muted)', fontSize:12, fontWeight:filtre===f.id?600:400, cursor:'pointer' }}>
                {cfg && <span style={{ width:8, height:8, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />}
                {lang==='fr'?f.fr:f.en}
              </button>
            )
          })}
        </div>

        {/* Calendrier groupé par mois */}
        {groupes.length === 0 ? (
          <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px' }}>{lang==='fr'?'Aucun événement.':'No events.'}</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {groupes.map(([moisKey, { label, events: evts }]) => (
              <div key={moisKey}>
                {/* Mois header */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-h1)', textTransform:'capitalize' }}>{label}</p>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{evts.length} {lang==='fr'?'événement(s)':'event(s)'}</span>
                </div>

                {/* Événements du mois */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {evts.map((evt, i) => {
                    const cfg     = TYPE_CFG[evt.type] || TYPE_CFG.important
                    const jours   = joursRestants(evt.date)
                    const passe   = jours < 0
                    const urgent  = !passe && jours <= 7
                    const cle     = evt.date + evt.titre.fr
                    const ajoute  = ajouts.has(cle)
                    const loading = ajoutEnCours === cle

                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: passe ? 'transparent' : cfg.bg, border:`1px solid ${passe ? 'var(--border)' : urgent ? 'var(--color-danger)' : cfg.color+'30'}`, borderRadius:12, opacity: passe ? 0.45 : 1, transition:'opacity 0.15s' }}>
                        {/* Dot + date */}
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flexShrink:0, minWidth:42, textAlign:'center' }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background: passe?'var(--text-faint)':cfg.dot }} />
                          <p style={{ fontSize:10, color: passe?'var(--text-faint)':cfg.color, fontWeight:600, lineHeight:1.2 }}>
                            {formatDateCourt(evt.date, lang)}
                          </p>
                        </div>

                        {/* Icon + titre */}
                        <span style={{ fontSize:18, flexShrink:0 }}>{cfg.icon}</span>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:14, fontWeight:600, color: passe?'var(--text-muted)':'var(--text-h1)', marginBottom:2, textDecoration: passe?'line-through':undefined }}>
                            {evt.titre[lang] || evt.titre.fr}
                          </p>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:cfg.bg, color:cfg.color, fontWeight:500, border:`1px solid ${cfg.color}25` }}>
                              {cfg.label[lang]}
                            </span>
                            {!passe && (
                              <span style={{ fontSize:11, color: urgent?'var(--color-danger)':'var(--text-muted)', fontWeight: urgent?600:400 }}>
                                {jours === 0
                                  ? (lang==='fr'?'Aujourd\'hui':'Today')
                                  : `J-${jours}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bouton + Mes échéances */}
                        {!passe && user && (
                          <button onClick={() => ajouterEcheance(evt)} disabled={ajoute || !!loading}
                            title={lang==='fr'?'Ajouter à mes échéances':'Add to my deadlines'}
                            style={{ padding:'6px 12px', background: ajoute?'var(--bg-subtle)':'var(--bg-card)', border:`1px solid ${ajoute?'var(--border-strong)':'var(--border)'}`, borderRadius:8, color: ajoute?'var(--text-body)':'var(--text-muted)', fontSize:12, fontWeight:600, cursor: ajoute||loading?'default':'pointer', whiteSpace:'nowrap', flexShrink:0, opacity: loading?0.6:1, transition:'all 0.15s' }}>
                            {loading ? '...' : ajoute ? '✓' : '+'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:28, textAlign:'center', lineHeight:1.6, fontStyle:'italic' }}>
          {lang==='fr'
            ? `Calendrier ${univ?.annee} — Dates indicatives, vérifie sur le site officiel de ${univ?.nom}.`
            : `${univ?.annee} calendar — Indicative dates, verify on ${univ?.nom}'s official website.`}
        </p>
        {!user && (
          <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', marginTop:10 }}>
            <a href="/auth/login" style={{ color:'var(--text-body)', textDecoration:'none' }}>{lang==='fr'?'Connecte-toi':'Log in'}</a>
            {' '}{lang==='fr'?'pour ajouter des dates à tes échéances.':'to add dates to your deadlines.'}
          </p>
        )}
      </main>
    </div>
  )
}
