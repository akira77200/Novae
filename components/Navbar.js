// components/Navbar.js — NOVAE v5 — Sidebar latérale
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

// ── Icônes SVG monochromes ─────────────────────────────────────────
const IconPlane = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
)
const IconGradCap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)
const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
    <path d="M2 12h20"/>
  </svg>
)
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
const IconSun = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

const PILIERS_NAV = [
  { Icon: IconPlane,     fr: 'Immigration', en: 'Immigration', paths: ['/dashboard', '/documents', '/echeances', '/arrivee'],                                                                    href: '/dashboard'  },
  { Icon: IconGradCap,   fr: 'Académie',    en: 'Academia',    paths: ['/mon-avenir', '/bourses', '/orientation-type', '/simulateur-budget', '/calendrier-academique'],                          href: '/mon-avenir'  },
  { Icon: IconBriefcase, fr: 'Carrière',    en: 'Career',      paths: ['/mentors', '/cv', '/entrevue', '/reseau'],                                                                              href: '/mentors'     },
  { Icon: IconHome,      fr: 'Intégration', en: 'Integration', paths: ['/day-to-day', '/todo', '/bienetre', '/parrainage', '/culture', '/quiz-culture'],                                        href: '/day-to-day'  },
]

export default function Navbar() {
  const { t, lang, theme, setTheme, user, profile, userPlan, sb } = useApp()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isFr = lang === 'fr'

  const isActive = (paths) => paths.some(p => router.pathname === p || router.pathname.startsWith(p + '/'))

  const handleLogout = async () => {
    if (sb) await sb.auth.signOut()
    router.push('/')
  }

  const sidebarBg     = 'var(--sidebar-bg)'
  const sidebarBorder = 'var(--sidebar-border)'

  const pilierLinkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    margin: '2px 8px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s ease',
    letterSpacing: 0,
  })

  const sidebarContent = (onLinkClick) => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30,
          background: '#FFFFFF',
          borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1E3A5F', fontWeight: 800, fontSize: 15,
          flexShrink: 0,
        }}>N</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '-0.02em' }}>novae</span>
      </div>

      {/* Nav — 4 piliers avec icônes SVG */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {PILIERS_NAV.map(pilier => {
          const active = isActive(pilier.paths)
          return (
            <Link
              key={pilier.fr}
              href={pilier.href}
              onClick={onLinkClick}
              style={pilierLinkStyle(active)}
            >
              <pilier.Icon />
              {isFr ? pilier.fr : pilier.en}
            </Link>
          )
        })}
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
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '14px 12px',
            marginBottom: 10,
            color: 'var(--sidebar-text-active)',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>⭐ {isFr ? 'Passer Premium' : 'Go Premium'}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>
              {isFr ? 'Débloquez toutes les fonctionnalités et accélérez votre réussite.' : 'Unlock all features.'}
            </div>
            <button
              onClick={() => { router.push('/abonnement'); onLinkClick && onLinkClick() }}
              style={{
                marginTop: 10,
                background: 'var(--btn-premium-bg)',
                color: 'var(--btn-premium-color)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
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
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 8px', borderRadius: 8,
            border: 'none', background: 'transparent',
            color: '#94A3B8', fontSize: 13,
            cursor: 'pointer', marginBottom: 8,
          }}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
          <span>{theme === 'dark' ? (isFr ? 'Mode clair' : 'Light mode') : (isFr ? 'Mode sombre' : 'Dark mode')}</span>
        </button>

        {/* Profil + déconnexion */}
        {user ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 8, borderRadius: 8,
            background: 'var(--sidebar-bg-hover)',
          }}>
            <Link href="/profile_1" onClick={onLinkClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'var(--sidebar-text-active)', fontSize: '0.9rem',
                flexShrink: 0,
              }}>
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600, fontSize: '0.8rem', color: 'var(--sidebar-text-active)',
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
                color: 'var(--sidebar-icon)', fontSize: '0.75rem', flexShrink: 0,
                padding: '4px 6px',
              }}
              title={isFr ? 'Déconnexion' : 'Logout'}
            >
              {isFr ? 'Déco' : 'Out'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Link href="/auth/login" onClick={onLinkClick} style={{ display: 'block', padding: 9, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--sidebar-text)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? 'Connexion' : 'Login'}
            </Link>
            <Link href="/auth/register" onClick={onLinkClick} style={{ display: 'block', padding: 9, borderRadius: 8, border: 'none', background: 'var(--btn-premium-bg)', color: 'var(--btn-premium-color)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
              {isFr ? "S'inscrire" : 'Sign up'}
            </Link>
          </div>
        )}

        {/* Copyright */}
        <div style={{ marginTop: 12, fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          © 2024 Novae
        </div>
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
          background: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text-active)',
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
