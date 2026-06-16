// pages/confirmation.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

export default function Confirmation() {
  const { lang } = useApp()
  const router = useRouter()
  const [status, setStatus] = useState('loading')
  const isFr = lang === 'fr'

  useEffect(() => {
    if (router.query.session_id) setTimeout(() => setStatus('success'), 600)
    else setStatus('error')
  }, [router.query])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && <p style={{ color: 'var(--text-muted)' }}>{isFr ? 'Vérification...' : 'Verifying...'}</p>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 10 }}>
              {isFr ? 'Paiement confirmé' : 'Payment confirmed'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              {isFr
                ? 'Ton mentor va te contacter pour fixer l\'heure de la session.'
                : 'Your mentor will contact you to schedule the session time.'}
            </p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: '#0E1116', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              {isFr ? 'Retour au dashboard →' : 'Back to dashboard →'}
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 10 }}>
              {isFr ? 'Une erreur est survenue' : 'An error occurred'}
            </h1>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: '#0E1116', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              {isFr ? 'Retour →' : 'Back →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
