// pages/auth/reset-password.js — NOVAE v5 — Réinitialisation mot de passe
//
// ⚠️ ACTION MANUELLE REQUISE DANS SUPABASE :
// Dashboard → Authentication → Email Templates → Reset Password
// Vérifie que le lien de redirection pointe vers :
// https://novae-app.netlify.app/auth/reset-password
//
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

export default function ResetPassword() {
  const { C, lang, sb } = useApp()
  const router = useRouter()

  const [password,      setPassword]      = useState('')
  const [confirm,       setConfirm]       = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState(false)
  const [sessionReady,  setSessionReady]  = useState(null) // null=checking, true=ok, false=expired
  const [countdown,     setCountdown]     = useState(8)

  // ── Récupération du token depuis le hash de l'URL ──────────────
  useEffect(() => {
    if (!sb) return

    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type         = params.get('type')

      if (type === 'recovery' && accessToken) {
        sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
          .then(({ error: err }) => {
            if (err) {
              setSessionReady(false)
              setError(lang === 'fr' ? 'Lien expiré. Demande un nouveau lien.' : 'Link expired. Request a new link.')
            } else {
              setSessionReady(true)
            }
          })
        return
      }
    }

    // Fallback : Supabase traite parfois le hash automatiquement via onAuthStateChange
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true)
      }
    })

    // Timeout 8 secondes avant de déclarer le lien invalide
    const t = setTimeout(() => {
      setSessionReady(prev => (prev === null ? false : prev))
    }, 8000)

    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [sb])

  // ── Compte à rebours après succès ──────────────────────────────
  useEffect(() => {
    if (!success) return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          router.replace('/dashboard')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [success])

  const passOk  = password.length >= 8
  const matchOk = password === confirm && confirm.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passOk || !matchOk || loading) return
    setLoading(true); setError('')
    try {
      const { error: err } = await sb.auth.updateUser({ password })
      if (err) throw err
      setSuccess(true)
    } catch (e) {
      const msg = e.message || ''
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid'))
        setError(lang === 'fr' ? 'Lien expiré. Demande un nouveau lien de réinitialisation.' : 'Link expired. Request a new reset link.')
      else
        setError(msg || (lang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'))
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 14px', background: C.surface2,
    border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
    fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 6 }}>
            {lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
          </h1>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 28px 24px' }}>

          {/* ── Vérification en cours ── */}
          {sessionReady === null && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 14, color: C.muted }}>
                {lang === 'fr' ? 'Vérification du lien en cours...' : 'Verifying link...'}
              </p>
            </div>
          )}

          {/* ── Lien expiré ── */}
          {sessionReady === false && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏱️</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                {lang === 'fr' ? 'Ce lien a expiré' : 'This link has expired'}
              </p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                {lang === 'fr'
                  ? 'Le lien de réinitialisation est valide 60 minutes. Demande un nouveau lien pour continuer.'
                  : 'The reset link is valid for 60 minutes. Request a new link to continue.'}
              </p>
              <Link href="/auth/forgot-password"
                style={{ display: 'inline-block', padding: '11px 24px', background: C.accent, borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                {lang === 'fr' ? 'Demander un nouveau lien →' : 'Request a new link →'}
              </Link>
            </div>
          )}

          {/* ── Succès ── */}
          {success && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                {lang === 'fr' ? 'Mot de passe mis à jour !' : 'Password updated!'}
              </p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                {lang === 'fr' ? `Redirection dans ${countdown} seconde${countdown > 1 ? 's' : ''}...` : `Redirecting in ${countdown}s...`}
              </p>
              {/* Barre de progression */}
              <div style={{ width: '100%', height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: C.accent, borderRadius: 3, width: `${(countdown / 8) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            </div>
          )}

          {/* ── Formulaire ── */}
          {sessionReady === true && !success && (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
                {lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inp, marginBottom: 6 }} autoComplete="new-password" />
              {password && !passOk && <p style={{ fontSize: 11, color: C.error, marginBottom: 8 }}>{lang === 'fr' ? 'Minimum 8 caractères' : 'Minimum 8 characters'}</p>}

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }}>
                {lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
              </label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" style={{ ...inp, marginBottom: 6 }} autoComplete="new-password" />
              {confirm && !matchOk && <p style={{ fontSize: 11, color: C.error, marginBottom: 8 }}>{lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}</p>}

              {error && (
                <div style={{ padding: '10px 14px', background: `${C.error}15`, border: `1px solid ${C.error}40`, borderRadius: 9, color: C.error, fontSize: 13, marginTop: 12, marginBottom: 12, lineHeight: 1.6 }}>
                  {error}
                  {(error.includes('expiré') || error.includes('expired')) && (
                    <span> <Link href="/auth/forgot-password" style={{ color: C.error, fontWeight: 700, textDecoration: 'underline' }}>
                      {lang === 'fr' ? 'Demander un nouveau lien →' : 'Get a new link →'}
                    </Link></span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!passOk || !matchOk || loading}
                style={{ width: '100%', padding: '12px', background: passOk && matchOk && !loading ? C.accent : C.border, border: 'none', borderRadius: 10, color: passOk && matchOk && !loading ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: passOk && matchOk && !loading ? 'pointer' : 'not-allowed', marginTop: 16, opacity: loading ? 0.7 : 1 }}>
                {loading
                  ? (lang === 'fr' ? 'Mise à jour...' : 'Updating...')
                  : (lang === 'fr' ? 'Mettre à jour →' : 'Update password →')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
