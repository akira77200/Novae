// pages/cv.js — NOVAE v5 — Créateur de CV canadien
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ── Helpers ───────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)

const EXP_VIDE  = () => ({ id: uid(), poste: '', entreprise: '', debut: '', fin: '', actuel: false, description: '' })
const FORM_VIDE = () => ({ poste: '', entreprise: '', debut: '', fin: '', actuel: false, description: '' })

const COMPETENCES_SUGGESTIONS = [
  'Microsoft Office','Google Workspace','Gestion de projet','Service client',
  'Analyse de données','Communication','Leadership','Travail en équipe',
  'Résolution de problèmes','Excel','Python','JavaScript','Comptabilité',
  'Marketing digital','Rédaction','Présentation','Bilinguisme FR/EN',
]

const LANGUES_OPTIONS = ['Français','English','Arabe','Espagnol','Portugais','Wolof','Mandarin','Hindi']

// ── Composant input réutilisable ──────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', rows, style: extra }) {
  const { C } = useApp()
  const base = {
    width: '100%', padding: '9px 12px', background: C.bg2,
    border: `1px solid ${C.border}`, borderRadius: 9,
    color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'system-ui,sans-serif', ...extra,
  }
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 5 }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} />
      }
    </div>
  )
}

// ── Vue imprimable du CV ──────────────────────────────────────────
function CVPreview({ data, lang }) {
  const { nom, email, telephone, ville, linkedin, poste_cible, resume, experiences, formation, competences, langues, ai } = data
  const bullets = ai?.bullets || []
  const competencesFin = ai?.competences_triees?.length ? ai.competences_triees : competences

  return (
    <div id="cv-print" style={{ background: '#fff', color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", serif', padding: '40px 48px', maxWidth: 794, margin: '0 auto', minHeight: 1123, boxSizing: 'border-box', fontSize: 12, lineHeight: 1.5 }}>

      {/* En-tête */}
      <div style={{ borderBottom: '2.5px solid #2D6A4F', paddingBottom: 16, marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: -0.5, fontFamily: 'system-ui, sans-serif' }}>{nom || 'Votre Nom'}</h1>
        {poste_cible && <p style={{ fontSize: 14, color: '#2D6A4F', fontWeight: 600, marginTop: 3, fontFamily: 'system-ui, sans-serif' }}>{poste_cible}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginTop: 8 }}>
          {email     && <span style={{ fontSize: 11, color: '#444' }}>✉ {email}</span>}
          {telephone && <span style={{ fontSize: 11, color: '#444' }}>📞 {telephone}</span>}
          {ville     && <span style={{ fontSize: 11, color: '#444' }}>📍 {ville}</span>}
          {linkedin  && <span style={{ fontSize: 11, color: '#2D6A4F' }}>🔗 {linkedin}</span>}
        </div>
      </div>

      {/* Résumé professionnel */}
      {(resume || ai?.resume) && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7, fontFamily: 'system-ui, sans-serif' }}>
            {lang === 'fr' ? 'Résumé professionnel' : 'Professional Summary'}
          </h2>
          <p style={{ fontSize: 12, color: '#333', lineHeight: 1.65 }}>{ai?.resume || resume}</p>
        </div>
      )}

      {/* Expériences */}
      {experiences?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, fontFamily: 'system-ui, sans-serif' }}>
            {lang === 'fr' ? 'Expériences professionnelles' : 'Work Experience'}
          </h2>
          {experiences.map((e, i) => {
            const bul = bullets.find(b => b.index === i)?.points || []
            return (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', fontFamily: 'system-ui, sans-serif' }}>{e.poste || '—'}</p>
                  <p style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>{e.debut}{(e.debut || e.fin) ? ' – ' : ''}{e.actuel ? (lang === 'fr' ? 'Présent' : 'Present') : e.fin}</p>
                </div>
                <p style={{ fontSize: 12, color: '#2D6A4F', fontWeight: 600, marginBottom: bul.length ? 5 : 0 }}>{e.entreprise}</p>
                {bul.length > 0
                  ? <ul style={{ paddingLeft: 18, margin: 0 }}>{bul.map((b, j) => <li key={j} style={{ fontSize: 12, color: '#333', lineHeight: 1.6, marginBottom: 2 }}>{b}</li>)}</ul>
                  : e.description && <p style={{ fontSize: 12, color: '#444', lineHeight: 1.6, paddingLeft: 4 }}>{e.description}</p>
                }
              </div>
            )
          })}
        </div>
      )}

      {/* Formation */}
      {formation && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7, fontFamily: 'system-ui, sans-serif' }}>
            {lang === 'fr' ? 'Formation' : 'Education'}
          </h2>
          <p style={{ fontSize: 12, color: '#333', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{formation}</p>
        </div>
      )}

      {/* Compétences */}
      {competencesFin?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontFamily: 'system-ui, sans-serif' }}>
            {lang === 'fr' ? 'Compétences' : 'Skills'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {competencesFin.map((c, i) => (
              <span key={i} style={{ fontSize: 11, color: '#333' }}>{'• '}{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Langues */}
      {langues?.length > 0 && (
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7, fontFamily: 'system-ui, sans-serif' }}>
            {lang === 'fr' ? 'Langues' : 'Languages'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {langues.map((l, i) => <span key={i} style={{ fontSize: 12, color: '#333' }}>{'• '}{l}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function CV() {
  const { C, lang, profile, loading: authLoading, mounted } = useApp()

  const [etape,        setEtape]       = useState(1)         // 1=infos 2=expériences 3=formation 4=preview
  const [generating,   setGenerating]  = useState(false)
  const [aiData,       setAiData]      = useState(null)
  const [aiErr,        setAiErr]       = useState('')

  // Formulaire principal
  const [nom,          setNom]         = useState('')
  const [email,        setEmail]       = useState('')
  const [telephone,    setTelephone]   = useState('')
  const [ville,        setVille]       = useState('')
  const [linkedin,     setLinkedin]    = useState('')
  const [poste,        setPoste]       = useState('')
  const [resume,       setResume]      = useState('')
  const [formation,    setFormation]   = useState('')
  const [competences,  setCompetences] = useState([])
  const [compInput,    setCompInput]   = useState('')
  const [langues,      setLangues]     = useState([])

  // Expériences
  const [experiences,  setExperiences] = useState([EXP_VIDE()])
  const [expModal,     setExpModal]    = useState(null) // null | 'new' | exp_id (edit)
  const [expForm,      setExpForm]     = useState(FORM_VIDE())

  // Pré-remplir depuis le profil Novae
  useEffect(() => {
    if (!profile) return
    if (profile.full_name) setNom(profile.full_name)
    if (profile.email)     setEmail(profile.email)
    if (profile.ville_accueil) setVille(profile.ville_accueil)
    if (profile.universite && profile.programme)
      setFormation(`${profile.programme}\n${profile.universite}`)
    else if (profile.universite)
      setFormation(profile.universite)
  }, [profile])

  // Gestion compétences
  const ajouterComp = (c) => {
    const val = (c || compInput).trim()
    if (!val || competences.includes(val)) return
    setCompetences(p => [...p, val])
    setCompInput('')
  }
  const retirerComp = (c) => setCompetences(p => p.filter(x => x !== c))

  // Gestion langues
  const toggleLangue = (l) => setLangues(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l])

  // Gestion expériences
  const ouvrirNouvelleExp = () => { setExpForm(FORM_VIDE()); setExpModal('new') }
  const ouvrirEditionExp  = (e) => { setExpForm({ ...e }); setExpModal(e.id) }
  const sauvegarderExp    = () => {
    if (!expForm.poste.trim() && !expForm.entreprise.trim()) { setExpModal(null); return }
    if (expModal === 'new') {
      setExperiences(p => [...p, { ...expForm, id: uid() }])
    } else {
      setExperiences(p => p.map(e => e.id === expModal ? { ...expForm, id: expModal } : e))
    }
    setExpModal(null)
  }
  const supprimerExp = (id) => setExperiences(p => p.filter(e => e.id !== id))

  // ── Génération IA ────────────────────────────────────────────
  const generer = async () => {
    setGenerating(true); setAiErr('')
    try {
      const res = await fetch('/api/cv/generer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil:       { nom, email, ville, statut: profile?.statut },
          poste_cible:  poste,
          experiences:  experiences.filter(e => e.poste || e.entreprise),
          formation,
          competences,
          langues,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setAiErr(json.error || 'Erreur'); return }
      setAiData(json.data)
      setEtape(4)
      // Flag pour le score dashboard
      try { localStorage.setItem('novae_cv_nom', nom || 'cv') } catch {}
    } catch (e) { setAiErr(e.message) }
    finally { setGenerating(false) }
  }

  // ── Export PDF via print ──────────────────────────────────────
  const imprimer = () => window.print()

  // ── Données consolidées pour le preview ──────────────────────
  const cvData = {
    nom, email, telephone, ville, linkedin, poste_cible: poste,
    resume, experiences: experiences.filter(e => e.poste || e.entreprise),
    formation, competences, langues, ai: aiData,
  }

  if (!mounted || authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <p style={{ color: C.muted, fontSize: 14 }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
    </div>
  )

  const ETAPES = [
    { id: 1, fr: 'Infos',        en: 'Info'       },
    { id: 2, fr: 'Expériences',  en: 'Experience' },
    { id: 3, fr: 'Formation',    en: 'Education'  },
    { id: 4, fr: 'Aperçu',       en: 'Preview'    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />

      {/* ── Modal expérience ── */}
      {expModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setExpModal(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 460, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
                {expModal === 'new' ? (lang === 'fr' ? 'Nouvelle expérience' : 'New experience') : (lang === 'fr' ? 'Modifier l\'expérience' : 'Edit experience')}
              </p>
              <button onClick={() => setExpModal(null)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <Field label={lang === 'fr' ? 'Poste occupé' : 'Job title'} value={expForm.poste} onChange={e => setExpForm(p => ({ ...p, poste: e.target.value }))} placeholder="ex. Développeur web" />
                <Field label={lang === 'fr' ? 'Entreprise / Organisation' : 'Company'} value={expForm.entreprise} onChange={e => setExpForm(p => ({ ...p, entreprise: e.target.value }))} placeholder="ex. Desjardins" />
                <Field label={lang === 'fr' ? 'Début (mois/année)' : 'Start date'} value={expForm.debut} onChange={e => setExpForm(p => ({ ...p, debut: e.target.value }))} placeholder="Janv. 2022" />
                <div>
                  <Field label={lang === 'fr' ? 'Fin' : 'End date'} value={expForm.fin} onChange={e => setExpForm(p => ({ ...p, fin: e.target.value }))} placeholder="Déc. 2023" extra={{ opacity: expForm.actuel ? 0.4 : 1 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: C.muted, marginTop: -8, marginBottom: 14, cursor: 'pointer' }}>
                    <input type="checkbox" checked={expForm.actuel} onChange={e => setExpForm(p => ({ ...p, actuel: e.target.checked, fin: '' }))} />
                    {lang === 'fr' ? 'Poste actuel' : 'Current role'}
                  </label>
                </div>
              </div>
              <Field label={lang === 'fr' ? 'Description (l\'IA améliorera tes bullet points)' : 'Description (AI will enhance your bullets)'} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder={lang === 'fr' ? "Décris tes responsabilités et réalisations..." : "Describe your responsibilities and achievements..."} rows={3} />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setExpModal(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button onClick={sauvegarderExp} style={{ flex: 2, padding: '10px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Ajouter' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Print CSS ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cv-print-wrapper { display: block !important; position: fixed; inset: 0; background: #fff; }
          #cv-print { box-shadow: none !important; margin: 0 !important; padding: 32px 40px !important; }
        }
        #cv-print-wrapper { display: none; }
        @media print { #cv-print-wrapper { display: block; } }
      `}</style>

      {/* Wrapper imprimable caché */}
      <div id="cv-print-wrapper">
        <CVPreview data={cvData} lang={lang} />
      </div>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
              📄 {lang === 'fr' ? 'Créateur de CV canadien' : 'Canadian Resume Builder'}
            </h1>
            <p style={{ fontSize: 14, color: C.muted }}>
              {lang === 'fr' ? "Format canadien · Optimisé par IA · Exportable en PDF" : 'Canadian format · AI-optimized · Export to PDF'}
            </p>
          </div>
          {etape === 4 && (
            <button onClick={imprimer} style={{ padding: '10px 22px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              ⬇ {lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
            </button>
          )}
        </div>

        {/* ── STEPPER ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {ETAPES.map(e => (
            <button key={e.id} onClick={() => e.id < etape && setEtape(e.id)}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: e.id < etape ? 'pointer' : 'default', transition: 'all 0.15s', background: etape === e.id ? C.accent : e.id < etape ? `${C.accent}20` : 'transparent', color: etape === e.id ? '#fff' : e.id < etape ? C.accent2 : C.muted }}>
              {e.id < etape ? '✓ ' : ''}{lang === 'fr' ? e.fr : e.en}
            </button>
          ))}
        </div>

        {/* ══ ÉTAPE 1 — Informations personnelles ══ */}
        {etape === 1 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>
              👤 {lang === 'fr' ? 'Informations personnelles' : 'Personal Information'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 20px' }}>
              <Field label={lang === 'fr' ? 'Nom complet' : 'Full name'} value={nom} onChange={e => setNom(e.target.value)} placeholder="Marie Dupont" />
              <Field label={lang === 'fr' ? 'Poste / titre recherché' : 'Target job title'} value={poste} onChange={e => setPoste(e.target.value)} placeholder="Développeuse web junior" />
              <Field label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@email.com" type="email" />
              <Field label={lang === 'fr' ? 'Téléphone' : 'Phone'} value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="514-555-0123" />
              <Field label={lang === 'fr' ? 'Ville, Province' : 'City, Province'} value={ville} onChange={e => setVille(e.target.value)} placeholder="Montréal, QC" />
              <Field label="LinkedIn (optionnel)" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/marie" />
            </div>

            {/* Compétences */}
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12, marginTop: 6 }}>
              🛠 {lang === 'fr' ? 'Compétences clés' : 'Key Skills'}
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={compInput} onChange={e => setCompInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ajouterComp()}
                placeholder={lang === 'fr' ? 'Ajouter une compétence...' : 'Add a skill...'}
                style={{ flex: 1, padding: '8px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: 'none' }} />
              <button onClick={() => ajouterComp()} style={{ padding: '8px 16px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+</button>
            </div>
            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {COMPETENCES_SUGGESTIONS.filter(s => !competences.includes(s)).slice(0, 10).map(s => (
                <button key={s} onClick={() => ajouterComp(s)}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer' }}>
                  + {s}
                </button>
              ))}
            </div>
            {/* Tags ajoutés */}
            {competences.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                {competences.map(c => (
                  <span key={c} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: `${C.accent}15`, color: C.accent2, border: `1px solid ${C.accent}30`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c}
                    <button onClick={() => retirerComp(c)} style={{ background: 'none', border: 'none', color: C.accent2, cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Langues */}
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              🌍 {lang === 'fr' ? 'Langues' : 'Languages'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
              {LANGUES_OPTIONS.map(l => (
                <button key={l} onClick={() => toggleLangue(l)}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1px solid ${langues.includes(l) ? C.accent + '50' : C.border}`, background: langues.includes(l) ? `${C.accent}15` : 'transparent', color: langues.includes(l) ? C.accent2 : C.muted, cursor: 'pointer', fontWeight: langues.includes(l) ? 600 : 400 }}>
                  {langues.includes(l) ? '✓ ' : ''}{l}
                </button>
              ))}
            </div>

            <button onClick={() => setEtape(2)} style={{ width: '100%', padding: '13px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {lang === 'fr' ? 'Continuer → Expériences' : 'Continue → Experience'}
            </button>
          </div>
        )}

        {/* ══ ÉTAPE 2 — Expériences ══ */}
        {etape === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                💼 {lang === 'fr' ? 'Expériences professionnelles' : 'Work Experience'}
              </p>
              <button onClick={ouvrirNouvelleExp} style={{ padding: '8px 16px', background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 9, color: C.accent2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                + {lang === 'fr' ? 'Ajouter' : 'Add'}
              </button>
            </div>

            {experiences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 20 }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>💼</p>
                <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>
                  {lang === 'fr' ? "Aucune expérience ajoutée. Tu peux passer cette étape." : 'No experience added. You can skip this step.'}
                </p>
                <button onClick={ouvrirNouvelleExp} style={{ padding: '9px 20px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  + {lang === 'fr' ? 'Ajouter une expérience' : 'Add experience'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {experiences.map((e, i) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${C.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💼</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{e.poste || lang === 'fr' ? '(Poste non renseigné)' : '(Untitled)'}</p>
                      <p style={{ fontSize: 12, color: C.accent2, marginBottom: 2 }}>{e.entreprise}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{e.debut}{e.debut ? ' – ' : ''}{e.actuel ? (lang === 'fr' ? 'Présent' : 'Present') : e.fin}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => ouvrirEditionExp(e)} style={{ padding: '5px 10px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 7, color: C.accent2, fontSize: 12, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => supprimerExp(e.id)} style={{ padding: '5px 10px', background: `${C.error}10`, border: `1px solid ${C.error}25`, borderRadius: 7, color: C.error, fontSize: 12, cursor: 'pointer' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEtape(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                ← {lang === 'fr' ? 'Retour' : 'Back'}
              </button>
              <button onClick={() => setEtape(3)} style={{ flex: 3, padding: '12px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {lang === 'fr' ? 'Continuer → Formation' : 'Continue → Education'}
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 — Formation & résumé manuel ══ */}
        {etape === 3 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>
              🎓 {lang === 'fr' ? 'Formation & résumé' : 'Education & Summary'}
            </p>

            <Field
              label={lang === 'fr' ? 'Formation (diplôme, établissement, années)' : 'Education (degree, school, years)'}
              value={formation}
              onChange={e => setFormation(e.target.value)}
              placeholder={lang === 'fr' ? "ex. Bachelor Informatique, Université de Montréal, 2021–2024\nDEUT Sciences économiques, Université de Dakar, 2018–2021" : "e.g. Bachelor of Computer Science, Université de Montréal, 2021–2024"}
              rows={4}
            />

            <Field
              label={lang === 'fr' ? 'Résumé professionnel (optionnel — l\'IA en génère un si vide)' : 'Professional summary (optional — AI generates one if empty)'}
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder={lang === 'fr' ? "Ex. Développeuse web passionnée avec 2 ans d'expérience en JavaScript..." : "Ex. Passionate web developer with 2 years of JavaScript experience..."}
              rows={3}
            />

            {/* Capsule info IA */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <p style={{ fontSize: 13, color: C.accent2, lineHeight: 1.6 }}>
                {lang === 'fr'
                  ? "L'IA va générer un résumé professionnel percutant et transformer tes descriptions en bullet points d'impact pour le marché canadien."
                  : "AI will generate a compelling professional summary and transform your descriptions into high-impact bullet points for the Canadian market."}
              </p>
            </div>

            {aiErr && <p style={{ fontSize: 13, color: C.error, marginBottom: 12 }}>⚠ {aiErr}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEtape(2)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                ← {lang === 'fr' ? 'Retour' : 'Back'}
              </button>
              <button onClick={generer} disabled={generating}
                style={{ flex: 3, padding: '12px', background: generating ? C.border : C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.8 : 1 }}>
                {generating
                  ? (lang === 'fr' ? '✨ Génération en cours...' : '✨ Generating...')
                  : (lang === 'fr' ? '✨ Générer mon CV →' : '✨ Generate my resume →')}
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 4 — Aperçu CV ══ */}
        {etape === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEtape(3)} style={{ padding: '9px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  ← {lang === 'fr' ? 'Modifier' : 'Edit'}
                </button>
                <button onClick={generer} disabled={generating} style={{ padding: '9px 16px', background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 9, color: C.accent2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {generating ? '...' : (lang === 'fr' ? '↺ Régénérer l\'IA' : '↺ Regenerate AI')}
                </button>
              </div>
              <button onClick={imprimer} style={{ padding: '10px 22px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                ⬇ {lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
              </button>
            </div>

            {/* Aperçu dans un cadre */}
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
              <CVPreview data={cvData} lang={lang} />
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 16 }}>
              {lang === 'fr' ? '💡 Clique sur "Télécharger PDF" puis "Enregistrer en PDF" dans la boîte de dialogue d\'impression.' : '💡 Click "Download PDF" then "Save as PDF" in the print dialog.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
