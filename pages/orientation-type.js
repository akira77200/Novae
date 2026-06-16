// pages/orientation-type.js — NOVAE v5 — Comparateur Université vs Collège
import { useState } from 'react'

import { useApp } from '../context/AppContext'
import SAFE_LINKS from '../lib/safeLinks'

// ─────────────────────────────────────────────────────────────────
// DONNÉES COMPARATIF
// ─────────────────────────────────────────────────────────────────
const TABLEAU = [
  {
    aspect:    { fr: 'Durée',                    en: 'Duration'               },
    univ:      { fr: '3–4 ans (baccalauréat)',   en: '3–4 years (bachelor\'s)' },
    college:   { fr: '2–3 ans (diplôme / AEC)',  en: '2–3 years (diploma/AEC)' },
  },
  {
    aspect:    { fr: 'Coût international',       en: 'International cost'       },
    univ:      { fr: '25 000–50 000 $/an',       en: '$25,000–50,000/year'      },
    college:   { fr: '8 000–18 000 $/an',        en: '$8,000–18,000/year'       },
    highlight: true,
  },
  {
    aspect:    { fr: 'Conditions d\'admission',  en: 'Admission requirements'   },
    univ:      { fr: 'Dossier + notes + lettre', en: 'File + grades + letter'   },
    college:   { fr: 'Plus accessible',          en: 'More accessible'          },
  },
  {
    aspect:    { fr: 'Reconnaissance',           en: 'Recognition'              },
    univ:      { fr: 'Internationale',           en: 'International'            },
    college:   { fr: 'Canada + marché local',    en: 'Canada + local market'    },
  },
  {
    aspect:    { fr: 'Emploi direct',            en: 'Direct employment'        },
    univ:      { fr: 'Moins rapide',             en: 'Slower path'              },
    college:   { fr: 'Très rapide (1–3 mois)',   en: 'Very fast (1–3 months)'   },
    highlight: true,
  },
  {
    aspect:    { fr: 'Chemin vers la RP',        en: 'Path to PR'               },
    univ:      { fr: 'Via diplôme + expérience', en: 'Via degree + experience'  },
    college:   { fr: 'PCP Express Entry rapide', en: 'CEC Express Entry (fast)' },
    highlight: true,
  },
  {
    aspect:    { fr: 'Spécialisation',           en: 'Specialization'           },
    univ:      { fr: 'Large puis précis',        en: 'Broad then focused'       },
    college:   { fr: 'Précis dès l\'entrée',     en: 'Specific from day one'    },
  },
  {
    aspect:    { fr: 'Passerelle possible ?',    en: 'Bridge possible?'         },
    univ:      { fr: '✅ Oui → Maîtrise',        en: '✅ Yes → Master\'s'       },
    college:   { fr: '✅ Oui → Université (DEC-BAC)', en: '✅ Yes → University (DEC-BAC)' },
  },
]

// ─────────────────────────────────────────────────────────────────
// QUIZ ORIENTATION
// ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'objectif',
    q: { fr: "Quel est ton objectif principal ?", en: "What is your main goal?" },
    options: [
      { fr: 'Obtenir un titre universitaire reconnu mondialement', en: 'Get an internationally recognized university degree', score: { univ: 3, college: 0 } },
      { fr: 'Travailler rapidement dans un secteur spécifique',    en: 'Work quickly in a specific field',                   score: { univ: 0, college: 3 } },
      { fr: 'Obtenir la résidence permanente rapidement',          en: 'Get permanent residency quickly',                    score: { univ: 1, college: 3 } },
      { fr: 'Je ne sais pas encore',                               en: 'I\'m not sure yet',                                  score: { univ: 1, college: 1 } },
    ],
  },
  {
    id: 'budget',
    q: { fr: "Ton budget annuel total (études + vie) ?", en: "Your total annual budget (studies + living)?" },
    options: [
      { fr: 'Moins de 20 000 $ CAD',       en: 'Less than $20,000 CAD',    score: { univ: 0, college: 3 } },
      { fr: '20 000 – 35 000 $ CAD',       en: '$20,000 – $35,000 CAD',    score: { univ: 1, college: 2 } },
      { fr: 'Plus de 35 000 $ CAD',        en: 'More than $35,000 CAD',    score: { univ: 3, college: 1 } },
    ],
  },
  {
    id: 'secteur',
    q: { fr: "Tu vises quel secteur ?", en: "Which sector are you targeting?" },
    options: [
      { fr: 'Médecine / Droit / Ingénierie (université obligatoire)',     en: 'Medicine / Law / Engineering (university required)',       score: { univ: 3, college: 0 } },
      { fr: 'Informatique / Gestion / Comptabilité (les deux possibles)', en: 'IT / Management / Accounting (both possible)',             score: { univ: 2, college: 2 } },
      { fr: 'Technique / Santé / Cuisine / Design (collège idéal)',       en: 'Trades / Health / Culinary / Design (college ideal)',      score: { univ: 0, college: 3 } },
    ],
  },
  {
    id: 'langue',
    q: { fr: "Ton niveau de français ou d'anglais ?", en: "Your French or English level?" },
    options: [
      { fr: 'Très bon (IELTS 7+ ou TEF C1)',       en: 'Very good (IELTS 7+ or TEF C1)', score: { univ: 2, college: 1 } },
      { fr: 'Bon (IELTS 6 ou TEF B2)',              en: 'Good (IELTS 6 or TEF B2)',        score: { univ: 1, college: 2 } },
      { fr: 'Intermédiaire (IELTS 5.5 ou TEF B1)', en: 'Intermediate (IELTS 5.5/TEF B1)',  score: { univ: 0, college: 3 } },
    ],
  },
  {
    id: 'plan',
    q: { fr: "Ton plan après les études ?", en: "Your plan after studying?" },
    options: [
      { fr: 'Rester au Canada et faire carrière ici',       en: 'Stay in Canada and build a career here',      score: { univ: 2, college: 3 } },
      { fr: 'Retourner dans mon pays d\'origine',           en: 'Return to my home country',                   score: { univ: 3, college: 1 } },
      { fr: 'Les deux — selon les opportunités',            en: 'Both — depending on opportunities',            score: { univ: 2, college: 2 } },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────
// PASSERELLES
// ─────────────────────────────────────────────────────────────────
const PASSERELLES = [
  {
    titre: { fr: 'DEC-BAC au Québec', en: 'DEC-BAC in Quebec' },
    emoji: '🔄',
    desc:  { fr: 'Tu peux faire 2 ans au cégep + 2 ans à l\'université = baccalauréat complet en 4 ans. Économise 1 an et réduit les frais.', en: 'You can do 2 years at CEGEP + 2 years at university = full bachelor\'s in 4 years. Saves 1 year and reduces costs.' },
    exemples: ['Techniques informatiques → Génie logiciel UdeM', 'Techniques de gestion → Commerce HEC', 'Soins infirmiers → Sciences infirmières Laval'],
    lien: { fr: SAFE_LINKS.fedecegeps.url, en: SAFE_LINKS.fedecegeps.url },
    couleur: '#6B6F76',
  },
  {
    titre: { fr: 'Transfert Collège → Université (Ontario)', en: 'College → University Transfer (Ontario)' },
    emoji: '🎓',
    desc:  { fr: 'La plupart des universités ontariennes acceptent les étudiants des collèges avec une bonne moyenne. 1–2 années de crédit reconnues.', en: 'Most Ontario universities accept college students with good grades. 1–2 years of credits recognized.' },
    exemples: ['Seneca College → York University (Business)', 'Humber College → Guelph University', 'George Brown → Ryerson (maintenant Toronto Metropolitan)'],
    lien: { fr: SAFE_LINKS.ontransfer.url, en: SAFE_LINKS.ontransfer.url },
    couleur: '#0E1116',
  },
  {
    titre: { fr: 'AEC → Marché du travail rapide', en: 'AEC → Fast track to employment' },
    emoji: '⚡',
    desc:  { fr: 'L\'Attestation d\'Études Collégiales (AEC) est une formation courte (6–18 mois) très ciblée. Parfaite si tu as déjà un diplôme et veux te reconvertir rapidement au Canada.', en: 'The AEC is a short program (6–18 months) highly targeted to the job market. Perfect if you already have a degree and want to quickly pivot in Canada.' },
    exemples: ['AEC en développement web (6 mois)', 'AEC en soins de santé (12 mois)', 'AEC en comptabilité et gestion (18 mois)'],
    lien: { fr: SAFE_LINKS.inforoutefpt.url, en: SAFE_LINKS.inforoutefpt.url },
    couleur: '#0E1116',
  },
]

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function OrientationType() {
  const { C, lang } = useApp()

  const [section,  setSection]  = useState('tableau')  // 'tableau' | 'quiz' | 'passerelles'
  const [repQ,     setRepQ]     = useState({})          // { qId: optionIndex }
  const [resultat, setResultat] = useState(null)        // null | { univ, college, recommande }

  const qActuelle   = QUESTIONS.findIndex(q => repQ[q.id] === undefined)
  const quizTermine = Object.keys(repQ).length === QUESTIONS.length
  const progression = Object.keys(repQ).length

  const repondre = (qId, idx, scores) => {
    const next = { ...repQ, [qId]: idx }
    setRepQ(next)
    // Si c'était la dernière question → calcul résultat
    if (Object.keys(next).length === QUESTIONS.length) {
      let totalUniv = 0, totalCollege = 0
      QUESTIONS.forEach(q => {
        const rep = q.options[next[q.id]]
        if (rep) { totalUniv += rep.score.univ; totalCollege += rep.score.college }
      })
      const maxPts    = 3 * QUESTIONS.length
      const pctUniv   = Math.round((totalUniv   / maxPts) * 100)
      const pctCol    = Math.round((totalCollege / maxPts) * 100)
      const recommande = pctUniv > pctCol ? 'univ' : pctCol > pctUniv ? 'college' : 'egal'
      setResultat({ pctUniv, pctCol, recommande })
    }
  }

  const resetQuiz = () => { setRepQ({}); setResultat(null) }

  const TABS = [
    { id: 'tableau',     fr: '📊 Comparatif',      en: '📊 Comparison'    },
    { id: 'quiz',        fr: 'Lequel me convient ?', en: 'Which fits me?' },
    { id: 'passerelles', fr: 'Les passerelles',  en: '🔄 Bridges'       },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-h1)', fontFamily: 'system-ui,sans-serif' }}>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-h1)', letterSpacing: -0.5, marginBottom: 4 }}>
          🏛️ {lang === 'fr' ? 'Université ou Collège ?' : 'University or College?'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          {lang === 'fr'
            ? 'Le système canadien d\'enseignement supérieur expliqué — et lequel te convient le mieux.'
            : 'Canada\'s post-secondary system explained — and which one fits you best.'}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 12, padding: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setSection(tab.id)}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: section === tab.id ? '#0E1116' : 'transparent', color: section === tab.id ? '#fff' : '#6B6F76' }}>
              {lang === 'fr' ? tab.fr : tab.en}
            </button>
          ))}
        </div>

        {/* ══════════ TABLEAU COMPARATIF ══════════ */}
        {section === 'tableau' && (
          <>
            {/* Intro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { emoji:'🏛️', titre:'Université', titre_en:'University', desc: lang==='fr'?'Formation théorique et scientifique. Nécessaire pour les professions libérales.':'Theoretical and scientific training. Required for liberal professions.', color:'var(--text-muted)' },
                { emoji:'🔧', titre:'Collège / Cégep', titre_en:'College / CEGEP', desc: lang==='fr'?'Formation technique et pratique. Directement orienté emploi ou passerelle univ.':'Technical and practical training. Employment-focused or university bridge.', color:'var(--text-h1)' },
              ].map((c, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--bg-card)', border: `1px solid ${c.color}30`, borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{c.emoji}</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: c.color }}>{lang === 'fr' ? c.titre : c.titre_en}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Tableau */}
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {[
                      { label: lang==='fr'?'Critère':'Criterion', align:'left' },
                      { label: '🏛️ ' + (lang==='fr'?'Université':'University'), align:'center', color:'var(--text-muted)' },
                      { label: '🔧 ' + (lang==='fr'?'Collège':'College'), align:'center', color:'var(--text-h1)' },
                    ].map((h, i) => (
                      <th key={i} style={{ padding: '11px 14px', background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, textAlign: h.align, color: h.color || '#6B6F76', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLEAU.map((row, i) => (
                    <tr key={i} style={{ background: row.highlight ? `${'#0E1116'}04` : i % 2 === 0 ? '#FFFFFF' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, fontWeight: 600, color: 'var(--text-h1)' }}>
                        {row.aspect[lang] || row.aspect.fr}
                      </td>
                      <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, textAlign: 'center', color: 'var(--text-muted)', fontWeight: row.highlight ? 600 : 400 }}>
                        {row.univ[lang] || row.univ.fr}
                      </td>
                      <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, textAlign: 'center', color: 'var(--text-h1)', fontWeight: row.highlight ? 600 : 400 }}>
                        {row.college[lang] || row.college.fr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA quiz */}
            <div style={{ padding: '18px 22px', background: `${'#0E1116'}08`, border: `1px solid ${'#0E1116'}20`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--text-h1)', fontWeight: 600 }}>
                {lang === 'fr' ? 'Lequel te convient le mieux ?' : 'Which one fits you best?'}
              </p>
              <button onClick={() => setSection('quiz')}
                style={{ padding: '9px 20px', background: '#0E1116', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {lang === 'fr' ? 'Faire le quiz →' : 'Take the quiz →'}
              </button>
            </div>
          </>
        )}

        {/* ══════════ QUIZ ══════════ */}
        {section === 'quiz' && (
          <>
            {!quizTermine ? (
              <>
                {/* Progression */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(progression / QUESTIONS.length) * 100}%`, height: '100%', background: '#0E1116', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{progression}/{QUESTIONS.length}</span>
                </div>

                {/* Questions répondues — résumé compact */}
                {progression > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {QUESTIONS.slice(0, progression).map((q, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${'#0E1116'}12`, color: 'var(--text-body)', border: `1px solid ${'#0E1116'}20` }}>
                        ✓ {lang === 'fr' ? q.options[repQ[q.id]]?.fr : q.options[repQ[q.id]]?.en}
                      </span>
                    ))}
                  </div>
                )}

                {/* Question courante */}
                {QUESTIONS[qActuelle] && (() => {
                  const q = QUESTIONS[qActuelle]
                  return (
                    <div style={{ background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 16, padding: '24px' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 }}>
                        {lang === 'fr' ? `Question ${qActuelle + 1} sur ${QUESTIONS.length}` : `Question ${qActuelle + 1} of ${QUESTIONS.length}`}
                      </p>
                      <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-h1)', lineHeight: 1.5, marginBottom: 22 }}>
                        {q.q[lang] || q.q.fr}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {q.options.map((opt, i) => (
                          <button key={i} onClick={() => repondre(q.id, i, opt.score)}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: 'var(--bg-subtle)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 11, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E111650'; e.currentTarget.style.background = `${'#0E1116'}08` }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBE9'; e.currentTarget.style.background = '#F7F7F5' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${'#0E1116'}12`, border: `1px solid ${'#0E1116'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--text-body)', flexShrink: 0 }}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-h1)', lineHeight: 1.5 }}>{lang === 'fr' ? opt.fr : opt.en}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </>
            ) : resultat && (
              /* ── RÉSULTAT ── */
              <div>
                {/* Résultat principal */}
                <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 18, marginBottom: 24 }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>
                    {resultat.recommande === 'univ' ? '🏛️' : resultat.recommande === 'college' ? '🔧' : '⚖️'}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-h1)', marginBottom: 8 }}>
                    {resultat.recommande === 'univ'
                      ? (lang === 'fr' ? "L'université correspond à ton profil" : "University fits your profile")
                      : resultat.recommande === 'college'
                      ? (lang === 'fr' ? "Le collège correspond à ton profil" : "College fits your profile")
                      : (lang === 'fr' ? "Les deux options te conviennent" : "Both options suit you")}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 24px' }}>
                    {resultat.recommande === 'univ'
                      ? (lang === 'fr' ? "Ton profil — objectifs, budget et secteur — correspond mieux à un parcours universitaire." : "Your profile — goals, budget and sector — better aligns with a university path.")
                      : resultat.recommande === 'college'
                      ? (lang === 'fr' ? "Le collège te permettra d'atteindre tes objectifs plus rapidement et pour un coût moindre." : "College will help you reach your goals faster and at a lower cost.")
                      : (lang === 'fr' ? "Tu peux réussir dans les deux voies. Explore la passerelle DEC-BAC pour combiner les deux." : "You can succeed in both paths. Explore the DEC-BAC bridge to combine both.")}
                  </p>

                  {/* Barres comparatives */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto 24px' }}>
                    {[
                      { label: lang === 'fr' ? '🏛️ Université' : '🏛️ University', pct: resultat.pctUniv,   color: 'var(--text-muted)' },
                      { label: lang === 'fr' ? '🔧 Collège'    : '🔧 College',    pct: resultat.pctCol,    color: 'var(--text-h1)' },
                    ].map((b, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-h1)', fontWeight: 600 }}>{b.label}</span>
                          <span style={{ fontSize: 13, color: b.color, fontWeight: 700 }}>{b.pct}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={resetQuiz}
                      style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${'#EBEBE9'}`, borderRadius: 9, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      ↺ {lang === 'fr' ? 'Recommencer' : 'Restart'}
                    </button>
                    <a href="/bourses"
                      style={{ padding: '10px 20px', background: '#0E1116', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                      {lang === 'fr' ? 'Voir les bourses disponibles →' : 'See available scholarships →'}
                    </a>
                    {(resultat.recommande === 'college' || resultat.recommande === 'egal') && (
                      <button onClick={() => setSection('passerelles')}
                        style={{ padding: '10px 20px', background: `${'#0E1116'}15`, border: `1px solid ${'#0E1116'}30`, borderRadius: 9, color: 'var(--text-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        🔄 {lang === 'fr' ? 'Voir les passerelles' : 'See bridges'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Raisonnement détaillé */}
                <div style={{ background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 14, padding: '18px 20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 14 }}>
                    💡 {lang === 'fr' ? 'Pourquoi cette recommandation ?' : 'Why this recommendation?'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {QUESTIONS.map(q => {
                      const rep = q.options[repQ[q.id]]
                      if (!rep) return null
                      const fav = rep.score.univ > rep.score.college ? '🏛️' : rep.score.college > rep.score.univ ? '🔧' : '⚖️'
                      return (
                        <div key={q.id} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: 'var(--bg-subtle)', borderRadius: 9 }}>
                          <span style={{ flexShrink: 0, fontSize: 14 }}>{fav}</span>
                          <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{q.q[lang] || q.q.fr}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-h1)', fontWeight: 500 }}>{lang === 'fr' ? rep.fr : rep.en}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ PASSERELLES ══════════ */}
        {section === 'passerelles' && (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
              {lang === 'fr'
                ? '💡 Au Canada, les systèmes sont perméables : commencer par un collège ne t\'empêche pas d\'aller à l\'université — et vice versa.'
                : '💡 In Canada, the systems are permeable: starting at college doesn\'t prevent you from going to university — and vice versa.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PASSERELLES.map((p, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${p.couleur}30`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 4, background: p.couleur }} />
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 28 }}>{p.emoji}</span>
                      <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-h1)' }}>{p.titre[lang] || p.titre.fr}</p>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
                      {p.desc[lang] || p.desc.fr}
                    </p>

                    {/* Exemples */}
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                      {lang === 'fr' ? 'Exemples' : 'Examples'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                      {p.exemples.map((ex, j) => (
                        <span key={j} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: p.couleur + '12', color: p.couleur, border: `1px solid ${p.couleur}25`, fontWeight: 500 }}>
                          {ex}
                        </span>
                      ))}
                    </div>

                    <a href={p.lien[lang] || p.lien.fr} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', padding: '8px 18px', background: p.couleur, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                      {lang === 'fr' ? 'En savoir plus →' : 'Learn more →'}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Tableau comparatif des coûts */}
            <div style={{ marginTop: 24, background: 'var(--bg-card)', border: `1px solid ${'#EBEBE9'}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${'#EBEBE9'}` }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h1)' }}>
                  💰 {lang === 'fr' ? 'Comparaison des coûts : université directe vs passerelle' : 'Cost comparison: direct university vs bridge path'}
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {[
                        { label: lang === 'fr' ? 'Parcours' : 'Path', align: 'left' },
                        { label: lang === 'fr' ? 'Durée' : 'Duration', align: 'center' },
                        { label: lang === 'fr' ? 'Frais de scolarité' : 'Tuition', align: 'center', color: 'var(--text-muted)' },
                        { label: lang === 'fr' ? 'Économie estimée' : 'Est. savings', align: 'center', color: 'var(--text-body)' },
                      ].map((h, i) => (
                        <th key={i} style={{ padding: '10px 14px', background: 'var(--bg-subtle)', border: `1px solid ${'#EBEBE9'}`, textAlign: h.align, color: h.color || '#6B6F76', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                    {[
                      { path: { fr: '🏛️ Université directe (baccalauréat 4 ans)', en: '🏛️ Direct university (4-year bachelor\'s)' }, duree: '4 ans', frais: '25 000–50 000 $/an', savings: '—', highlight: false },
                      { path: { fr: 'DEC-BAC Québec (cégep 2 ans + univ. 2 ans)', en: '🔄 DEC-BAC Quebec (CEGEP 2yr + univ. 2yr)' }, duree: '4 ans', frais: '8 000 + 22 000 $/an', savings: lang === 'fr' ? '~30 000 $ sur 4 ans' : '~$30,000 over 4 years', highlight: true },
                      { path: { fr: 'Collège → Transfert (Ontario)', en: 'College → Transfer (Ontario)' }, duree: '3–4 ans', frais: '12 000 + 35 000 $/an', savings: lang === 'fr' ? '~15 000 $ sur le parcours' : '~$15,000 over the path', highlight: true },
                      { path: { fr: '⚡ AEC seule (6–18 mois)', en: '⚡ AEC only (6–18 months)' }, duree: '6–18 mois', frais: '5 000–12 000 $ total', savings: lang === 'fr' ? '~80 000 $ vs univ. 4 ans' : '~$80,000 vs 4yr univ.', highlight: false },
                    ].map((r, i) => (
                      <tr key={i} style={{ background: r.highlight ? `${'#0E1116'}05` : 'transparent' }}>
                        <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, color: 'var(--text-h1)', fontWeight: r.highlight ? 600 : 400 }}>{r.path[lang] || r.path.fr}</td>
                        <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, textAlign: 'center', color: 'var(--text-muted)' }}>{r.duree}</td>
                        <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>{r.frais}</td>
                        <td style={{ padding: '12px 14px', border: `1px solid ${'#EBEBE9'}`, textAlign: 'center', color: r.savings === '—' ? '#6B6F76' : '#3A3D40', fontWeight: r.savings !== '—' ? 600 : 400 }}>{r.savings}</td>
                      </tr>
                    ))}
                  </thead>
                </table>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: '10px 14px', fontStyle: 'italic' }}>
                * {lang === 'fr' ? 'Estimations 2025 pour étudiants internationaux. Varie selon l\'université et le programme.' : '* 2025 estimates for international students. Varies by university and program.'}
              </p>
            </div>

            {/* Conseil final */}
            <div style={{ marginTop: 24, padding: '16px 20px', background: `${'#0E1116'}08`, border: `1px solid ${'#0E1116'}20`, borderRadius: 14 }}>
              <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.7 }}>
                {lang === 'fr' ? "Le meilleur chemin n'est pas le plus rapide — c'est celui qui correspond à ton projet de vie. Prends le temps de te renseigner auprès des conseillers d'orientation de l'université ou du collège de ton choix."
                  : "The best path isn't the fastest — it's the one that fits your life project. Take time to consult advisors at the university or college of your choice."}
              </p>
            </div>
          </>
        )}

      </main>
    </div>
  )
}
