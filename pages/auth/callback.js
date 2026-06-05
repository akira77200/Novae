// pages/auth/callback.js — NOVAE v5 — Callback OAuth
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

export default function AuthCallback() {
  const router  = useRouter()
  const { sb }  = useApp()
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!sb) return

    const handle = async () => {
      try {
        // Vérifie s'il y a une erreur OAuth dans l'URL
        const hash   = window.location.hash
        const search = window.location.search
        const params = new URLSearchParams(search)
        const hashParams = new URLSearchParams(hash.replace('#',''))

        const oauthError = params.get('error') || hashParams.get('error')
        if (oauthError) {
          const desc = params.get('error_description') || hashParams.get('error_description') || oauthError
          setErr(desc)
          setTimeout(() => router.replace('/auth/login?error=' + encodeURIComponent(desc)), 3000)
          return
        }

        // Laisse Supabase traiter le hash automatiquement (flux implicite)
        // puis vérifie la session
        await new Promise(r => setTimeout(r, 500))
        const { data: { session } } = await sb.auth.getSession()

        if (session?.user) {
          // Crée/met à jour le profil si c'est une première connexion Google
          const { data: existing } = await sb.from('profiles').select('id').eq('id', session.user.id).single()
          if (!existing) {
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || ''
            await sb.from('profiles').upsert({
              id:         session.user.id,
              email:      session.user.email,
              full_name:  fullName,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            })
            try {
              await fetch('/api/email/bienvenue', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                  email:  session.user.email,
                  prenom: fullName.split(/\s+/)[0] || '',
                }),
              })
            } catch (_) { /* MVP */ }
          }
          router.replace('/dashboard')
        } else {
          // Pas de session — peut-être flux PKCE avec ?code=
          if (params.get('code')) {
            // Supabase exchange automatique via onAuthStateChange
            await new Promise(r => setTimeout(r, 1500))
            const { data: { session: s2 } } = await sb.auth.getSession()
            if (s2) { router.replace('/dashboard'); return }
          }
          router.replace('/auth/login')
        }
      } catch (e) {
        console.error('[callback] erreur:', e.message)
        router.replace('/auth/login')
      }
    }

    handle()
  }, [sb])

  return (
    <div style={{ minHeight: '100vh', background: '#0F1A14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20 }}>N</div>
      {err ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#F87171', fontSize: 14, marginBottom: 8 }}>⚠️ {err}</p>
          <p style={{ color: '#6B7280', fontSize: 12 }}>Redirection vers la connexion...</p>
        </div>
      ) : (
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Connexion en cours...</p>
      )}
    </div>
  )
}
