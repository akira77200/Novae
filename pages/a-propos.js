// pages/a-propos.js — NOVAE — Page d'introduction / vision
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

const LogoCompass = () => (
  <div style={{
    width: 26, height: 26,
    border: '1.5px solid var(--text-h1)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <div style={{ width: 7, height: 7, background: 'var(--text-h1)', borderRadius: '50%' }} />
  </div>
)

const SkylineSVG = () => (
  <svg
    style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: '45%', opacity: 'var(--skyline-opacity)', pointerEvents: 'none', zIndex: 0 }}
    viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax slice"
  >
    <rect x="320" y="60"  width="30" height="140" fill="var(--skyline-primary)"/>
    <rect x="280" y="80"  width="25" height="120" fill="var(--skyline-primary)"/>
    <rect x="240" y="100" width="20" height="100" fill="var(--skyline-secondary)"/>
    <rect x="200" y="70"  width="28" height="130" fill="var(--skyline-primary)"/>
    <rect x="160" y="110" width="22" height="90"  fill="var(--skyline-secondary)"/>
    <rect x="130" y="90"  width="18" height="110" fill="var(--skyline-primary)"/>
    <rect x="100" y="120" width="20" height="80"  fill="var(--skyline-secondary)"/>
    <rect x="60"  y="95"  width="26" height="105" fill="var(--skyline-primary)"/>
    <rect x="20"  y="130" width="24" height="70"  fill="var(--skyline-secondary)"/>
    <rect x="330" y="40"  width="8"  height="20"  fill="var(--skyline-primary)"/>
    <rect x="204" y="50"  width="6"  height="20"  fill="var(--skyline-secondary)"/>
    <rect x="283" y="62"  width="5"  height="18"  fill="var(--skyline-secondary)"/>
  </svg>
)

const CARDS = [
  {
    icon: '✈️',
    fr: 'Immigration',
    en: 'Immigration',
    descFr: 'Un dossier clair, étape par étape',
    descEn: 'A clear file, step by step',
  },
  {
    icon: '🎓',
    fr: 'Académie',
    en: 'Academia',
    descFr: 'Réussir sans naviguer seul',
    descEn: 'Succeed without navigating alone',
  },
  {
    icon: '💼',
    fr: 'Carrière',
    en: 'Career',
    descFr: 'Viser plus loin qu\'un emploi',
    descEn: 'Aim further than a job',
  },
  {
    icon: '🏠',
    fr: 'Intégration',
    en: 'Integration',
    descFr: 'Une communauté, pas un outil',
    descEn: 'A community, not just a tool',
  },
]

export default function APropos() {
  const router = useRouter()
  const { lang, setLang, user } = useApp()
  const isFr = lang === 'fr'

  const handleEnter = () => {
    router.push(user ? '/dashboard' : '/auth/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative', overflow: 'hidden' }}>
      <SkylineSVG />

      {/* Header barre */}
      <header style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoCompass />
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h1)', letterSpacing: '-0.01em' }}>novae</span>
        </div>

        {/* Sélecteur FR/EN */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                background: lang === l ? 'var(--accent)' : 'transparent',
                color: lang === l ? 'var(--bg-page)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: lang === l ? 600 : 400, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 0.5,
                transition: 'background 0.12s, color 0.12s',
              }}>
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{
        position: 'relative', zIndex: 1,
        maxWidth: 680, margin: '0 auto',
        padding: '48px 40px 80px',
      }}>
        {/* Titre */}
        <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.25, marginBottom: 40, color: 'var(--text-h1)' }}>
          {isFr ? 'On ne peut pas refaire le monde.' : 'We can\'t remake the world.'}<br />
          <span style={{ color: 'var(--text-muted)' }}>
            {isFr
              ? 'Mais on peut éviter à d\'autres nos erreurs.'
              : 'But we can help others avoid our mistakes.'}
          </span>
        </h1>

        {/* Paragraphes */}
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', marginBottom: 24 }}>
          {isFr
            ? 'NOVAE est né d\'une expérience vécue, et d\'un constat répété chez beaucoup d\'étudiants internationaux : on arrive plein d\'espoir, et on apprend les bonnes pratiques trop tard — souvent après avoir déjà trébuché.'
            : 'NOVAE was born from lived experience, and from a pattern we kept seeing among international students: you arrive full of hope, and learn the right moves too late — often after you\'ve already stumbled.'}
        </p>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', marginBottom: 24 }}>
          {isFr
            ? 'Notre objectif n\'est pas de supprimer les épreuves. C\'est de préparer, d\'organiser, et de prévenir — pour qu\'à la fin du parcours, chacun soit vraiment prêt à saisir les opportunités.'
            : 'Our goal isn\'t to remove the challenges. It\'s to prepare, organize, and prevent — so that by the end of the journey, everyone is truly ready to seize the opportunities ahead.'}
        </p>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', marginBottom: 48 }}>
          {isFr
            ? 'Pas seulement décrocher un emploi. Devenir celles et ceux qui bâtissent — entrepreneurs, leaders, porteurs de solutions, ici comme dans leur pays d\'origine.'
            : 'Not just landing a job. Becoming the ones who build — entrepreneurs, leaders, problem-solvers, here and in their home countries.'}
        </p>

        {/* Grille 4 cards */}
        <div className="apropos-grid" style={{ marginBottom: 48 }}>
          {CARDS.map(card => (
            <div key={card.fr} style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h1)', marginBottom: 4 }}>
                {isFr ? card.fr : card.en}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {isFr ? card.descFr : card.descEn}
              </div>
            </div>
          ))}
        </div>

        {/* Bouton CTA */}
        <button
          onClick={handleEnter}
          style={{
            padding: '14px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--bg-page)',
            fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {isFr ? 'Entrer dans NOVAE →' : 'Enter NOVAE →'}
        </button>
      </main>

      <style jsx global>{`
        .apropos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) {
          .apropos-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          main {
            padding: 32px 20px 60px !important;
          }
          header {
            padding: 16px 20px !important;
          }
          h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
