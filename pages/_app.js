// pages/_app.js
import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { AppProvider, useApp } from '../context/AppContext'
import NovaChat from '../components/NovaChat'
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

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[SW] Novae offline ready'))
        .catch(err => console.warn('[SW] Error:', err))
    }
  }, [])

  if (isPublic) {
    return <Component {...pageProps} />
  }

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        minHeight: '100vh',
        flex: 1,
        background: theme === 'dark' ? 'var(--novae-bg-dark)' : 'var(--novae-bg)',
        transition: 'margin-left 0.2s ease',
        padding: '32px 36px',
      }}>
        <Component {...pageProps} />
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          main { margin-left: 0 !important; }
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
        <meta name="theme-color" content="#1E3A5F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Novae" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root {
          /* ── Sidebar ── */
          --sidebar-bg: #1E3A5F;
          --sidebar-bg-hover: #25487A;
          --sidebar-text: #CBD5E1;
          --sidebar-text-active: #FFFFFF;
          --sidebar-icon: #94A3B8;
          --sidebar-border: #16304F;
          --sidebar-logo-text: #1E3A5F;

          /* ── Fond & cards ── */
          --bg-page: #F8F9FA;
          --bg-card: #FFFFFF;
          --border-default: #E2E8F0;
          --border-strong: #CBD5E1;

          /* ── Couleurs ── */
          --color-primary: #3B82F6;
          --color-primary-light: #DBEAFE;
          --accent-light: #3B82F6;
          --color-success: #22C55E;
          --color-success-light: #D1FAE5;
          --color-warning: #F59E0B;
          --color-danger: #EF4444;

          /* ── Texte ── */
          --text-primary: #0F172A;
          --text-secondary: #475569;
          --text-muted: #94A3B8;

          /* ── Boutons ── */
          --btn-primary-bg: #1E3A5F;
          --btn-primary-hover: #25487A;
          --btn-premium-bg: #FFFFFF;
          --btn-premium-color: #1E3A5F;
          --btn-premium-hover: #F1F5F9;

          /* ── Dark mode (héritage) ── */
          --novae-bg-dark: #0D1B2E;
          --novae-surface-dark: #132035;
          --novae-surface-2-dark: #1A2D47;
          --novae-border-dark: rgba(59,130,246,0.15);
          --novae-text-dark: #F1F5F9;
          --novae-text-secondary-dark: #94A3B8;

          /* ── Compatibilité héritage ── */
          --novae-primary: #1E3A5F;
          --novae-primary-light: #25487A;
          --novae-primary-pale: #DBEAFE;
          --novae-accent: #3B82F6;
          --novae-accent-soft: #93C5FD;
          --novae-bg: #F8F9FA;
          --novae-surface: #FFFFFF;
          --novae-surface-2: #F8F9FA;
          --novae-border: #E2E8F0;
          --novae-text: #0F172A;
          --novae-text-secondary: #475569;
          --novae-text-muted: #94A3B8;
          --novae-success: #22C55E;
          --novae-warning: #F59E0B;
          --novae-danger: #EF4444;
          --novae-info: #3B82F6;

          --sidebar-width: 188px;
          --sidebar-collapsed: 72px;
          --topbar-height: 64px;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --border-radius-lg: 16px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
          --shadow-lg: 0 10px 15px rgba(0,0,0,0.08);

          --font: 'Inter', -apple-system, sans-serif;
          --font-display: 'Inter', -apple-system, sans-serif;
          --font-size-xs: 11px;
          --font-size-sm: 13px;
          --font-size-base: 14px;
          --font-size-lg: 16px;
          --font-size-xl: 18px;
          --font-size-2xl: 22px;
          --font-size-3xl: 28px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font); background: var(--bg-page); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        input, button, textarea, select { font-family: inherit; }
        a { color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 3px; }
        ::selection { background: rgba(59,130,246,0.25); }
      `}</style>

      <AppLayout Component={Component} pageProps={pageProps} />
      <NovaChat />
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
