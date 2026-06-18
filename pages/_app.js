// pages/_app.js
import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { AppProvider, useApp } from '../context/AppContext'

import Navbar from '../components/Navbar'

// ── ErrorBoundary global ──────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Erreur capturée:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--novae-bg-dark)',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ color: 'var(--novae-primary-light)', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
            Quelque chose s'est mal passé
          </h1>
          <p style={{ color: 'var(--novae-text-muted)', marginBottom: '2rem', maxWidth: 400, lineHeight: 1.6 }}>
            Une erreur inattendue s'est produite. L'équipe Novae a été notifiée.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ background: 'transparent', color: 'var(--novae-accent)', border: '1px solid var(--novae-primary-light)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
              Réessayer
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{ background: 'var(--novae-primary-light)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Pages publiques (sans sidebar) ───────────────────────────────
const PUBLIC_PAGES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
]

// ── Layout avec sidebar ───────────────────────────────────────────
function AppLayout({ Component, pageProps }) {
  const router = useRouter()
  const { theme } = useApp()
  const isPublic = PUBLIC_PAGES.includes(router.pathname)

  // Synchronise le state React "theme" vers l'attribut DOM data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[SW] Novae offline ready'))
        .catch(err => console.warn('[SW] Error:', err))
    } else {
      // Dev mode : désinscrit tous les SW existants pour éviter le cache stale
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.unregister())
        if (registrations.length > 0) console.log(`[SW] ${registrations.length} worker(s) désinscrit(s) (dev mode)`)
      })
    }
  }, [])

  if (isPublic) {
    return <Component {...pageProps} />
  }

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <main className="novae-main" style={{
        minHeight: '100vh',
        flex: 1,
        background: 'var(--bg-page)',
      }}>
        <Component {...pageProps} />
      </main>

      <style jsx global>{`
        .novae-main {
          margin-left: var(--sidebar-width);
          padding: 36px 40px;
          transition: margin-left 0.2s ease;
        }
        @media (max-width: 768px) {
          .novae-main {
            margin-left: 0;
            padding: 16px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────
function AppContent({ Component, pageProps }) {
  return (
    <AppProvider>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0E1116" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Novae" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root {
          /* ── Fonds ── */
          --bg-page:           #FAFAF9;
          --bg-card:           #FFFFFF;
          --bg-sidebar:        #0E1116;
          --bg-sidebar-hover:  rgba(255,255,255,0.08);
          --bg-sidebar-active: rgba(255,255,255,0.08);

          /* ── Texte ── */
          --text-h1:             #0E1116;
          --text-body:           #3A3D40;
          --text-muted:          #6B6F76;
          --text-faint:          #9A9D9F;
          --text-sidebar:        #6B6F76;
          --text-sidebar-active: #FAFAF8;

          /* ── Bordures ── */
          --border:        #EBEBE9;
          --border-strong: #D5D5D2;

          /* ── Accent unique (noir) ── */
          --accent:      #0E1116;
          --accent-soft: rgba(14,17,22,0.08);

          /* ── Badges statut ── */
          --bg-subtle:         #F7F7F5;

          --badge-done-bg:   #F0F0EE;
          --badge-done-text: #3A3D40;
          --badge-todo-bg:   #F7F7F5;
          --badge-todo-text: #6B6F76;

          /* ── Erreur/danger uniquement ── */
          --color-danger: #DC2626;

          /* ── Compatibilité héritage (autres pages) ── */
          --bg-page-legacy:      #FAFAF9;
          --novae-bg:            #FAFAF9;
          --novae-surface:       #FFFFFF;
          --novae-surface-2:     #F7F7F5;
          --novae-border:        #EBEBE9;
          --novae-text:          #0E1116;
          --novae-text-secondary:#6B6F76;
          --novae-text-muted:    #9A9D9F;
          --novae-accent:        #0E1116;
          --novae-accent-soft:   rgba(14,17,22,0.08);
          --novae-primary:       #0E1116;
          --novae-primary-light: #3A3D40;
          --novae-primary-pale:  #F0F0EE;
          --novae-success:       #3A3D40;
          --novae-warning:       #6B6F76;
          --novae-danger:        #DC2626;
          --novae-info:          #3A3D40;
          --novae-bg-dark:       #0E1116;
          --novae-surface-dark:  #0E1116;
          --novae-surface-2-dark:#3A3D40;
          --novae-border-dark:   rgba(255,255,255,0.08);
          --novae-text-dark:     #FAFAF8;
          --novae-text-secondary-dark: #9A9D9F;
          --btn-primary-bg:      #0E1116;
          --btn-primary-hover:   #3A3D40;
          --btn-premium-bg:      #FAFAF8;
          --btn-premium-color:   #0E1116;
          --btn-premium-hover:   #F0F0EE;
          --color-primary:       #0E1116;
          --color-primary-light: #F0F0EE;
          --color-success:       #3A3D40;
          --color-success-light: #F0F0EE;
          --color-warning:       #6B6F76;
          --border-default:      #EBEBE9;
          --text-primary:        #0E1116;
          --text-secondary:      #6B6F76;

          /* ── Dimensions ── */
          --sidebar-width:    188px;
          --sidebar-collapsed: 72px;
          --border-radius:     8px;
          --border-radius-sm:  6px;
          --border-radius-lg: 10px;
          --radius-sm:   6px;
          --radius-md:   8px;
          --radius-lg:  10px;
          --radius-pill: 999px;
          --shadow-card:  none;
          --shadow-hover: 0 1px 2px rgba(14,17,22,0.04);
          --shadow-sm:    none;
          --shadow-md:    0 1px 2px rgba(14,17,22,0.04);
          --shadow-lg:    0 2px 8px rgba(14,17,22,0.06);

          /* ── Typographie ── */
          --font:         'Inter', -apple-system, sans-serif;
          --font-display: 'Inter', -apple-system, sans-serif;
          --text-xs:   11px;
          --text-sm:   12px;
          --text-base: 13px;
          --text-md:   14px;
          --text-lg:   15px;
          --text-xl:   22px;
          --text-2xl:  48px;
          --font-size-xs:   11px;
          --font-size-sm:   13px;
          --font-size-base: 14px;
          --font-size-lg:   16px;
          --font-size-xl:   18px;
          --font-size-2xl:  22px;
          --font-size-3xl:  28px;

          /* ── Skyline décoratif header ── */
          --skyline-primary:   #0E1116;
          --skyline-secondary: #0E1116;
          --skyline-opacity:   0.08;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font); background: var(--bg-page); color: var(--text-body); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        input, button, textarea, select { font-family: inherit; }
        a { color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(14,17,22,0.12); border-radius: 2px; }
        ::selection { background: rgba(14,17,22,0.10); }

        /* ── Dark mode — Palette Nordique Sombre ── */
        [data-theme="dark"] {
          --bg-page:           #15171A;
          --bg-card:           #1C1F23;
          --bg-subtle:         #292C30;
          --bg-sidebar:        #0A0B0D;
          --bg-sidebar-hover:  rgba(255,255,255,0.06);
          --bg-sidebar-active: rgba(255,255,255,0.08);

          --text-h1:             #F2F2F0;
          --text-body:           #C7C8C6;
          --text-muted:          #8A8D90;
          --text-faint:          #818181;
          --text-sidebar:        #8A8D90;
          --text-sidebar-active: #F2F2F0;

          --border:        #383D45;
          --border-strong: #4A5058;

          --accent:      #F2F2F0;
          --accent-soft: rgba(242,242,240,0.08);

          --badge-done-bg:   #273027;
          --badge-done-text: #C7C8C6;
          --badge-todo-bg:   #322E27;
          --badge-todo-text: #B0ADA3;

          --shadow-card:  none;
          --shadow-hover: 0 1px 2px rgba(0,0,0,0.3);

          --novae-bg:            #15171A;
          --novae-surface:       #1C1F23;
          --novae-surface-2:     #292C30;
          --novae-border:        #383D45;
          --novae-text:          #F2F2F0;
          --novae-text-secondary:#8A8D90;
          --novae-text-muted:    #818181;
          --novae-primary:       #F2F2F0;
          --novae-primary-light: #C7C8C6;
          --novae-primary-pale:  #273027;
          --novae-bg-dark:       #0A0B0D;
          --novae-surface-dark:  #0A0B0D;
          --novae-surface-2-dark:#1C1F23;
          --btn-primary-bg:      #F2F2F0;
          --btn-premium-bg:      #F2F2F0;
          --btn-premium-color:   #0E1116;
          --color-primary:       #F2F2F0;
          --color-primary-light: #262925;
          --text-primary:        #F2F2F0;
          --text-secondary:      #8A8D90;
          --border-default:      #383D45;

          /* ── Skyline décoratif header ── */
          --skyline-primary:   #3A3D40;
          --skyline-secondary: #2A2D31;
          --skyline-opacity:   0.4;
        }
        [data-theme="dark"] body { background: var(--bg-page); color: var(--text-body); }
        [data-theme="dark"] input::placeholder,
        [data-theme="dark"] textarea::placeholder { color: var(--text-faint); }
      `}</style>

      <AppLayout Component={Component} pageProps={pageProps} />
    </AppProvider>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AppContent Component={Component} pageProps={pageProps} />
    </ErrorBoundary>
  )
}
