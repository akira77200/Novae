// pages/auth/login.js — NOVAE v5 — Connexion
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

const ERR_MAP = (msg = '') => {
  if (msg.includes('Invalid login') || msg.includes('invalid_grant'))
    return 'Email ou mot de passe incorrect.'
  if (msg.includes('Email not confirmed'))
    return 'Confirme ton email avant de te connecter. Vérifie ta boîte de réception et tes spams.'
  if (msg.includes('User not found') || msg.includes('No user found'))
    return 'Aucun compte associé à cet email.'
  if (msg.includes('disabled') || msg.includes('banned'))
    return 'Ce compte a été désactivé. Contacte le support.'
  if (msg.includes('rate limit') || msg.includes('Too many'))
    return 'Trop de tentatives. Attends quelques minutes avant de réessayer.'
  return msg || 'Une erreur est survenue. Réessaie.'
}

export default function Login() {
  const { C, t, lang, sb } = useApp()
  const router = useRouter()
  const redirect = router.query.redirect || '/dashboard'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return
    setLoading(true); setError('')
    try {
      const { error: err } = await sb.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (err) { setError(ERR_MAP(err.message)); return }
      const dest = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
      router.push(dest)
    } catch (e) {
      setError(ERR_MAP(e?.message))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${base}/auth/callback` },
    })
  }

  const inp = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--text-h1)', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', colorScheme: 'dark',
  }
  const lbl = {
    display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0E1116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-h1)', letterSpacing: -0.5, marginBottom: 6 }}>{t.login_title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Bienvenue sur Novae' : 'Welcome to Novae'}</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px' }}>

          {/* Google */}
          <button onClick={handleGoogle} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-h1)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#0E1116" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#3A3D40" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#6B6F76" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#DC2626" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.login_google}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'fr' ? 'ou' : 'or'}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleLogin}>
            <label style={lbl}>{t.login_email}</label>
            <input
              type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              required placeholder="ton@email.com"
              style={inp}
              autoComplete="email"
            />

            <label style={lbl}>{t.login_password}</label>
            <input
              type="password" value={form.password}
              onChange={e => set('password', e.target.value)}
              required placeholder="••••••••"
              style={inp}
              autoComplete="current-password"
            />

            {/* Mot de passe oublié */}
            <div style={{ textAlign: 'right', marginTop: 8, marginBottom: 20 }}>
              <Link href="/auth/forgot-password" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                {t.login_forgot}
              </Link>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#DC262615', border: `1px solid ${'#DC2626'}40`, borderRadius: 9, color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              style={{
                width: '100%', padding: '12px', background: '#0E1116', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15,
                cursor: loading || !form.email || !form.password ? 'not-allowed' : 'pointer',
                opacity: loading || !form.email || !form.password ? 0.65 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? (lang === 'fr' ? 'Connexion...' : 'Signing in...') : t.login_btn}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            {t.login_no_account}{' '}
            <Link href="/auth/register" style={{ color: 'var(--text-body)', fontWeight: 600, textDecoration: 'none' }}>
              {t.login_signup}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
