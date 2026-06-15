// pages/logout.js — NOVAE v5
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

const KEYS_TO_CLEAR = [
  'novae_lang', 'novae_theme',
  'novae_faites', 'novae_todos',
  'novae_quiz_result', 'novae_quiz_scores',
  'novae_cv_nom',
]

export default function Logout() {
  const { sb } = useApp()

  useEffect(() => {
    if (!sb) return
    const doLogout = async () => {
      try {
        await sb.auth.signOut()
      } catch {}
      // Purge localStorage (sauf préférences lang/theme)
      KEYS_TO_CLEAR.forEach(k => {
        try { localStorage.removeItem(k) } catch {}
      })
      window.location.href = '/'
    }
    doLogout()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0F1A14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 16 }}>N</div>
      <p style={{ color: '#9CA3AF', fontSize: 15 }}>Déconnexion...</p>
    </div>
  )
}
