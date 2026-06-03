// pages/index.js
// Gère la redirection après Google OAuth et crée le profil si manquant

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'

export default function Home() {
  const router = useRouter()
  const { sb } = useApp()
  const [status, setStatus] = useState('Chargement...')

  useEffect(() => {
    if (!sb) return
    const init = async () => {
      // Attendre que Supabase traite le token OAuth depuis l'URL
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: { session } } = await sb.auth.getSession()

      // Pas de session — aller au dashboard en mode invité
      if (!session?.user) {
        router.replace('/dashboard')
        return
      }

      const user = session.user
      setStatus('Préparation de ton espace...')

      // Créer le profil s'il n'existe pas
      const { data: profil } = await sb
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profil) {
        await sb.from('profiles').upsert({
          id:         user.id,
          email:      user.email,
          full_name:  user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null,
        })
      }

      router.replace('/dashboard')
    }

    init()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#2D6A4F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#fff',
          margin: '0 auto 16px',
        }}>N</div>
        <p style={{ color: '#6B7280', fontSize: 14 }}>{status}</p>
      </div>
    </div>
  )
}
