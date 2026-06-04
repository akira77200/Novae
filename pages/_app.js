// pages/_app.js
import { useEffect } from 'react'
import Head from 'next/head'
import { AppProvider } from '../context/AppContext'
import NovaChat from '../components/NovaChat'

export default function App({ Component, pageProps }) {
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
