// pages/auth/reset-password.js — NOVAE v5 — Réinitialisation mot de passe
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

export default function ResetPassword() {
  const { C, lang, sb } = useApp()
  const router = useRouter()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [tokenOk,   setTokenOk]   = useState(null) // null=checking, true=ok, false=expired

  // Supabase envoie le token dans le hash (#access_token=...)
  // onAuthStateChange le récupère automatiquement
  useEffect(() => {
    if (!sb) return
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenOk(true)
      } else if (event === 'SIGNED_IN' && session) {
        setTokenOk(true)
      }
    })
    // Timeout si pas de token valide
    const t = setTimeout(() => {
      if (tokenOk === null) setTokenOk(false)
    }, 3000)
    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [sb])

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
      setTimeout(() => router.replace('/dashboard'), 2500)
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('expired') || msg.includes('invalid'))
        setError(lang === 'fr' ? 'Lien expiré. Demande un nouveau lien de réinitialisation.' : 'Link expired. Request a new reset link.')
      else
        setError(msg || (lang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'))
    } finally {
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '11px 14px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }

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

          {/* Lien expiré */}
          {tokenOk === false && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏱️</div>
              <p style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>
                {lang === 'fr' ? 'Ce lien a expiré ou est invalide.' : 'This link has expired or is invalid.'}
              </p>
              <Link href="/auth/forgot-password"
                style={{ display: 'inline-block', padding: '10px 20px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none', marginTop: 12 }}>
                {lang === 'fr' ? 'Demander un nouveau lien →' : 'Request a new link →'}
              </Link>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                {lang === 'fr' ? 'Mot de passe mis à jour !' : 'Password updated!'}
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>
                {lang === 'fr' ? 'Redirection vers le tableau de bord...' : 'Redirecting to dashboard...'}
              </p>
            </div>
          )}

          {/* Formulaire */}
          {tokenOk !== false && !success && (
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
                <div style={{ padding: '10px 14px', background: `${C.error}15`, border: `1px solid ${C.error}40`, borderRadius: 9, color: C.error, fontSize: 13, marginTop: 12, marginBottom: 12 }}>
                  {error}
                  {error.includes('expiré') && (
                    <span> <Link href="/auth/forgot-password" style={{ color: C.error, fontWeight: 600 }}>{lang === 'fr' ? 'Renvoyer →' : 'Resend →'}</Link></span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!passOk || !matchOk || loading || tokenOk === null}
                style={{ width: '100%', padding: '12px', background: passOk && matchOk && !loading ? C.accent : C.border, border: 'none', borderRadius: 10, color: passOk && matchOk && !loading ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: passOk && matchOk && !loading ? 'pointer' : 'not-allowed', marginTop: 16, opacity: loading ? 0.7 : 1 }}>
                {loading ? (lang === 'fr' ? 'Mise à jour...' : 'Updating...') : (lang === 'fr' ? 'Mettre à jour →' : 'Update password →')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
