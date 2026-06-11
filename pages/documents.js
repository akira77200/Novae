// pages/documents.js — NOVAE v5 — Coffre-fort Documents
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { useAuthFetch } from '../lib/useAuthFetch'

// ── Documents requis selon statut ────────────────────────────────
const DOCS_ETUDIANT = [
  { type: 'passeport',        nom: 'Passeport',             nom_en: 'Passport',             icone: '🛂', critique: true  },
  { type: 'visa',             nom: 'Visa étudiant',         nom_en: 'Student Visa',         icone: '📄', critique: true  },
  { type: 'permis_etudes',    nom: "Permis d'études",       nom_en: 'Study Permit',         icone: '📋', critique: true  },
  { type: 'caq',              nom: 'CAQ (Québec)',           nom_en: 'CAQ (Quebec)',          icone: '🏛️', critique: true, qc_only: true },
  { type: 'lettre_admission', nom: "Lettre d'admission",    nom_en: 'Admission Letter',     icone: '🎓', critique: true  },
  { type: 'releve_notes',     nom: 'Relevés de notes',      nom_en: 'Transcripts',          icone: '📊', critique: false },
  { type: 'assurance',        nom: 'Assurance maladie',     nom_en: 'Health Insurance',     icone: '🏥', critique: true  },
  { type: 'nas',              nom: 'NAS (Assurance Sociale)',nom_en: 'SIN (Social Ins. No.)',icone: '🪪', critique: true  },
]

const DOCS_TRAVAILLEUR = [
  { type: 'passeport',        nom: 'Passeport',             nom_en: 'Passport',             icone: '🛂', critique: true  },
  { type: 'visa',             nom: 'Visa de travail',       nom_en: 'Work Visa',            icone: '📄', critique: true  },
  { type: 'permis_etudes',    nom: 'Permis de travail',     nom_en: 'Work Permit',          icone: '📋', critique: true  },
  { type: 'nas',              nom: 'NAS (Assurance Sociale)',nom_en: 'SIN (Social Ins. No.)',icone: '🪪', critique: true  },
  { type: 'assurance',        nom: 'Assurance maladie',     nom_en: 'Health Insurance',     icone: '🏥', critique: false },
]

const DOCS_FAMILLE = [
  { type: 'passeport',        nom: 'Passeport',             nom_en: 'Passport',             icone: '🛂', critique: true  },
  { type: 'visa',             nom: 'Visa / Résidence',      nom_en: 'Visa / Residency',     icone: '📄', critique: true  },
  { type: 'nas',              nom: 'NAS (Assurance Sociale)',nom_en: 'SIN (Social Ins. No.)',icone: '🪪', critique: true  },
  { type: 'assurance',        nom: 'Assurance maladie',     nom_en: 'Health Insurance',     icone: '🏥', critique: true  },
]

const getDocsRequis = (statut, ville) => {
  const isQC = ['montreal','montréal','québec','quebec','gatineau','laval','sherbrooke','longueuil'].some(v =>
    (ville || '').toLowerCase().includes(v)
  )
  let base
  if (statut === 'travailleur') base = DOCS_TRAVAILLEUR
  else if (statut === 'famille') base = DOCS_FAMILLE
  else base = DOCS_ETUDIANT
  return base.filter(d => !d.qc_only || isQC)
}

const TYPES_OPTIONS = [
  { value: 'passeport',        label: 'Passeport',              labelEn: 'Passport'             },
  { value: 'visa',             label: 'Visa',                   labelEn: 'Visa'                 },
  { value: 'permis_etudes',    label: "Permis d'études/travail",labelEn: 'Study/Work Permit'    },
  { value: 'caq',              label: 'CAQ',                    labelEn: 'CAQ'                  },
  { value: 'lettre_admission', label: "Lettre d'admission",     labelEn: 'Admission Letter'     },
  { value: 'releve_notes',     label: 'Relevés de notes',       labelEn: 'Transcripts'          },
  { value: 'assurance',        label: 'Assurance maladie',      labelEn: 'Health Insurance'     },
  { value: 'nas',              label: 'NAS',                    labelEn: 'SIN'                  },
  { value: 'autre',            label: 'Autre',                  labelEn: 'Other'                },
]

const STATUT_CFG = {
  valide:     { label: 'Valide',       labelEn: 'Valid',      color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: '✅' },
  expire:     { label: 'Expiré',       labelEn: 'Expired',    color: '#F87171', bg: 'rgba(248,113,113,0.12)', icon: '❌' },
  manquant:   { label: 'Manquant',     labelEn: 'Missing',    color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  icon: '⚠️' },
  en_attente: { label: 'En attente',   labelEn: 'Pending',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  icon: '🕐' },
}

const jAvantExpiration = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

const FORM_VIDE = { nom: '', type: 'passeport', fichier_url: '', date_expiration: '', statut: 'valide', notes: '' }

export default function Documents() {
  const { C, lang, user, profile, loading: authLoading, sb } = useApp()
  const { authFetch } = useAuthFetch()

  const hasFetched = useRef(false)
  const [docs,     setDocs]     = useState([])
  const [ready,    setReady]    = useState(false)
  const [modal,    setModal]    = useState(null) // null | 'add' | doc_object (edit)
  const [form,     setForm]     = useState(FORM_VIDE)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [err,      setErr]      = useState('')

  // ── Charge les documents ──────────────────────────────────────
  useEffect(() => {
    if (authLoading || !sb || !user) return
    if (hasFetched.current) return
    hasFetched.current = true
    charger()
  }, [authLoading, user?.id])

  const charger = async () => {
    try {
      const res = await authFetch('/api/documents')
      const { data } = await res.json()
      setDocs(data || [])
    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  const ouvrirAjout = (prefill = null) => {
    setForm(prefill ? { ...FORM_VIDE, nom: prefill.nom, type: prefill.type } : FORM_VIDE)
    setErr('')
    setModal('add')
  }

  const ouvrirEdition = (doc) => {
    setForm({
      nom:             doc.nom,
      type:            doc.type,
      fichier_url:     doc.fichier_url || '',
      date_expiration: doc.date_expiration || '',
      statut:          doc.statut,
      notes:           doc.notes || '',
    })
    setErr('')
    setModal(doc)
  }

  const sauvegarder = async () => {
    if (!form.nom.trim()) { setErr(lang === 'fr' ? 'Nom requis' : 'Name required'); return }
    setSaving(true); setErr('')
    try {
      const isEdit = modal && modal !== 'add'
      const url    = isEdit ? `/api/documents/${modal.id}` : '/api/documents'
      const method = isEdit ? 'PATCH' : 'POST'
      const res  = await authFetch(url, { method, body: JSON.stringify(form) })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'Erreur'); return }
      if (isEdit) setDocs(p => p.map(d => d.id === modal.id ? json.data : d))
      else        setDocs(p => [...p, json.data])
      setModal(null)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const supprimer = async (id) => {
    if (!confirm(lang === 'fr' ? 'Supprimer ce document ?' : 'Delete this document?')) return
    setDeleting(id)
    try {
      await authFetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocs(p => p.filter(d => d.id !== id))
    } catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  // ── Calculs ───────────────────────────────────────────────────
  const docsRequis  = getDocsRequis(profile?.statut, profile?.ville_accueil)
  const docsParType = Object.fromEntries(docs.map(d => [d.type, d]))

  const nbValides       = docs.filter(d => d.statut === 'valide').length
  const nbExpirentBient = docs.filter(d => {
    const j = jAvantExpiration(d.date_expiration)
    return j !== null && j > 0 && j <= 30 && d.statut === 'valide'
  }).length
  const nbManquants     = docsRequis.filter(d => !docsParType[d.type] || docsParType[d.type].statut === 'manquant').length

  // Suggestions : docs critiques non encore ajoutés
  const suggestions = docsRequis.filter(d => d.critique && !docsParType[d.type])

  // ── Gate auth ─────────────────────────────────────────────────
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
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
          {lang === 'fr' ? 'Connecte-toi pour accéder à ton coffre-fort documents.' : 'Log in to access your document vault.'}
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
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 440, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
                {modal === 'add'
                  ? (lang === 'fr' ? 'Ajouter un document' : 'Add a document')
                  : (lang === 'fr' ? 'Modifier le document' : 'Edit document')}
              </p>
              <button onClick={() => setModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>

              {/* Nom */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? 'Nom du document' : 'Document name'}
              </label>
              <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder={lang === 'fr' ? 'ex. Passeport français' : 'e.g. French passport'}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

              {/* Type */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }}>
                {TYPES_OPTIONS.map(o => <option key={o.value} value={o.value}>{lang === 'fr' ? o.label : (o.labelEn || o.label)}</option>)}
              </select>

              {/* Statut */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>{lang === 'fr' ? 'Statut' : 'Status'}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {Object.entries(STATUT_CFG).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(p => ({ ...p, statut: k }))}
                    style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${form.statut === k ? v.color + '60' : C.border}`, background: form.statut === k ? v.bg : 'transparent', color: form.statut === k ? v.color : C.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {v.icon} {lang === 'fr' ? v.label : v.labelEn}
                  </button>
                ))}
              </div>

              {/* Date expiration */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? "Date d'expiration" : 'Expiration date'}
              </label>
              <input type="date" value={form.date_expiration} onChange={e => setForm(p => ({ ...p, date_expiration: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }} />

              {/* Lien fichier */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {lang === 'fr' ? 'Lien vers le fichier (optionnel)' : 'File link (optional)'}
              </label>
              <input value={form.fichier_url} onChange={e => setForm(p => ({ ...p, fichier_url: e.target.value }))}
                placeholder="https://drive.google.com/..."
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

              {/* Notes */}
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder={lang === 'fr' ? 'Infos supplémentaires...' : 'Additional info...'}
                rows={2}
                style={{ width: '100%', padding: '10px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, marginBottom: 18, boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'system-ui,sans-serif' }} />

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
              📁 {lang === 'fr' ? 'Mes Documents' : 'My Documents'}
            </h1>
            <p style={{ fontSize: 14, color: C.muted }}>
              {docs.length} {lang === 'fr' ? `document${docs.length > 1 ? 's' : ''} enregistré${docs.length > 1 ? 's' : ''}` : `document${docs.length > 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button onClick={() => ouvrirAjout()} style={{ padding: '10px 20px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            + {lang === 'fr' ? 'Ajouter' : 'Add'}
          </button>
        </div>

        {/* ── BARRE DE STATUT ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { icon: '✅', val: nbValides,       label: lang === 'fr' ? 'valides' : 'valid',       color: C.success, bg: 'rgba(52,211,153,0.10)'   },
            { icon: '⚠️', val: nbExpirentBient, label: lang === 'fr' ? 'expirent bientôt' : 'expiring soon', color: C.warning, bg: 'rgba(251,191,36,0.10)'  },
            { icon: '❌', val: nbManquants,     label: lang === 'fr' ? 'manquants' : 'missing',    color: C.error,   bg: 'rgba(248,113,113,0.10)'  },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: s.bg, border: `1px solid ${s.color}25`, borderRadius: 10 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── SUGGESTIONS DOCUMENTS MANQUANTS ── */}
        {ready && suggestions.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              {lang === 'fr' ? '➕ Documents à ajouter' : '➕ Documents to add'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map(d => (
                <button key={d.type}
                  onClick={() => ouvrirAjout({ nom: lang === 'fr' ? d.nom : (d.nom_en || d.nom), type: d.type })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: `${C.accent}10`, border: `1px dashed ${C.accent}40`, borderRadius: 20, color: C.accent2, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  <span>{d.icone}</span>
                  + {lang === 'fr' ? d.nom : (d.nom_en || d.nom)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS REQUIS ── */}
        {!ready ? (
          <p style={{ textAlign: 'center', color: C.muted, padding: '40px', fontSize: 14 }}>
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
              {lang === 'fr' ? 'Documents requis' : 'Required documents'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {docsRequis.map(requis => {
                const doc      = docsParType[requis.type]
                const statut   = doc?.statut || 'manquant'
                const cfg      = STATUT_CFG[statut] || STATUT_CFG.manquant
                const jExp     = doc ? jAvantExpiration(doc.date_expiration) : null
                const isExpired   = jExp !== null && jExp <= 0
                const expireSoon  = jExp !== null && jExp > 0 && jExp <= 30
                const expireWarn  = jExp !== null && jExp > 30 && jExp <= 60
                const borderColor = isExpired ? C.error + '50' : expireSoon ? C.warning + '50' : expireWarn ? C.warning + '25' : C.border

                return (
                  <div key={requis.type} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: C.surface, border: `1px solid ${borderColor}`, borderRadius: 12, transition: 'border-color 0.15s' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{requis.icone}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{lang === 'fr' ? (doc?.nom || requis.nom) : (doc?.nom || requis.nom_en || requis.nom)}</p>
                        {requis.critique && !doc && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(248,113,113,0.12)', color: C.error, letterSpacing: 0.4 }}>
                            {lang === 'fr' ? 'REQUIS' : 'REQUIRED'}
                          </span>
                        )}
                        {isExpired && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(248,113,113,0.15)', color: C.error, letterSpacing: 0.4 }}>
                            ❌ {lang === 'fr' ? 'EXPIRÉ' : 'EXPIRED'}
                          </span>
                        )}
                        {expireSoon && !isExpired && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: C.warning, letterSpacing: 0.4 }}>
                            ⚠️ {lang === 'fr' ? `EXPIRE DANS ${jExp}J` : `EXPIRES IN ${jExp}D`}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 500 }}>
                          {cfg.icon} {lang === 'fr' ? cfg.label : cfg.labelEn}
                        </span>
                        {doc?.date_expiration && (
                          <span style={{ fontSize: 12, color: isExpired ? C.error : expireSoon ? C.warning : C.muted }}>
                            {lang === 'fr' ? 'Expire le' : 'Expires'} {new Date(doc.date_expiration).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}
                          </span>
                        )}
                        {doc?.notes && <span style={{ fontSize: 12, color: C.muted }}>· {doc.notes}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {doc?.fichier_url && (
                        <a href={doc.fichier_url} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 12px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 8, color: C.accent2, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          ↗ {lang === 'fr' ? 'Voir' : 'View'}
                        </a>
                      )}
                      {doc ? (
                        <>
                          <button onClick={() => ouvrirEdition(doc)} style={{ padding: '6px 12px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 8, color: C.accent2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            ✏️
                          </button>
                          <button onClick={() => supprimer(doc.id)} disabled={deleting === doc.id}
                            style={{ padding: '6px 10px', background: `${C.error}10`, border: `1px solid ${C.error}25`, borderRadius: 8, color: C.error, fontSize: 12, cursor: deleting === doc.id ? 'not-allowed' : 'pointer', opacity: deleting === doc.id ? 0.5 : 1 }}>
                            🗑
                          </button>
                        </>
                      ) : (
                        <button onClick={() => ouvrirAjout({ nom: requis.nom, type: requis.type })}
                          style={{ padding: '6px 14px', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          + {lang === 'fr' ? 'Ajouter' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── AUTRES DOCUMENTS ── */}
            {docs.filter(d => !docsRequis.some(r => r.type === d.type)).length > 0 && (
              <>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                  {lang === 'fr' ? 'Autres documents' : 'Other documents'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {docs.filter(d => !docsRequis.some(r => r.type === d.type)).map(doc => {
                    const cfg  = STATUT_CFG[doc.statut] || STATUT_CFG.valide
                    const jExp = jAvantExpiration(doc.date_expiration)
                    const alertExp = jExp !== null && jExp > 0 && jExp <= 60
                    return (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: C.surface, border: `1px solid ${alertExp ? C.warning + '40' : C.border}`, borderRadius: 12 }}>
                        <span style={{ fontSize: 22 }}>📄</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{doc.nom}</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 500 }}>
                              {cfg.icon} {lang === 'fr' ? cfg.label : cfg.labelEn}
                            </span>
                            {doc.date_expiration && (
                              <span style={{ fontSize: 12, color: alertExp ? C.warning : C.muted }}>
                                {lang === 'fr' ? 'Expire le' : 'Expires'} {new Date(doc.date_expiration).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {doc.fichier_url && (
                            <a href={doc.fichier_url} target="_blank" rel="noreferrer"
                              style={{ padding: '6px 12px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 8, color: C.accent2, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                          )}
                          <button onClick={() => ouvrirEdition(doc)} style={{ padding: '6px 12px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 8, color: C.accent2, fontSize: 12, cursor: 'pointer' }}>✏️</button>
                          <button onClick={() => supprimer(doc.id)} disabled={deleting === doc.id}
                            style={{ padding: '6px 10px', background: `${C.error}10`, border: `1px solid ${C.error}25`, borderRadius: 8, color: C.error, fontSize: 12, cursor: deleting === doc.id ? 'not-allowed' : 'pointer', opacity: deleting === doc.id ? 0.5 : 1 }}>🗑</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── VIDE total ── */}
            {docs.length === 0 && docsRequis.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                <p style={{ fontSize: 40, marginBottom: 14 }}>📁</p>
                <p style={{ fontWeight: 600, fontSize: 16, color: C.text, marginBottom: 8 }}>
                  {lang === 'fr' ? 'Aucun document' : 'No documents yet'}
                </p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                  {lang === 'fr' ? 'Complète ton profil pour voir les documents requis.' : 'Complete your profile to see required documents.'}
                </p>
                <a href="/profile_1" style={{ padding: '9px 20px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  {lang === 'fr' ? 'Compléter mon profil →' : 'Complete profile →'}
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
