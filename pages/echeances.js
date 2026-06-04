// pages/echeances.js — NOVAE v5 — Calendrier des Échéances
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ── Urgence selon jours restants ─────────────────────────────────
const getUrgence = (jours) => {
  if (jours < 0)   return { label: 'Passée',   labelEn: 'Past',    color: '#6B7280', bg: 'rgba(107,114,128,0.10)', dot: '#6B7280' }
  if (jours === 0) return { label: "Aujourd'hui", labelEn: 'Today', color: '#F87171', bg: 'rgba(248,113,113,0.15)', dot: '#F87171' }
  if (jours <= 7)  return { label: 'Urgent',    labelEn: 'Urgent',  color: '#F87171', bg: 'rgba(248,113,113,0.10)', dot: '#F87171' }
  if (jours <= 30) return { label: 'Bientôt',   labelEn: 'Soon',    color: '#FBBF24', bg: 'rgba(251,191,36,0.10)',  dot: '#FBBF24' }
  return             { label: 'À venir',         labelEn: 'Upcoming',color: '#34D399', bg: 'rgba(52,211,153,0.10)',  dot: '#34D399' }
}

const joursRestants = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d - now) / 86400000)
}

const formatDate = (dateStr, lang) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Échéances auto générées depuis le profil ─────────────────────
const genererEcheancesAuto = (profile, lang) => {
  if (!profile?.date_arrivee) return []
  const arrivee = new Date(profile.date_arrivee)
  if (isNaN(arrivee.getTime())) return []
  const echeances = []
  const villesQC  = ['montréal','montreal','québec','quebec','gatineau','laval','sherbrooke','longueuil']
  const estQC     = villesQC.some(v => (profile.ville_accueil || '').toLowerCase().includes(v))
  const now       = new Date()
  const annee     = now.getFullYear()

  // RAMQ — 3 mois après arrivée (QC seulement)
  if (estQC) {
    const ramq = new Date(arrivee.getTime() + 90 * 86400000)
    echeances.push({
      id: '__ramq',
      type: 'urgent',
      titre:   lang === 'fr' ? 'Inscription RAMQ' : 'RAMQ Registration',
      message: lang === 'fr' ? "Délai de 3 mois après l'arrivée. Ne pas rater cette fenêtre." : '3-month window after arrival. Do not miss it.',
      lien: 'https://www.ramq.gouv.qc.ca',
      date_echeance: ramq.toISOString().split('T')[0],
      auto: true,
    })
  }

  // Impôts — 30 avril chaque année
  const impots = new Date(`${arrivee.getFullYear() < now.getFullYear() ? annee : annee + 1}-04-30`)
  echeances.push({
    id: '__impots',
    type: 'warning',
    titre:   lang === 'fr' ? 'Déclaration de revenus' : 'Tax Return',
    message: lang === 'fr' ? 'Date limite : 30 avril. Même sans revenus, déclare pour tes crédits.' : 'Deadline: April 30. File even without income to get your credits.',
    lien: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/faire-impots.html',
    date_echeance: impots.toISOString().split('T')[0],
    auto: true,
  })

  // Renouvellement permis d'études — 90j avant expiration (1 an + 90j après arrivée par défaut)
  if (profile.statut === 'etudiant') {
    const expPermis = new Date(arrivee.getTime() + 365 * 86400000)
    const alertePermis = new Date(expPermis.getTime() - 90 * 86400000)
    if (alertePermis > now) {
      echeances.push({
        id: '__permis',
        type: 'warning',
        titre:   lang === 'fr' ? "Renouvellement permis d'études" : 'Study Permit Renewal',
        message: lang === 'fr' ? 'Commence la demande de renouvellement 90 jours avant expiration.' : 'Start renewal application 90 days before expiry.',
        lien: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-etudes/prolonger.html',
        date_echeance: alertePermis.toISOString().split('T')[0],
        auto: true,
      })
    }
  }

  // NAS — si pas encore 30j après arrivée
  const nasDate = new Date(arrivee.getTime() + 30 * 86400000)
  if (nasDate > now) {
    echeances.push({
      id: '__nas',
      type: 'info',
      titre:   lang === 'fr' ? 'Obtenir ton NAS' : 'Get your SIN',
      message: lang === 'fr' ? 'Numéro d\'Assurance Sociale — nécessaire pour travailler et ouvrir un compte.' : 'Social Insurance Number — needed to work and open a bank account.',
      lien: 'https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html',
      date_echeance: nasDate.toISOString().split('T')[0],
      auto: true,
    })
  }

  return echeances
}

const TYPE_ICONS = { urgent: '🔴', warning: '⚠️', info: 'ℹ️', success: '✅' }

const FORM_VIDE = { titre: '', message: '', lien: '', date_echeance: '', type: 'info' }

const FILTRES = [
  { id: 'tout',     fr: 'Toutes',   en: 'All'      },
  { id: 'actives',  fr: 'À venir',  en: 'Upcoming' },
  { id: 'urgent',   fr: 'Urgentes', en: 'Urgent'   },
  { id: 'passees',  fr: 'Passées',  en: 'Past'     },
]

export default function Echeances() {
  const { C, lang, user, profile, loading: authLoading, sb } = useApp()

  const hasFetched = useRef(false)
  const [echeances,  setEcheances]  = useState([])
  const [ready,      setReady]      = useState(false)
  const [filtre,     setFiltre]     = useState('actives')
  const [modal,      setModal]      = useState(null) // null | 'add' | item (edit)
  const [form,       setForm]       = useState(FORM_VIDE)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(null)
  const [err,        setErr]        = useState('')

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
      const res   = await fetch('/api/echeances', { headers: { Authorization: `Bearer ${token}` } })
      const { data } = await res.json()
      setEcheances(data || [])
    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  const sauvegarder = async () => {
    if (!form.titre.trim())        { setErr(lang === 'fr' ? 'Titre requis' : 'Title required'); return }
    if (!form.date_echeance)       { setErr(lang === 'fr' ? 'Date requise' : 'Date required');  return }
    setSaving(true); setErr('')
    try {
      const token  = await getToken()
      const isEdit = modal && modal !== 'add'
      const url    = isEdit ? `/api/echeances/${modal.id}` : '/api/echeances'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'Erreur'); return }
      if (isEdit) setEcheances(p => p.map(e => e.id === modal.id ? json.data : e))
      else        setEcheances(p => [...p, json.data].sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance)))
      setModal(null)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const toggleComplete = async (item) => {
    if (item.auto) return // les auto ne sont pas persistées
    try {
      const token = await getToken()
      const res   = await fetch(`/api/echeances/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ complete: !item.complete }),
      })
      const json = await res.json()
      if (res.ok) setEcheances(p => p.map(e => e.id === item.id ? json.data : e))
    } catch (e) { console.error(e) }
  }

  const supprimer = async (id) => {
    if (!confirm(lang === 'fr' ? 'Supprimer cette échéance ?' : 'Delete this deadline?')) return
    setDeleting(id)
    try {
      const token = await getToken()
      await fetch(`/api/echeances/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setEcheances(p => p.filter(e => e.id !== id))
    } catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  const ouvrirEdition = (item) => {
    setForm({
      titre:         item.titre,
      message:       item.message || '',
      lien:          item.lien    || '',
      date_echeance: item.date_echeance,
      type:          item.type    || 'info',
    })
    setErr('')
    setModal(item)
  }

  // ── Fusion auto + BDD ──────────────────────────────────────────
  const autoItems = profile ? genererEcheancesAuto(profile, lang) : []
  const autoIds   = new Set(autoItems.map(a => a.id))

  // Toutes les échéances triées
  const toutes = [...autoItems, ...echeances].sort(
    (a, b) => new Date(a.date_echeance) - new Date(b.date_echeance)
  )

  const filtrees = toutes.filter(e => {
    const j = joursRestants(e.date_echeance)
    if (filtre === 'actives') return j !== null && j >= 0 && !e.complete
    if (filtre === 'urgent')  return j !== null && j >= 0 && j <= 7 && !e.complete
    if (filtre === 'passees') return (j !== null && j < 0) || e.complete
    return true
  })

  // Stats
  const nbUrgent  = toutes.filter(e => { const j = joursRestants(e.date_echeance); return j !== null && j >= 0 && j <= 7 && !e.complete }).length
  const nbActives = toutes.filter(e => { const j = joursRestants(e.date_echeance); return j !== null && j >= 0 && !e.complete }).length

  // ── Gate auth ──────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <p style={{ color: C.muted, fontSize: 14 }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
        <p style={{ fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 8 }}>
          {lang === 'fr' ? 'Connexion requise' : 'Login required'}
        </p>
        <a href="/auth/login" style={{ padding: '10px 24px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          {lang === 'fr' ? 'Se connecter →' : 'Log in →'}
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />

      {/* ── Modal Ajout / Édition ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModal(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 420, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
                {modal === 'add'
                  ? (lang === 'fr' ? 'Nouvelle échéance' : 'New deadline')
                  : (lang === 'fr' ? "Modifier l'échéance" : 'Edit deadline')}
              </p>
              <button onClick={() => setModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>

              {/* Titre */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? 'Titre' : 'Title'}
              </label>
              <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                placeholder={lang === 'fr' ? 'ex. Renouvellement visa' : 'e.g. Visa renewal'}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

              {/* Type */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
                {lang === 'fr' ? 'Priorité' : 'Priority'}
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {[
                  { val: 'urgent',  fr: '🔴 Urgent',   en: '🔴 Urgent',   color: '#F87171' },
                  { val: 'warning', fr: '⚠️ Important', en: '⚠️ Important',color: '#FBBF24' },
                  { val: 'info',    fr: 'ℹ️ Normal',    en: 'ℹ️ Normal',   color: '#60A5FA' },
                ].map(o => (
                  <button key={o.val} onClick={() => setForm(p => ({ ...p, type: o.val }))}
                    style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${form.type === o.val ? o.color + '60' : C.border}`, background: form.type === o.val ? o.color + '15' : 'transparent', color: form.type === o.val ? o.color : C.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {lang === 'fr' ? o.fr : o.en}
                  </button>
                ))}
              </div>

              {/* Date */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? "Date d'échéance" : 'Deadline date'}
              </label>
              <input type="date" value={form.date_echeance} onChange={e => setForm(p => ({ ...p, date_echeance: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }} />

              {/* Note */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? 'Note (optionnelle)' : 'Note (optional)'}
              </label>
              <input value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder={lang === 'fr' ? 'Infos supplémentaires...' : 'Additional info...'}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

              {/* Lien */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? 'Lien (optionnel)' : 'Link (optional)'}
              </label>
              <input value={form.lien} onChange={e => setForm(p => ({ ...p, lien: e.target.value }))}
                placeholder="https://..."
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 20, boxSizing: 'border-box', outline: 'none' }} />

              {err && <p style={{ fontSize: 13, color: C.error, marginBottom: 12 }}>{err}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal(null)} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button onClick={sauvegarder} disabled={saving}
                  style={{ flex: 2, padding: '11px', background: saving ? C.border : C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? '...' : (lang === 'fr' ? 'Sauvegarder' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
              📅 {lang === 'fr' ? 'Mes Échéances' : 'My Deadlines'}
            </h1>
            <p style={{ fontSize: 14, color: C.muted }}>
              {nbActives} {lang === 'fr' ? `échéance${nbActives > 1 ? 's' : ''} à venir` : `upcoming deadline${nbActives > 1 ? 's' : ''}`}
              {nbUrgent > 0 && (
                <span style={{ color: C.error, fontWeight: 600 }}>
                  {' '}· {nbUrgent} {lang === 'fr' ? 'urgente' : 'urgent'}{nbUrgent > 1 ? 's' : ''} 🔴
                </span>
              )}
            </p>
          </div>
          <button onClick={() => { setForm(FORM_VIDE); setErr(''); setModal('add') }}
            style={{ padding: '10px 20px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            + {lang === 'fr' ? 'Ajouter' : 'Add'}
          </button>
        </div>

        {/* ── FILTRES ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {FILTRES.map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: filtre === f.id ? C.accent : 'transparent', color: filtre === f.id ? '#fff' : C.muted }}>
              {lang === 'fr' ? f.fr : f.en}
            </button>
          ))}
        </div>

        {/* ── LISTE ── */}
        {!ready ? (
          <p style={{ textAlign: 'center', color: C.muted, padding: '40px', fontSize: 14 }}>
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        ) : filtrees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <p style={{ fontSize: 36, marginBottom: 14 }}>📅</p>
            <p style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 8 }}>
              {lang === 'fr' ? 'Aucune échéance' : 'No deadlines'}
            </p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {filtre === 'passees'
                ? (lang === 'fr' ? 'Aucune échéance passée.' : 'No past deadlines.')
                : (lang === 'fr' ? 'Ajoute une date importante à ne pas manquer.' : 'Add an important date not to miss.')}
            </p>
            {filtre !== 'passees' && (
              <button onClick={() => { setForm(FORM_VIDE); setErr(''); setModal('add') }}
                style={{ padding: '9px 20px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                + {lang === 'fr' ? 'Ajouter une échéance' : 'Add a deadline'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtrees.map(item => {
              const jours   = joursRestants(item.date_echeance)
              const urgence = getUrgence(jours ?? -1)
              const isAuto  = !!item.auto
              const done    = !!item.complete

              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 18px',
                  background: done ? C.surface : urgence.bg,
                  border: `1px solid ${done ? C.border : urgence.dot + '30'}`,
                  borderRadius: 14,
                  opacity: done ? 0.55 : 1,
                  transition: 'opacity 0.15s',
                }}>
                  {/* Dot urgence */}
                  <div style={{ marginTop: 3, width: 10, height: 10, borderRadius: '50%', background: done ? C.muted : urgence.dot, flexShrink: 0 }} />

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, textDecoration: done ? 'line-through' : 'none' }}>
                        {TYPE_ICONS[item.type] || 'ℹ️'} {item.titre}
                      </p>
                      {isAuto && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${C.accent}15`, color: C.accent2, letterSpacing: 0.4 }}>AUTO</span>
                      )}
                    </div>

                    {/* Date + jours restants */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: item.message ? 8 : 0 }}>
                      <span style={{ fontSize: 13, color: done ? C.muted : urgence.dot, fontWeight: 600 }}>
                        {formatDate(item.date_echeance, lang)}
                      </span>
                      {jours !== null && !done && (
                        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: urgence.bg, color: urgence.dot, fontWeight: 600, border: `1px solid ${urgence.dot}25` }}>
                          {jours === 0
                            ? (lang === 'fr' ? "Aujourd'hui" : 'Today')
                            : jours > 0
                              ? `J-${jours}`
                              : (lang === 'fr' ? `Il y a ${Math.abs(jours)}j` : `${Math.abs(jours)}d ago`)}
                        </span>
                      )}
                    </div>

                    {item.message && (
                      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: item.lien ? 8 : 0 }}>{item.message}</p>
                    )}
                    {item.lien && (
                      <a href={item.lien} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>
                        {lang === 'fr' ? 'Agir →' : 'Take action →'}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    {!isAuto && (
                      <button onClick={() => toggleComplete(item)}
                        title={done ? (lang === 'fr' ? 'Marquer à faire' : 'Mark as pending') : (lang === 'fr' ? 'Marquer fait' : 'Mark done')}
                        style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${done ? C.success : C.border}`, background: done ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: done ? C.bg : C.muted, fontSize: 13, fontWeight: 800 }}>
                        {done ? '✓' : '○'}
                      </button>
                    )}
                    {!isAuto && (
                      <>
                        <button onClick={() => ouvrirEdition(item)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.muted, fontSize: 13 }}>
                          ✏️
                        </button>
                        <button onClick={() => supprimer(item.id)} disabled={deleting === item.id}
                          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.error}25`, background: `${C.error}10`, cursor: deleting === item.id ? 'not-allowed' : 'pointer', color: C.error, fontSize: 13, opacity: deleting === item.id ? 0.5 : 1 }}>
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── INFO auto ── */}
        {autoItems.length > 0 && (
          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            🤖 {lang === 'fr'
              ? 'Les échéances "AUTO" sont calculées depuis ton profil et ne sont pas modifiables.'
              : '"AUTO" deadlines are calculated from your profile and cannot be edited.'}
          </p>
        )}
      </main>
    </div>
  )
}
