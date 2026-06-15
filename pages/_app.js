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
        <meta name="theme-color" content="#1B4332" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Novae" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root {
          --novae-primary: #1B4332;
          --novae-primary-light: #2D6A4F;
          --novae-primary-pale: #D8F3DC;
          --novae-accent: #52B788;
          --novae-accent-soft: #95D5B2;

          --novae-bg: #F8F9FA;
          --novae-surface: #FFFFFF;
          --novae-surface-2: #F1F3F5;
          --novae-border: #E9ECEF;
          --novae-text: #1A1A2E;
          --novae-text-secondary: #6C757D;
          --novae-text-muted: #ADB5BD;

          --novae-bg-dark: #0F1A14;
          --novae-surface-dark: #162820;
          --novae-surface-2-dark: #1B3028;
          --novae-border-dark: rgba(45,106,79,0.19);
          --novae-text-dark: #F8F9FA;
          --novae-text-secondary-dark: #95D5B2;

          --novae-success: #40C057;
          --novae-warning: #FAB005;
          --novae-danger: #FA5252;
          --novae-info: #4DABF7;

          --sidebar-width: 220px;
          --sidebar-collapsed: 72px;
          --topbar-height: 64px;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --border-radius-lg: 16px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
          --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);

          --font-display: 'Inter', -apple-system, sans-serif;
          --font-size-xs: 0.75rem;
          --font-size-sm: 0.875rem;
          --font-size-base: 1rem;
          --font-size-lg: 1.125rem;
          --font-size-xl: 1.25rem;
          --font-size-2xl: 1.5rem;
          --font-size-3xl: 2rem;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font-display); }
        input, button, textarea, select { font-family: inherit; }
        a { color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 3px; }
        ::selection { background: rgba(45,106,79,0.25); }
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
