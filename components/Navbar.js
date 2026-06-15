// components/Navbar.js — NOVAE v5 — Sidebar latérale
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

const PILIERS_NAV = [
  {
    emoji: '✈️',
    fr: 'Immigration',
    en: 'Immigration',
    paths: ['/dashboard', '/documents', '/echeances', '/arrivee'],
    links: [
      { href: '/dashboard',  fr: 'Dashboard',        en: 'Dashboard'      },
      { href: '/documents',  fr: '📁 Documents',     en: '📁 Documents'   },
      { href: '/echeances',  fr: '📅 Échéances',     en: '📅 Deadlines'   },
      { href: '/arrivee',    fr: "Guide d'arrivée",  en: 'Arrival guide'  },
    ],
  },
  {
    emoji: '🎓',
    fr: 'Académie',
    en: 'Academia',
    paths: ['/mon-avenir', '/bourses', '/orientation-type', '/simulateur-budget', '/calendrier-academique'],
    links: [
      { href: '/mon-avenir',            fr: 'Mon Orientation',      en: 'My Path'             },
      { href: '/bourses',               fr: 'Bourses & Univs',      en: 'Scholarships'        },
      { href: '/orientation-type',      fr: '🏛️ Univ. ou Collège', en: '🏛️ Univ. or College' },
      { href: '/simulateur-budget',     fr: '💰 Budget',            en: '💰 Budget'           },
      { href: '/calendrier-academique', fr: '🗓️ Calendrier',        en: '🗓️ Calendar'         },
    ],
  },
  {
    emoji: '💼',
    fr: 'Carrière',
    en: 'Career',
    paths: ['/mentors', '/cv', '/entrevue', '/reseau'],
    links: [
      { href: '/mentors',  fr: 'Mentors',       en: 'Mentors'         },
      { href: '/cv',       fr: 'CV canadien',   en: 'Canadian Resume' },
      { href: '/entrevue', fr: 'Entrevue IA',   en: 'Mock Interview'  },
      { href: '/reseau',   fr: 'Mon Réseau',    en: 'My Network'      },
    ],
  },
  {
    emoji: '🏠',
    fr: 'Intégration',
    en: 'Integration',
    paths: ['/day-to-day', '/todo', '/bienetre', '/parrainage', '/culture', '/quiz-culture'],
    links: [
      { href: '/day-to-day',   fr: 'Vie quotidienne',   en: 'Daily life'       },
      { href: '/todo',         fr: 'Mes tâches',         en: 'My tasks'         },
      { href: '/bienetre',     fr: 'Bien-être',          en: 'Wellbeing'        },
      { href: '/parrainage',   fr: 'Parrainage',         en: 'Peer Mentoring'   },
      { href: '/culture',      fr: 'Culture canadienne', en: 'Canadian Culture' },
      { href: '/quiz-culture', fr: 'Quiz culture',       en: 'Culture Quiz'     },
    ],
  },
]

export default function Navbar() {
  const { t, lang, setLang, theme, setTheme, user, profile, userPlan, sb } = useApp()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isFr = lang === 'fr'

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(href + '/')

  const handleLogout = async () => {
    if (sb) await sb.auth.signOut()
    router.push('/')
  }

  // La sidebar est toujours verte foncée (indépendamment du theme)
  const sidebarBg     = '#1B4332'
  const sidebarBorder = 'rgba(255,255,255,0.1)'

  const navLinkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px 8px 16px',
    borderRadius: '8px',
    margin: '1px 8px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    fontWeight: active ? 600 : 400,
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    transition: 'all 0.15s ease',
  })

  const sidebarContent = (onLinkClick) => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '14px',
        }}>N</div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>novae</span>
      </div>

      {/* Nav piliers */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
        {PILIERS_NAV.map(pilier => (
          <div key={pilier.fr} style={{ marginBottom: '4px' }}>
            <div style={{
              padding: '4px 12px 2px 20px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>{pilier.emoji}</span>
              {isFr ? pilier.fr : pilier.en}
            </div>
            {pilier.links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onLinkClick}
                style={navLinkStyle(isActive(link.href))}
              >
                {isFr ? link.fr : link.en}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bas de sidebar */}
      <div style={{
        marginTop: 'auto',
        padding: '12px',
        borderTop: `1px solid ${sidebarBorder}`,
        flexShrink: 0,
      }}>
        {/* Badge Premium */}
        {user && userPlan === 'gratuit' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '12px',
            color: '#fff',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>⭐ {isFr ? 'Passer Premium' : 'Go Premium'}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', marginTop: '4px', lineHeight: 1.5 }}>
              {isFr ? 'Débloquez toutes les fonctionnalités et accélérez votre réussite.' : 'Unlock all features.'}
            </div>
            <button
              onClick={() => { router.push('/abonnement'); onLinkClick && onLinkClick() }}
              style={{
                marginTop: '10px',
                background: '#52B788',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {isFr ? 'Découvrir' : 'Discover'}
            </button>
          </div>
        )}

        {/* Mode sombre toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '8px 8px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: '4px',
          }}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? (isFr ? 'Mode clair' : 'Light mode') : (isFr ? 'Mode sombre' : 'Dark mode')}</span>
        </button>

        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '8px 8px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: '8px',
            fontWeight: 500,
          }}
        >
          <span>🌐</span>
          <span>{lang === 'fr' ? 'English' : 'Français'}</span>
        </button>

        {/* Profil + déconnexion */}
        {user ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
          }}>
            <Link href="/profile_1" onClick={onLinkClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: '0.9rem',
                flexShrink: 0,
              }}>
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600, fontSize: '0.8rem', color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {profile?.full_name || user.email?.split('@')[0] || 'Mon profil'}
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', flexShrink: 0,
                padding: '4px 6px',
              }}
              title={isFr ? 'Déconnexion' : 'Logout'}
            >
              {isFr ? 'Déco' : 'Out'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link href="/auth/login" onClick={onLinkClick} style={{ display: 'block', padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? 'Connexion' : 'Login'}
            </Link>
            <Link href="/auth/register" onClick={onLinkClick} style={{ display: 'block', padding: '9px', borderRadius: '8px', border: 'none', background: '#52B788', color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? "S'inscrire" : 'Sign up'}
            </Link>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── SIDEBAR DESKTOP ─────────────────────────────────────── */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: sidebarBg,
        borderRight: `1px solid ${sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
        transition: 'width 0.2s ease',
      }} className="sidebar-desktop">
        {sidebarContent(null)}
      </aside>

      {/* ── HAMBURGER MOBILE ────────────────────────────────────── */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: '16px', left: '16px',
          zIndex: 150,
          width: '40px', height: '40px',
          borderRadius: '10px',
          border: `1px solid ${sidebarBorder}`,
          background: sidebarBg,
          color: '#fff',
          fontSize: '18px',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* ── OVERLAY MOBILE ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 190,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── SIDEBAR MOBILE DRAWER ───────────────────────────────── */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: sidebarBg,
        borderRight: `1px solid ${sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        overflowY: 'auto',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: mobileOpen ? 'var(--shadow-lg)' : 'none',
      }} className="sidebar-mobile">
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute', top: '16px', right: '12px',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)',
            fontSize: '18px', cursor: 'pointer', lineHeight: 1,
          }}
        >✕</button>
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
