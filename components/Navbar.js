// components/Navbar.js — NOVAE — Sidebar boussole avec accordéon
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

// ── Icônes SVG stroke monochromes ─────────────────────────────────
const IconPlane = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
)
const IconGradCap = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)
const IconBriefcase = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <path d="M2 12h20"/>
  </svg>
)
const IconHome = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6F76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6F76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconChevron = ({ open }) => (
  <svg
    width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ── Logo boussole ─────────────────────────────────────────────────
const LogoCompass = ({ light = true }) => {
  const ringColor = light ? '#FAFAF8' : '#0E1116'
  const dotColor  = light ? '#FAFAF8' : '#0E1116'
  return (
    <div style={{
      width: 22, height: 22,
      border: `1.5px solid ${ringColor}`,
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, background: dotColor, borderRadius: '50%' }} />
    </div>
  )
}

// ── Structure de navigation avec sous-items ────────────────────────
// /orientation-type est dans paths d'Académie pour l'active detection,
// mais n'apparaît PAS comme sous-item (accessible depuis mon-avenir.js).
const PILIERS_NAV = [
  {
    Icon: IconPlane,
    fr: 'Immigration', en: 'Immigration',
    paths: ['/dashboard', '/documents', '/echeances', '/arrivee'],
    items: [
      { fr: 'Dashboard',  en: 'Dashboard',  href: '/dashboard' },
      { fr: 'Documents',  en: 'Documents',  href: '/documents' },
      { fr: 'Échéances',  en: 'Deadlines',  href: '/echeances' },
      { fr: 'Arrivée',    en: 'Arrival',    href: '/arrivee' },
    ],
  },
  {
    Icon: IconGradCap,
    fr: 'Académie', en: 'Academia',
    paths: ['/mon-avenir', '/bourses', '/calendrier-academique', '/orientation-type'],
    items: [
      { fr: 'Mon Avenir',  en: 'My Future',    href: '/mon-avenir' },
      { fr: 'Bourses',     en: 'Scholarships', href: '/bourses' },
      { fr: 'Calendrier',  en: 'Calendar',     href: '/calendrier-academique' },
    ],
  },
  {
    Icon: IconBriefcase,
    fr: 'Carrière', en: 'Career',
    paths: ['/cv', '/entrevue', '/reseau', '/mon-avenir'],
    items: [
      { fr: 'CV',         en: 'Resume',    href: '/cv' },
      { fr: 'Réseau',     en: 'Network',   href: '/reseau' },
      { fr: 'Entrevue',   en: 'Interview', href: '/entrevue' },
      { fr: 'Mon Avenir', en: 'My Future', href: '/mon-avenir' },
    ],
  },
  {
    Icon: IconHome,
    fr: 'Intégration', en: 'Integration',
    paths: ['/day-to-day', '/simulateur-budget', '/bienetre', '/culture', '/quiz-culture', '/mentors', '/parrainage', '/todo'],
    items: [
      { fr: 'Quotidien',    en: 'Daily life',     href: '/day-to-day' },
      { fr: 'Budget',       en: 'Budget',         href: '/simulateur-budget' },
      { fr: 'Bien-être',    en: 'Well-being',     href: '/bienetre' },
      { fr: 'Culture',      en: 'Culture',        href: '/culture' },
      { fr: 'Quiz culture', en: 'Culture quiz',   href: '/quiz-culture' },
      { fr: 'Mentors',      en: 'Mentors',        href: '/mentors' },
      { fr: 'Parrainage',   en: 'Peer mentoring', href: '/parrainage' },
      { fr: 'Todo',         en: 'Todo',           href: '/todo' },
    ],
  },
]

export default function Navbar() {
  const { t, lang, setLang, theme, setTheme, user, profile, userPlan, sb } = useApp()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null)

  const isFr = lang === 'fr'

  const isActiveSection = (paths) =>
    paths.some(p => router.pathname === p || router.pathname.startsWith(p + '/'))

  const isActiveItem = (href) =>
    router.pathname === href || router.pathname.startsWith(href + '/')

  // Auto-ouvre la section correspondant à la page courante
  useEffect(() => {
    const idx = PILIERS_NAV.findIndex(p => isActiveSection(p.paths))
    setOpenSection(idx >= 0 ? idx : null)
  }, [router.pathname])

  const handleLogout = async () => {
    if (sb) await sb.auth.signOut()
    router.push('/')
  }

  const toggleSection = (idx) => {
    setOpenSection(prev => prev === idx ? null : idx)
  }

  const sidebarContent = (onLinkClick) => (
    <>
      {/* Logo boussole */}
      <div style={{ padding: '22px 16px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <LogoCompass light />
        <span style={{ fontWeight: 600, fontSize: 13, color: '#FAFAF8', letterSpacing: '-0.01em' }}>novae</span>
      </div>

      {/* Navigation accordéon */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {PILIERS_NAV.map((pilier, idx) => {
          const sectionActive = isActiveSection(pilier.paths)
          const isOpen = openSection === idx
          const headerColor = sectionActive ? '#FAFAF8' : '#6B6F76'

          return (
            <div key={pilier.fr} style={{ margin: '2px 0' }}>
              {/* En-tête de section — cliquable pour toggle */}
              <button
                onClick={() => toggleSection(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: sectionActive ? 500 : 400,
                  color: headerColor,
                  background: sectionActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'background 0.12s, color 0.12s',
                  textAlign: 'left',
                }}
              >
                <pilier.Icon color={headerColor} />
                <span style={{ flex: 1 }}>{isFr ? pilier.fr : pilier.en}</span>
                <span style={{ color: headerColor, opacity: 0.6 }}>
                  <IconChevron open={isOpen} />
                </span>
              </button>

              {/* Sous-items — visibles uniquement quand section ouverte */}
              {isOpen && (
                <div style={{ paddingLeft: 12, marginTop: 2, marginBottom: 4 }}>
                  {pilier.items.map(item => {
                    const itemActive = isActiveItem(item.href)
                    return (
                      <Link
                        key={item.href + item.fr}
                        href={item.href}
                        onClick={onLinkClick}
                        style={{
                          display: 'block',
                          padding: '5px 10px 5px 22px',
                          borderRadius: 5,
                          margin: '1px 0',
                          fontSize: 12,
                          fontWeight: itemActive ? 500 : 400,
                          color: itemActive ? '#FAFAF8' : '#6B6F76',
                          background: itemActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                          textDecoration: 'none',
                          transition: 'background 0.1s, color 0.1s',
                          borderLeft: itemActive ? '2px solid rgba(255,255,255,0.35)' : '2px solid transparent',
                          lineHeight: 1.4,
                        }}
                      >
                        {isFr ? item.fr : item.en}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div style={{ padding: '10px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>

        {/* Bloc Premium */}
        {user && userPlan === 'gratuit' && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8,
            padding: '12px',
            marginBottom: 8,
          }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#FAFAF8', marginBottom: 4 }}>
              {isFr ? 'Passer Premium' : 'Go Premium'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
              {isFr ? 'Débloquez toutes les fonctionnalités.' : 'Unlock all features.'}
            </div>
            <button
              onClick={() => { router.push('/abonnement'); onLinkClick && onLinkClick() }}
              style={{
                background: 'var(--btn-premium-bg)', color: 'var(--btn-premium-color)',
                border: 'none', borderRadius: 6,
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', width: '100%',
              }}
            >
              {isFr ? 'Découvrir' : 'Discover'}
            </button>
          </div>
        )}

        {/* Sélecteur de langue */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 2px 6px', alignItems: 'center' }}>
          {['fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
                background: lang === l ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: lang === l ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                fontSize: 12, fontWeight: lang === l ? 600 : 400, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Mode sombre */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '7px 10px', borderRadius: 6,
            border: 'none', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 6,
          }}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
          <span>{theme === 'dark' ? (isFr ? 'Mode clair' : 'Light mode') : (isFr ? 'Mode sombre' : 'Dark mode')}</span>
        </button>

        {/* Profil */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
            <Link href="/profile_1" onClick={onLinkClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#FAFAF8', fontSize: 11, flexShrink: 0 }}>
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#FAFAF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || user.email?.split('@')[0] || 'Profil'}
              </span>
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, flexShrink: 0, padding: '2px 4px' }} title={isFr ? 'Déconnexion' : 'Logout'}>
              {isFr ? 'Déco' : 'Out'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Link href="/auth/login" onClick={onLinkClick} style={{ display: 'block', padding: '7px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? 'Connexion' : 'Login'}
            </Link>
            <Link href="/auth/register" onClick={onLinkClick} style={{ display: 'block', padding: '7px', borderRadius: 6, background: '#FAFAF8', color: 'var(--text-h1)', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? "S'inscrire" : 'Sign up'}
            </Link>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>© 2024 Novae</div>
      </div>
    </>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        width: 'var(--sidebar-width)', height: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100, overflowY: 'auto',
      }} className="sidebar-desktop">
        {sidebarContent(null)}
      </aside>

      {/* Hamburger mobile */}
      <button className="hamburger-btn" onClick={() => setMobileOpen(true)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 300, width: 38, height: 38, borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)', background: 'var(--bg-sidebar)', color: '#FAFAF8', fontSize: 16, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Menu">☰</button>

      {/* Overlay mobile */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(3px)' }} />}

      {/* Sidebar mobile */}
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 'var(--sidebar-width)', height: '100vh', background: 'var(--bg-sidebar)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 200, overflowY: 'auto', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' }} className="sidebar-mobile">
        <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 14, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 16, cursor: 'pointer' }}>✕</button>
        {sidebarContent(() => setMobileOpen(false))}
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile { display: none !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}
