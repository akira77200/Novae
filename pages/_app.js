// pages/_app.js
import React, { useEffect } from 'react'
import Head from 'next/head'
import { AppProvider } from '../context/AppContext'
import NovaChat from '../components/NovaChat'

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
          background: '#0F1A14',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui,sans-serif',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ color: '#2D6A4F', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
            Quelque chose s'est mal passé
          </h1>
          <p style={{ color: '#9CA3AF', marginBottom: '2rem', maxWidth: 400, lineHeight: 1.6 }}>
            Une erreur inattendue s'est produite. L'équipe Novae a été notifiée.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ background: 'transparent', color: '#52B788', border: '1px solid #2D6A4F', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
              Réessayer
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{ background: '#2D6A4F', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── App principal ─────────────────────────────────────────────────
function AppContent({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[SW] Novae offline ready'))
        .catch(err => console.warn('[SW] Error:', err))
    }
  }, [])

  return (
    <AppProvider>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2D6A4F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Novae" />
      </Head>
      <style global jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        input, button, textarea, select { font-family: inherit; }
        a { color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 3px; }
        ::selection { background: rgba(45,106,79,0.25); }
      `}</style>
      <Component {...pageProps} />
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
