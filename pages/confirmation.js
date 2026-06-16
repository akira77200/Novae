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
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && <p style={{ color: '#6B6F76' }}>Vérification...</p>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0E1116', marginBottom: 10 }}>Paiement confirmé</h1>
            <p style={{ fontSize: 14, color: '#6B6F76', lineHeight: 1.7, marginBottom: 28 }}>Ton mentor va te contacter pour fixer l'heure de la session.</p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: '#0E1116', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Retour au dashboard →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E1116', marginBottom: 10 }}>Une erreur est survenue</h1>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: '#0E1116', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Retour →</button>
          </>
        )}
      </div>
    </div>
  )
}
