// pages/confirmation.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

export default function Confirmation() {
  const { C } = useApp()
  const router = useRouter()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (router.query.session_id) setTimeout(() => setStatus('success'), 600)
    else setStatus('error')
  }, [router.query])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && <p style={{ color: C.muted }}>Vérification...</p>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 10 }}>Paiement confirmé</h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>Ton mentor va te contacter pour fixer l'heure de la session.</p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Retour au dashboard →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>Une erreur est survenue</h1>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Retour →</button>
          </>
        )}
      </div>
    </div>
  )
}
