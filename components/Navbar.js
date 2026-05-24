// components/Navbar.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { C, t, lang, setLang, theme, setTheme, user, profile } = useApp()
  const router = useRouter()

  const logout = async () => { const { createClient } = await import('@supabase/supabase-js'); const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); await sb.auth.signOut(); window.location.href = '/' }

  const links = [
    { href:'/dashboard',  label: t.nav_checklist },
    { href:'/culture',    label: t.nav_culture    },
    { href:'/day-to-day', label: t.nav_daily      },
    { href:'/todo',       label: t.nav_todo        },
    { href:'/arrivee',    label: t.nav_arrival     },
    { href:'/mentors',    label: t.nav_mentors     },
  ]

  const isActive = (href) => router.pathname === href

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'dark' ? 'rgba(15,15,15,0.92)' : 'rgba(250,250,249,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>N</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text, letterSpacing: -0.3 }}>novae</span>
        </Link>

        {/* Links — desktop */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="nav-desktop">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: isActive(l.href) ? C.accent2 : C.muted,
              background: isActive(l.href) ? `${C.accent}15` : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Lang toggle */}
          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>

          {/* Theme toggle */}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/profile_1" style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${C.accent}20`,
                border: `1.5px solid ${C.accent}40`,
                color: C.accent2, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </Link>
              <a href="/logout" style={{
                padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
                background: 'transparent', color: C.muted, fontSize: 13, cursor: 'pointer',
              }}>
                {t.nav_logout}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <Link href="/auth/login" style={{
                padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: 'transparent', color: C.muted, fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}>{t.nav_login}</Link>
              <Link href="/auth/register" style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: C.accent, color: '#fff', fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
              }}>{t.nav_register}</Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) { .nav-desktop { display: none !important; } }
      `}</style>
    </nav>
  )
}



