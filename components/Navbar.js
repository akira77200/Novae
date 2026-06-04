// components/Navbar.js — NOVAE v5 — 4 piliers + hamburger mobile
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

const PILIERS_NAV = [
  {
    emoji: '✈️',
    fr: 'Immigration',
    en: 'Immigration',
    color: '#1565C0',
    colorLight: '#42A5F5',
    paths: ['/dashboard', '/documents', '/echeances', '/arrivee'],
    links: [
      { href: '/dashboard',  fr: 'Checklist',       en: 'Checklist'      },
      { href: '/documents',  fr: '📁 Documents',    en: '📁 Documents'   },
      { href: '/echeances',  fr: '📅 Échéances',    en: '📅 Deadlines'   },
      { href: '/arrivee',    fr: 'Guide d\'arrivée',en: 'Arrival guide'  },
    ],
  },
  {
    emoji: '🎓',
    fr: 'Académie',
    en: 'Academia',
    color: '#6A1B9A',
    colorLight: '#AB47BC',
    paths: ['/culture', '/quiz-culture', '/bourses', '/orientation-type', '/simulateur-budget', '/calendrier-academique'],
    links: [
      { href: '/culture',               fr: 'Culture',               en: 'Culture'              },
      { href: '/quiz-culture',          fr: '🎮 Quiz culture',        en: '🎮 Culture quiz'      },
      { href: '/bourses',               fr: 'Bourses & Univs',       en: 'Scholarships'         },
      { href: '/orientation-type',      fr: '🏛️ Univ. ou Collège ?', en: '🏛️ Univ. or College?' },
      { href: '/simulateur-budget',     fr: '💰 Simulateur budget',  en: '💰 Budget simulator'  },
      { href: '/calendrier-academique', fr: '🗓️ Calendrier',         en: '🗓️ Calendar'          },
    ],
  },
  {
    emoji: '💼',
    fr: 'Carrière',
    en: 'Career',
    color: '#E65100',
    colorLight: '#FF7043',
    paths: ['/mon-avenir', '/mentors', '/cv', '/entrevue', '/reseau'],
    links: [
      { href: '/mon-avenir', fr: 'Mon Avenir',    en: 'My Future'       },
      { href: '/mentors',    fr: 'Mentors',        en: 'Mentors'         },
      { href: '/cv',         fr: 'Créer mon CV',   en: 'Build my Resume' },
      { href: '/entrevue',   fr: 'Entrevue IA',    en: 'Mock Interview'  },
      { href: '/reseau',     fr: '🎯 Mon Réseau',  en: '🎯 My Network'   },
    ],
  },
  {
    emoji: '🏠',
    fr: 'Intégration',
    en: 'Integration',
    color: '#2D6A4F',
    colorLight: '#52B788',
    paths: ['/day-to-day', '/todo', '/bienetre', '/parrainage', '/culture'],
    links: [
      { href: '/day-to-day', fr: 'Vie quotidienne',  en: 'Daily life'        },
      { href: '/todo',       fr: 'Mes tâches',        en: 'My tasks'          },
      { href: '/bienetre',   fr: '🌱 Bien-être',      en: '🌱 Wellbeing'      },
      { href: '/parrainage', fr: '🤝 Parrainage',     en: '🤝 Peer Mentoring' },
      { href: '/culture',    fr: 'Culture',            en: 'Culture'           },
    ],
  },
]

export default function Navbar() {
  const { C, t, lang, setLang, theme, setTheme, user, profile } = useApp()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const isFr = lang === 'fr'

  const activePilier = PILIERS_NAV.find(p =>
    p.paths.some(path => router.pathname === path || router.pathname.startsWith(path + '/'))
  )

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: theme === 'dark' ? 'rgba(15,15,15,0.92)' : 'rgba(250,250,249,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 20px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
            <span style={{ width:28, height:28, borderRadius:8, background: C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff' }}>N</span>
            <span style={{ fontWeight:700, fontSize:16, color: C.text, letterSpacing:-0.3 }}>novae</span>
          </Link>

          {/* Desktop — 4 piliers */}
          <div className="nav-desktop" style={{ display:'flex', gap:4, alignItems:'center' }}>
            {PILIERS_NAV.map(p => {
              const isActive = activePilier?.fr === p.fr
              return (
                <Link
                  key={p.fr}
                  href={p.links[0].href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 13px',
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? p.colorLight : C.muted,
                    background: isActive ? `${p.color}18` : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    borderBottom: isActive ? `2px solid ${p.colorLight}` : '2px solid transparent',
                  }}
                >
                  <span style={{ fontSize:14 }}>{p.emoji}</span>
                  {isFr ? p.fr : p.en}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>

            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="nav-desktop"
              style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:0.5 }}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="nav-desktop"
              style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Auth — desktop */}
            <div className="nav-desktop">
              {user ? (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Link href="/profile_1" style={{
                    width:32, height:32, borderRadius:'50%',
                    background:`${C.accent}20`, border:`1.5px solid ${C.accent}40`,
                    color: C.accent2, display:'flex', alignItems:'center',
                    justifyContent:'center', fontWeight:700, fontSize:13, textDecoration:'none',
                  }}>
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </Link>
                  <a href="/logout" style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:13, cursor:'pointer', textDecoration:'none' }}>
                    {t.nav_logout}
                  </a>
                </div>
              ) : (
                <div style={{ display:'flex', gap:6 }}>
                  <Link href="/auth/login" style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:13, fontWeight:500, textDecoration:'none' }}>
                    {t.nav_login}
                  </Link>
                  <Link href="/auth/register" style={{ padding:'6px 14px', borderRadius:8, border:'none', background: C.accent, color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                    {t.nav_register}
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              style={{ display:'none', width:36, height:36, borderRadius:9, border:`1px solid ${C.border}`, background:'transparent', color: C.text, fontSize:18, cursor:'pointer', alignItems:'center', justifyContent:'center', flexShrink:0 }}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ─────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          style={{ position:'fixed', inset:0, zIndex:49, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 280,
        zIndex: 50,
        background: theme === 'dark' ? '#141414' : '#fff',
        borderLeft: `1px solid ${C.border}`,
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0 0',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 16px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:7, background: C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>N</div>
            <span style={{ fontWeight:700, fontSize:15, color: C.text }}>novae</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background:'transparent', border:'none', color: C.muted, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        {/* Piliers */}
        <div style={{ padding:'12px 0', flexGrow:1 }}>
          {PILIERS_NAV.map(p => {
            const isPilierActive = activePilier?.fr === p.fr
            return (
              <div key={p.fr} style={{ marginBottom:4 }}>
                {/* Pilier header */}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderLeft:`3px solid ${isPilierActive ? p.colorLight : 'transparent'}` }}>
                  <span style={{ fontSize:17 }}>{p.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: isPilierActive ? p.colorLight : C.muted, letterSpacing:0.2 }}>
                    {isFr ? p.fr : p.en}
                  </span>
                </div>
                {/* Sub-links */}
                {p.links.map(l => {
                  const isLinkActive = router.pathname === l.href
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '9px 20px 9px 52px',
                        fontSize: 14,
                        color: isLinkActive ? p.colorLight : C.muted,
                        background: isLinkActive ? `${p.color}14` : 'transparent',
                        textDecoration: 'none',
                        fontWeight: isLinkActive ? 600 : 400,
                        transition: 'all 0.12s',
                      }}
                    >
                      {isFr ? l.fr : l.en}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Drawer footer */}
        <div style={{ padding:'16px 20px', borderTop:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:10 }}>
          {/* Lang + Theme */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:15, cursor:'pointer' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Auth */}
          {user ? (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <Link href="/profile_1" onClick={() => setMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:8, flex:1, padding:'9px 12px', borderRadius:9, border:`1px solid ${C.border}`, textDecoration:'none', color: C.text2, fontSize:13, fontWeight:600 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:`${C.accent}20`, color: C.accent2, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                {profile?.full_name || user.email?.split('@')[0] || 'Profil'}
              </Link>
              <a href="/logout" style={{ padding:'9px 14px', borderRadius:9, border:`1px solid ${C.border}`, color: C.muted, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
                {t.nav_logout}
              </a>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ padding:'11px', borderRadius:9, border:`1px solid ${C.border}`, background:'transparent', color: C.muted, fontSize:14, fontWeight:500, textDecoration:'none', textAlign:'center' }}>
                {t.nav_login}
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ padding:'11px', borderRadius:9, border:'none', background: C.accent, color:'#fff', fontSize:14, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                {t.nav_register}
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
