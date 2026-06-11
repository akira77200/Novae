// pages/simulateur-budget.js — NOVAE v5 — Simulateur budget annuel étudiant
import { useState, useMemo, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ─────────────────────────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────────────────────────
const FRAIS_SCOLARITE = {
  universite: {
    Montreal:  { min: 18000, max: 28000, label: 'Montréal' },
    Toronto:   { min: 28000, max: 45000, label: 'Toronto'  },
    Ottawa:    { min: 25000, max: 38000, label: 'Ottawa'   },
    Vancouver: { min: 28000, max: 42000, label: 'Vancouver'},
    Calgary:   { min: 22000, max: 35000, label: 'Calgary'  },
  },
  college: {
    Montreal:  { min: 8000,  max: 14000, label: 'Montréal' },
    Toronto:   { min: 12000, max: 18000, label: 'Toronto'  },
    Ottawa:    { min: 10000, max: 16000, label: 'Ottawa'   },
    Vancouver: { min: 12000, max: 18000, label: 'Vancouver'},
    Calgary:   { min: 9000,  max: 15000, label: 'Calgary'  },
  },
}

const VIE_MENSUELLE = {
  Montreal:  { loyer_residence: 1000, loyer_coloc: 850,  loyer_studio: 1350, epicerie: 380, transport: 109, telephone: 40, internet: 60, loisirs: 100, smig: 16.10 },
  Toronto:   { loyer_residence: 1300, loyer_coloc: 1150, loyer_studio: 1900, epicerie: 420, transport: 156, telephone: 45, internet: 65, loisirs: 120, smig: 17.20 },
  Ottawa:    { loyer_residence: 1100, loyer_coloc: 950,  loyer_studio: 1500, epicerie: 390, transport: 125, telephone: 40, internet: 60, loisirs: 100, smig: 16.55 },
  Vancouver: { loyer_residence: 1300, loyer_coloc: 1200, loyer_studio: 2100, epicerie: 430, transport: 109, telephone: 45, internet: 65, loisirs: 130, smig: 17.40 },
  Calgary:   { loyer_residence: 1000, loyer_coloc: 900,  loyer_studio: 1450, epicerie: 400, transport: 115, telephone: 45, internet: 60, loisirs: 110, smig: 15.00 },
}

const PROGRAMMES_TYPE = [
  { id: 'info',       fr: 'Informatique / Génie logiciel', en: 'Computer Science / Software Eng.' },
  { id: 'gestion',    fr: 'Gestion / Commerce / MBA',      en: 'Management / Business / MBA'      },
  { id: 'sante',      fr: 'Santé / Médecine / Nursing',    en: 'Health / Medicine / Nursing'      },
  { id: 'droit',      fr: 'Droit / Sciences politiques',   en: 'Law / Political Science'          },
  { id: 'sciences',   fr: 'Sciences / Mathématiques',      en: 'Sciences / Mathematics'           },
  { id: 'arts',       fr: 'Arts / Lettres / Communication',en: 'Arts / Humanities / Communication'},
  { id: 'technique',  fr: 'Technique / Design / Cuisine',  en: 'Technical / Design / Culinary'   },
  { id: 'autre',      fr: 'Autre programme',               en: 'Other program'                    },
]

const LOGEMENT_TYPES = [
  { id: 'residence', fr: 'Résidence universitaire',  en: 'University residence'   },
  { id: 'coloc',     fr: 'Colocation (chambre)',      en: 'Shared room'            },
  { id: 'studio',    fr: 'Studio seul',               en: 'Solo studio'            },
]

const HEURES_TRAVAIL = [
  { val: 0,  fr: 'Je ne travaille pas',            en: 'I don\'t work'               },
  { val: 10, fr: '10h / semaine (part-time léger)', en: '10h / week (light part-time)'},
  { val: 20, fr: '20h / semaine (max légal)',        en: '20h / week (legal max)'      },
]

// ─────────────────────────────────────────────────────────────────
// CALCUL BUDGET
// ─────────────────────────────────────────────────────────────────
const calculer = (ville, type, logement, heures) => {
  const scol  = FRAIS_SCOLARITE[type]?.[ville]
  const vie   = VIE_MENSUELLE[ville]
  if (!scol || !vie) return null

  const frais_moy    = Math.round((scol.min + scol.max) / 2)
  const loyer        = vie[`loyer_${logement}`] || vie.loyer_coloc
  const vie_mens     = loyer + vie.epicerie + vie.transport + vie.telephone + vie.internet + vie.loisirs
  const vie_an       = vie_mens * 12
  const divers       = Math.round(vie_an * 0.10)
  const total_dep    = frais_moy + vie_an + divers
  const revenu_trav  = Math.round(heures * 52 * vie.smig * 0.82) // ~18% impôts et charges
  const bourse_est   = type === 'universite' ? 3000 : 1500        // estimation conservative
  const besoin_reel  = Math.max(0, total_dep - revenu_trav - bourse_est)

  return {
    frais_scolarite: frais_moy,
    scol_min: scol.min, scol_max: scol.max,
    loyer: loyer * 12,
    epicerie_transport: (vie.epicerie + vie.transport) * 12,
    telephone_internet: (vie.telephone + vie.internet) * 12,
    loisirs: vie.loisirs * 12,
    divers,
    total_depenses: total_dep,
    revenu_travail: revenu_trav,
    bourse_estimee: bourse_est,
    besoin_reel,
    smig: vie.smig,
    couverture_trav: heures > 0 ? Math.min(100, Math.round((revenu_trav / (total_dep - frais_moy)) * 100)) : 0,
  }
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
const VILLES = Object.keys(VIE_MENSUELLE)

export default function SimulateurBudget() {
  const { C, lang, profile } = useApp()

  const defaultType = () => {
    try {
      const progId = localStorage.getItem('novae_programme_choisi')
      if (!progId) return 'universite'
      const college = ['technique', 'sante', 'design-ux', 'agriculture']
      return college.some(id => progId.includes(id)) ? 'college' : 'universite'
    } catch { return 'universite' }
  }

  const [scenarios, setScenarios] = useState(() => {
    try { return JSON.parse(localStorage.getItem('novae_budget_scenarios') || '[]') } catch { return [] }
  })
  const [scenarioMsg, setScenarioMsg] = useState('')

  // Scénario A
  const [villeA,   setVilleA]   = useState(profile?.ville_accueil?.includes('Toronto') ? 'Toronto' : 'Montreal')
  const [typeA,    setTypeA]    = useState(defaultType)
  const [logA,     setLogA]     = useState('coloc')
  const [heuresA,  setHeuresA]  = useState(10)

  // Scénario B (comparaison)
  const [compareMode, setCompareMode] = useState(false)
  const [villeB,   setVilleB]   = useState('Toronto')
  const [typeB,    setTypeB]    = useState('universite')
  const [logB,     setLogB]     = useState('coloc')
  const [heuresB,  setHeuresB]  = useState(10)

  const budgetA = useMemo(() => calculer(villeA, typeA, logA, heuresA), [villeA, typeA, logA, heuresA])
  const budgetB = useMemo(() => compareMode ? calculer(villeB, typeB, logB, heuresB) : null, [compareMode, villeB, typeB, logB, heuresB])

  const jauge = (besoin) => besoin > 40000 ? { color:'#F87171', label: lang==='fr'?'Budget serré':'Tight budget', bg:'rgba(248,113,113,0.08)' }
    : besoin > 25000 ? { color:'#FBBF24', label: lang==='fr'?'Budget modéré':'Moderate budget', bg:'rgba(251,191,36,0.08)' }
    : { color:'#34D399', label: lang==='fr'?'Budget gérable':'Manageable budget', bg:'rgba(52,211,153,0.08)' }

  const conseil = (b, ville, type, heures) => {
    if (!b) return null
    const epargne = Math.ceil(b.besoin_reel * 1.15) // +15% marge sécurité
    const couv    = b.couverture_trav
    const lines   = []
    if (epargne > 0) lines.push(lang==='fr'
      ? `💰 Prévois ${epargne.toLocaleString()} $ d'épargne avant de partir pour ${VIE_MENSUELLE[ville]?.label || ville}.`
      : `💰 Plan for $${epargne.toLocaleString()} in savings before arriving in ${VIE_MENSUELLE[ville]?.label || ville}.`)
    if (heures === 20) lines.push(lang==='fr'
      ? `⚠️ 20h/sem est le maximum légal. Assure-toi que ton programme le permet.`
      : `⚠️ 20h/week is the legal maximum. Make sure your program allows it.`)
    if (couv > 0) lines.push(lang==='fr'
      ? `💼 Avec ${heures}h de travail par semaine, tu couvres ~${couv}% de tes frais de vie.`
      : `💼 Working ${heures}h/week covers ~${couv}% of your living costs.`)
    if (type === 'college') lines.push(lang==='fr'
      ? `🎓 Au collège, tes frais de scolarité sont 2–3× moins élevés qu'à l'université.`
      : `🎓 College tuition is 2–3× lower than university for international students.`)
    return lines
  }

  const Field = ({ label, value, setter, options }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => setter(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: 'none' }}>
        {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
      </select>
    </div>
  )

  const BudgetCard = ({ budget, label, color }) => {
    if (!budget) return null
    const j     = jauge(budget.besoin_reel)
    const maxDep = budget.total_depenses
    const postes = [
      { label: lang==='fr'?'Frais de scolarité (moy.)':'Tuition (avg.)', val: budget.frais_scolarite, color: '#60A5FA' },
      { label: lang==='fr'?'Loyer (12 mois)':'Rent (12 months)',          val: budget.loyer,           color: '#F97316' },
      { label: lang==='fr'?'Épicerie + transport':'Groceries + transit',   val: budget.epicerie_transport, color: '#52B788' },
      { label: lang==='fr'?'Téléphone + internet':'Phone + internet',      val: budget.telephone_internet, color: '#A78BFA' },
      { label: lang==='fr'?'Loisirs':'Leisure',                            val: budget.loisirs,         color: '#B5838D' },
      { label: lang==='fr'?'Divers + imprévus (10%)':'Misc + unexpected (10%)', val: budget.divers,    color: '#9CA3AF' },
    ]

    return (
      <div style={{ background: C.surface, border: `1px solid ${color}30`, borderRadius: 16, overflow: 'hidden', flex: 1, minWidth: 280 }}>
        <div style={{ height: 4, background: color }} />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 18 }}>{label}</p>

          {/* Tableau des postes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {postes.map((p, i) => {
              const pct = Math.round((p.val / maxDep) * 100)
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{p.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.val.toLocaleString()} $</span>
                  </div>
                  <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{lang==='fr'?'Total dépenses':'Total expenses'}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{budget.total_depenses.toLocaleString()} $</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.success }}>- {lang==='fr'?'Revenus travail':'Work income'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.success }}>- {budget.revenu_travail.toLocaleString()} $</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: C.accent2 }}>- {lang==='fr'?'Bourse estimée':'Est. scholarship'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.accent2 }}>- {budget.bourse_estimee.toLocaleString()} $</span>
            </div>
          </div>

          {/* Besoin réel */}
          <div style={{ padding: '14px 16px', background: j.bg, border: `1px solid ${j.color}30`, borderRadius: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: j.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {lang==='fr'?'💰 Besoin réel annuel':'💰 Real annual need'}
                </p>
                <p style={{ fontSize: 30, fontWeight: 900, color: j.color, letterSpacing: -1, lineHeight: 1 }}>
                  {budget.besoin_reel.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>$</span>
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: j.color + '18', color: j.color }}>
                {j.label}
              </span>
            </div>
          </div>

          {/* Fourchette scolarité */}
          <p style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>
            {lang==='fr'?'Frais de scolarité estimés :':'Estimated tuition:'} {budget.scol_min.toLocaleString()}–{budget.scol_max.toLocaleString()} $ {lang==='fr'?'selon programme':'depending on program'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
          💰 {lang==='fr'?'Simulateur budget annuel étudiant':'Annual Student Budget Simulator'}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
          {lang==='fr'
            ? 'Estime ton besoin financier réel selon ta ville, ton établissement et ton mode de vie.'
            : 'Estimate your real financial need based on your city, institution and lifestyle.'}
        </p>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ── PANNEAU PARAMÈTRES ── */}
          <div style={{ width: '100%', maxWidth: 260, flexShrink: 0 }}>

            {/* Scénario A */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.accent2, marginBottom: 14 }}>
                🔵 {compareMode ? (lang==='fr'?'Scénario A':'Scenario A') : (lang==='fr'?'Mes paramètres':'My parameters')}
              </p>

              <Field
                label={lang==='fr'?'Ville':'City'}
                value={villeA} setter={setVilleA}
                options={VILLES.map(v => ({ val: v, label: VIE_MENSUELLE[v] ? v : v }))}
              />
              <Field
                label={lang==='fr'?'Type d\'établissement':'Institution type'}
                value={typeA} setter={setTypeA}
                options={[
                  { val:'universite', label:lang==='fr'?'🏛️ Université':'🏛️ University' },
                  { val:'college',    label:lang==='fr'?'🔧 Collège / Cégep':'🔧 College / CEGEP' },
                ]}
              />
              <Field
                label={lang==='fr'?'Programme':'Program'}
                value="autre" setter={() => {}}
                options={PROGRAMMES_TYPE.map(p => ({ val: p.id, label: lang==='fr' ? p.fr : p.en }))}
              />
              <Field
                label={lang==='fr'?'Logement':'Housing'}
                value={logA} setter={setLogA}
                options={LOGEMENT_TYPES.map(l => ({ val: l.id, label: lang==='fr' ? l.fr : l.en }))}
              />
              <Field
                label={lang==='fr'?'Travail étudiant':'Student work'}
                value={String(heuresA)} setter={v => setHeuresA(Number(v))}
                options={HEURES_TRAVAIL.map(h => ({ val: String(h.val), label: lang==='fr' ? h.fr : h.en }))}
              />
            </div>

            {/* Scénario B (optionnel) */}
            {!compareMode ? (
              <button onClick={() => setCompareMode(true)}
                style={{ width: '100%', padding: '11px', background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 12, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                + {lang==='fr'?'Comparer une autre ville':'Compare another city'}
              </button>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>
                    🟠 {lang==='fr'?'Scénario B':'Scenario B'}
                  </p>
                  <button onClick={() => setCompareMode(false)}
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer' }}>✕</button>
                </div>
                <Field label={lang==='fr'?'Ville':'City'} value={villeB} setter={setVilleB}
                  options={VILLES.map(v => ({ val: v, label: v }))} />
                <Field label={lang==='fr'?'Établissement':'Institution'} value={typeB} setter={setTypeB}
                  options={[{ val:'universite', label:lang==='fr'?'🏛️ Université':'🏛️ University' }, { val:'college', label:lang==='fr'?'🔧 Collège':'🔧 College' }]} />
                <Field label={lang==='fr'?'Logement':'Housing'} value={logB} setter={setLogB}
                  options={LOGEMENT_TYPES.map(l => ({ val: l.id, label: lang==='fr' ? l.fr : l.en }))} />
                <Field label={lang==='fr'?'Travail':'Work'} value={String(heuresB)} setter={v => setHeuresB(Number(v))}
                  options={HEURES_TRAVAIL.map(h => ({ val: String(h.val), label: lang==='fr' ? h.fr : h.en }))} />
              </div>
            )}
          </div>

          {/* ── RÉSULTATS ── */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <BudgetCard
                budget={budgetA}
                label={compareMode ? `🔵 ${villeA} · ${typeA === 'universite' ? (lang==='fr'?'Université':'University') : (lang==='fr'?'Collège':'College')}` : `${villeA}`}
                color="#60A5FA"
              />
              {compareMode && budgetB && (
                <BudgetCard
                  budget={budgetB}
                  label={`🟠 ${villeB} · ${typeB === 'universite' ? (lang==='fr'?'Université':'University') : (lang==='fr'?'Collège':'College')}`}
                  color="#F97316"
                />
              )}
            </div>

            {/* Économie si comparaison */}
            {compareMode && budgetA && budgetB && (
              <div style={{ marginTop: 14, padding: '14px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                {(() => {
                  const diff = budgetA.besoin_reel - budgetB.besoin_reel
                  const moins = diff > 0 ? 'B' : 'A'
                  const abs   = Math.abs(diff)
                  return (
                    <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
                      {abs === 0
                        ? (lang==='fr'?'Les deux scénarios coûtent la même chose.':'Both scenarios cost the same.')
                        : lang==='fr'
                          ? `💡 Le scénario ${moins} coûte ${abs.toLocaleString()} $ de moins par an.`
                          : `💡 Scenario ${moins} costs $${abs.toLocaleString()} less per year.`}
                    </p>
                  )
                })()}
              </div>
            )}

            {/* Conseils contextuels */}
            {budgetA && (() => {
              const lines = conseil(budgetA, villeA, typeA, heuresA)
              return lines && lines.length > 0 && (
                <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
                    {lang==='fr'?'Conseils personnalisés':'Personalized tips'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lines.map((l, i) => (
                      <p key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.6, padding: '8px 12px', background: C.surface2, borderRadius: 8 }}>
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Sauvegarder scénario */}
            {budgetA && (() => {
              const saveScenario = () => {
                if (scenarios.length >= 3) {
                  setScenarioMsg(lang === 'fr' ? '⚠️ Maximum 3 scénarios. Supprime-en un d\'abord.' : '⚠️ Max 3 scenarios. Delete one first.')
                  return
                }
                const s = { id: Date.now(), ville: villeA, type: typeA, logement: logA, heures: heuresA, besoin: budgetA.besoin_reel, date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA') }
                const next = [...scenarios, s]
                setScenarios(next)
                try { localStorage.setItem('novae_budget_scenarios', JSON.stringify(next)) } catch {}
                setScenarioMsg(lang === 'fr' ? '✓ Scénario sauvegardé !' : '✓ Scenario saved!')
                setTimeout(() => setScenarioMsg(''), 3000)
              }
              const removeScenario = (id) => {
                const next = scenarios.filter(s => s.id !== id)
                setScenarios(next)
                try { localStorage.setItem('novae_budget_scenarios', JSON.stringify(next)) } catch {}
              }
              return (
                <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: scenarios.length > 0 ? 14 : 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      📊 {lang === 'fr' ? `Scénarios sauvegardés (${scenarios.length}/3)` : `Saved scenarios (${scenarios.length}/3)`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {scenarioMsg && <span style={{ fontSize: 12, color: scenarioMsg.startsWith('⚠️') ? C.warning : C.success }}>{scenarioMsg}</span>}
                      <button onClick={saveScenario} disabled={scenarios.length >= 3}
                        style={{ padding: '8px 16px', background: scenarios.length >= 3 ? C.border : C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 12, cursor: scenarios.length >= 3 ? 'not-allowed' : 'pointer', opacity: scenarios.length >= 3 ? 0.6 : 1 }}>
                        {lang === 'fr' ? '📊 Sauvegarder ce scénario' : '📊 Save this scenario'}
                      </button>
                    </div>
                  </div>
                  {scenarios.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {scenarios.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: C.surface2, borderRadius: 10, gap: 10, flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                              {s.ville} · {s.type === 'universite' ? (lang === 'fr' ? 'Université' : 'University') : (lang === 'fr' ? 'Collège' : 'College')}
                            </p>
                            <p style={{ fontSize: 11, color: C.muted }}>{s.date} · {lang === 'fr' ? 'Besoin' : 'Need'}: <strong style={{ color: C.accent2 }}>{s.besoin.toLocaleString()} $</strong></p>
                          </div>
                          <button onClick={() => removeScenario(s.id)}
                            style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px', color: C.muted, fontSize: 12, cursor: 'pointer' }}>
                            {lang === 'fr' ? 'Supprimer' : 'Delete'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Note bas de page */}
            <div style={{ marginTop: 16, padding: '12px 16px', background: `${C.accent}06`, border: `1px solid ${C.accent}18`, borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                {lang==='fr'
                  ? '* Estimations basées sur les données 2025. Frais de scolarité = moyenne selon programme. Revenus travail nets (~18% impôts). Bourse estimée conservative (3 000 $ univ. / 1 500 $ collège). Consulte ton université pour des chiffres exacts.'
                  : '* Estimates based on 2025 data. Tuition = program average. Net work income (~18% tax). Conservative scholarship estimate ($3,000 univ. / $1,500 college). Consult your institution for exact figures.'}
              </p>
            </div>

            {/* Liens utiles */}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/bourses" style={{ padding: '8px 16px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 9, color: C.accent2, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                🎓 {lang==='fr'?'Trouver des bourses →':'Find scholarships →'}
              </a>
              <a href="/orientation-type" style={{ padding: '8px 16px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 9, color: C.accent2, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                🏛️ {lang==='fr'?'Univ. ou Collège →':'Univ. or College →'}
              </a>
              <a href="/cv" style={{ padding: '8px 16px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 9, color: C.accent2, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                📄 {lang==='fr'?'Créer mon CV →':'Build my resume →'}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
