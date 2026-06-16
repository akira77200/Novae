// pages/culture.js
import { useState } from 'react'

import FeedbackSection from '../components/FeedbackSection'
import { useApp } from '../context/AppContext'

const DATA = {
  fr: {
    communication: [
      { titre: '"On devrait se voir" — ça veut dire quoi vraiment ?', icon: '🗣️', texte: 'Au Canada, dire "on devrait se voir" n\'est pas une promesse — c\'est une politesse. Si quelqu\'un veut vraiment te voir, il propose une date précise. Apprends à distinguer la politesse de surface de l\'invitation réelle.' },
      { titre: 'Appeler son prof par son prénom', icon: '🎓', texte: 'Au Québec, appeler un professeur par son prénom est courant et respectueux. Ce n\'est pas de l\'impolitesse — c\'est une marque d\'égalité. Si le prof dit "appelle-moi Marc", fais-le.' },
      { titre: 'Le silence en réunion', icon: '🤫', texte: 'Le silence ne signifie pas l\'accord. Il peut indiquer que les gens réfléchissent, sont en désaccord mais discrets, ou attendent que quelqu\'un d\'autre parle.' },
      { titre: 'L\'humour québécois', icon: '😄', texte: 'Les Québécois utilisent beaucoup l\'autodérision et l\'ironie. Un commentaire qui semble négatif est souvent une marque de familiarité et d\'affection. Ne prends pas tout au premier degré.' },
    ],
    university: [
      { titre: 'Citer ses sources — obligatoire', icon: '📚', texte: 'Ne pas citer ses sources est du plagiat — faute grave pouvant mener à l\'expulsion. Apprends le format APA ou MLA dès ta première semaine.' },
      { titre: 'Participer en classe — attendu et noté', icon: '✋', texte: 'La participation compte souvent pour 10 à 20% de la note. Poser des questions, donner son opinion, débattre — c\'est valorisé. Ne reste pas silencieux par timidité.' },
      { titre: 'Les heures de bureau du prof', icon: '🕐', texte: 'Chaque professeur a des créneaux libres pour répondre à tes questions. Peu d\'étudiants les utilisent — c\'est une opportunité énorme pour toi.' },
      { titre: 'L\'évaluation continue', icon: '📝', texte: 'La note finale est composée de plusieurs évaluations : travaux, présentations, participation, midterm, examen final. Ne mise pas tout sur l\'examen de fin.' },
    ],
    work: [
      { titre: 'Le networking est essentiel', icon: '🤝', texte: '70% des emplois au Canada se trouvent par réseau. LinkedIn, événements universitaires, associations professionnelles — c\'est là que se trouvent les opportunités, pas dans les CVs envoyés à la masse.' },
      { titre: 'Ponctualité professionnelle', icon: '⏰', texte: 'Un retard non annoncé est très mal perçu. Si tu sais que tu seras en retard, envoie un message avant l\'heure prévue.' },
      { titre: 'Format du CV canadien', icon: '📄', texte: 'Pas de photo, pas d\'âge, pas de statut marital. Axé sur les réalisations mesurables. Maximum 2 pages pour les étudiants.' },
      { titre: 'S\'affirmer sans être agressif', icon: '💪', texte: 'Dire "je pense que..." ou "je propose..." est bien perçu. Le conflit direct non constructif, beaucoup moins. L\'assertivité est une compétence valorisée.' },
    ],
    social: [
      { titre: 'Les files d\'attente — sacrées', icon: '🚶', texte: 'Couper une file est considéré comme très impoli. Tout le monde fait la queue — bus, café, caisse. Non négociable.' },
      { titre: 'L\'espace personnel', icon: '🫙', texte: 'Les Canadiens apprécient leur espace personnel — environ un bras de distance. Se mettre trop proche met l\'autre mal à l\'aise.' },
      { titre: 'Merci et pardon — très fréquents', icon: '🙏', texte: 'Ces mots s\'utilisent pour tout, même les petites choses. Passer devant quelqu\'un, recevoir quelque chose — toujours remercier.' },
      { titre: 'Invitations à dîner', icon: '🍽️', texte: 'Si quelqu\'un t\'invite chez lui, apporte quelque chose — vin, dessert, fleurs. Ne jamais arriver les mains vides.' },
    ],
  },
  en: {
    communication: [
      { titre: '"We should hang out" — what does it really mean?', icon: '🗣️', texte: 'In Canada, saying "we should hang out" is not a promise — it\'s a pleasantry. If someone really wants to see you, they\'ll suggest a specific date.' },
      { titre: 'Calling your professor by their first name', icon: '🎓', texte: 'In Canada, calling professors by their first name is common and respectful. If they say "call me Marc", do it.' },
      { titre: 'Silence in meetings', icon: '🤫', texte: 'Silence doesn\'t mean agreement. It may mean people are thinking, disagree quietly, or waiting for someone else to speak.' },
      { titre: 'Quebec humor', icon: '😄', texte: 'Quebecers use a lot of self-deprecation and irony. A seemingly negative comment is often familiarity and affection. Don\'t take everything at face value.' },
    ],
    university: [
      { titre: 'Citing sources — mandatory', icon: '📚', texte: 'Not citing sources is plagiarism — a serious offense that can lead to expulsion. Learn APA or MLA format in your first week.' },
      { titre: 'Class participation — expected and graded', icon: '✋', texte: 'Participation often counts 10–20% of your grade. Asking questions, giving opinions, debating — it\'s valued. Don\'t stay silent out of shyness.' },
      { titre: 'Office hours', icon: '🕐', texte: 'Each professor has time slots to answer your questions. Few students use them — it\'s a huge opportunity for you.' },
      { titre: 'Continuous assessment', icon: '📝', texte: 'The final grade includes multiple assessments: assignments, presentations, participation, midterm, final exam. Don\'t bet everything on the final.' },
    ],
    work: [
      { titre: 'Networking is essential', icon: '🤝', texte: '70% of jobs in Canada are found through networking. LinkedIn, university events, professional associations — that\'s where opportunities are.' },
      { titre: 'Professional punctuality', icon: '⏰', texte: 'An unannounced late arrival is frowned upon. If you know you\'ll be late, send a message before the scheduled time.' },
      { titre: 'Canadian CV format', icon: '📄', texte: 'No photo, no age, no marital status. Focused on measurable achievements. Maximum 2 pages for students.' },
      { titre: 'Being assertive without being aggressive', icon: '💪', texte: 'Saying "I think..." or "I suggest..." is well received. Assertiveness is a valued skill in Canadian workplaces.' },
    ],
    social: [
      { titre: 'Queues — sacred', icon: '🚶', texte: 'Cutting in line is considered very rude. Everyone queues — bus, coffee, checkout. Non-negotiable.' },
      { titre: 'Personal space', icon: '🫙', texte: 'Canadians value personal space — about an arm\'s length. Getting too close makes the other person uncomfortable.' },
      { titre: 'Thank you and sorry — very common', icon: '🙏', texte: 'These words are used for everything, even small things. Passing in front of someone, receiving something — always say thanks.' },
      { titre: 'Dinner invitations', icon: '🍽️', texte: 'If someone invites you to their home, bring something — wine, dessert, flowers. Never arrive empty-handed.' },
    ],
  }
}

const SECTIONS = [
  { id: 'communication', fr: 'Communication', en: 'Communication', icon: '🗣️', color: 'var(--text-h1)' },
  { id: 'university',    fr: 'Université',    en: 'University',    icon: '🎓', color: 'var(--text-muted)' },
  { id: 'work',          fr: 'Travail',       en: 'Work',          icon: '💼', color: 'var(--text-muted)' },
  { id: 'social',        fr: 'Social',        en: 'Social',        icon: '👥', color: 'var(--text-faint)' },
]

export default function Culture() {
  const { C, lang } = useApp()
  const [active, setActive] = useState('communication')
  const data     = DATA[lang] || DATA.fr
  const items    = data[active] || []
  const sec      = SECTIONS.find(s => s.id === active)
  const secColor = sec?.color || '#3A3D40'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-h1)', fontFamily: 'system-ui,sans-serif' }}>
      
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
          🇨🇦 {lang === 'fr' ? 'Culture canadienne' : 'Canadian Culture'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {lang === 'fr' ? 'Comprends les codes pour mieux t\'intégrer.' : 'Understand the codes to integrate better.'}
        </p>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              padding: '9px 18px', borderRadius: 10, border: `1px solid`,
              fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: active === s.id ? `${s.color}18` : 'transparent',
              borderColor: active === s.id ? `${s.color}50` : '#EBEBE9',
              color: active === s.id ? s.color : '#6B6F76',
            }}>
              {s.icon} {lang === 'fr' ? s.fr : s.en}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--bg-subtle)' }} />
              <span style={{ fontSize: 26, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-h1)', marginBottom: 8 }}>{item.titre}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 }}>{item.texte}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: '14px 18px', background: '#0E111610', border: `1px solid ${'#0E1116'}30`, borderRadius: 12, marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.65 }}>
            💡 {lang === 'fr'
              ? "L'intégration culturelle n'est pas une trahison de tes racines — c'est la capacité de fonctionner dans deux cultures simultanément."
              : "Cultural integration is not a betrayal of your roots — it's the ability to function in two cultures simultaneously."}
          </p>
        </div>

        {/* ── SECTION QUIZ ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-h1)', marginBottom: 6 }}>
            🎮 {lang === 'fr' ? 'Teste tes connaissances' : 'Test your knowledge'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            {lang === 'fr'
              ? 'Quiz interactif sur les codes sociaux, l\'hiver, le travail et les finances au Canada.'
              : 'Interactive quiz on social codes, winter, work and finances in Canada.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { id:'codes_sociaux', emoji:'🤝', fr:'Codes sociaux',    en:'Social Codes',    color:'var(--text-h1)' },
              { id:'hiver',         emoji:'❄️', fr:"Survivre à l'hiver", en:'Surviving Winter', color:'var(--text-muted)' },
              { id:'travail',       emoji:'💼', fr:'Culture du travail',en:'Work Culture',    color:'var(--text-muted)' },
              { id:'finances',      emoji:'💳', fr:'Finances & banque', en:'Finance & Banking',color:'var(--text-h1)' },
            ].map(q => (
              <a key={q.id} href={`/quiz-culture?cat=${q.id}`}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:q.color+'10', border:`1px solid ${q.color}30`, borderRadius:11, textDecoration:'none' }}>
                <span style={{ fontSize:20 }}>{q.emoji}</span>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-h1)' }}>{lang==='fr'?q.fr:q.en}</p>
              </a>
            ))}
          </div>
          <a href="/quiz-culture"
            style={{ display:'block', textAlign:'center', padding:'11px', background: '#0E1116', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none' }}>
            {lang === 'fr' ? '🎮 Commencer le quiz →' : '🎮 Start the quiz →'}
          </a>
        </div>

        {/* ── Intégration communautaire ── */}
        <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🤝</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1, margin: 0, lineHeight: 1.6 }}>
            {lang === 'fr'
              ? 'Tu veux approfondir ton intégration avec quelqu\'un qui a vécu ce que tu vis ?'
              : 'Want to deepen your integration with someone who\'s been through it?'}
          </p>
          <a href="/parrainage" style={{ fontSize: 13, color: 'var(--text-body)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {lang === 'fr' ? 'Trouver un parrain →' : 'Find a peer mentor →'}
          </a>
        </div>

        <FeedbackSection page="culture" />
      </main>
    </div>
  )
}
