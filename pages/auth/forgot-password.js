// pages/auth/forgot-password.js — NOVAE v5 — Mot de passe oublié
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApp } from '../../context/AppContext'

export default function ForgotPassword() {
  const { C, lang, sb } = useApp()
  const [email,          setEmail]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [sent,           setSent]           = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Démarre le cooldown de 60s après chaque envoi
  const startCooldown = () => {
    setResendCooldown(60)
  }

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const envoyerLien = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim() || loading || resendCooldown > 0) return
    setLoading(true)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${appUrl}/auth/reset-password`,
      })
    } catch {}
    // Toujours afficher le même message (ne pas révéler si l'email existe)
    setSent(true)
    startCooldown()
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0E1116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: -0.3, marginBottom: 6 }}>
            {lang === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B6F76' }}>
            {lang === 'fr' ? 'Saisis ton email pour recevoir un lien de réinitialisation.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBE9', borderRadius: 16, padding: '28px 28px 24px' }}>

          {!sent ? (
            <form onSubmit={envoyerLien}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6F76', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
                {lang === 'fr' ? 'Adresse email' : 'Email address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ton@email.com"
                autoComplete="email"
                style={{ width: '100%', padding: '11px 14px', background: '#F7F7F5', border: '1px solid #EBEBE9', borderRadius: 10, color: '#0E1116', fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark', marginBottom: 20 }}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{ width: '100%', padding: '12px', background: email.trim() && !loading ? '#0E1116' : '#EBEBE9', border: 'none', borderRadius: 10, color: email.trim() && !loading ? '#fff' : '#6B6F76', fontWeight: 600, fontSize: 15, cursor: email.trim() && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                {loading
                  ? (lang === 'fr' ? 'Envoi...' : 'Sending...')
                  : (lang === 'fr' ? 'Envoyer le lien →' : 'Send reset link →')}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📧</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0E1116', marginBottom: 12 }}>
                {lang === 'fr' ? 'Email envoyé !' : 'Email sent!'}
              </p>
              <div style={{ fontSize: 13, color: '#6B6F76', lineHeight: 1.8, marginBottom: 20, textAlign: 'left', padding: '14px 16px', background: '#0E111608', border: `1px solid ${'#0E1116'}20`, borderRadius: 10 }}>
                {lang === 'fr' ? (
                  <>
                    <p style={{ margin: '0 0 6px' }}>✅ Le lien est valide pendant <strong style={{ color: '#0E1116' }}>60 minutes</strong>.</p>
                    <p style={{ margin: '0 0 6px' }}>📬 Vérifie ta boîte de réception et tes <strong style={{ color: '#0E1116' }}>spams</strong>.</p>
                    <p style={{ margin: 0 }}>⏱ Si tu ne reçois rien dans 5 minutes, vérifie que l'email saisi est correct.</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 6px' }}>✅ The link is valid for <strong style={{ color: '#0E1116' }}>60 minutes</strong>.</p>
                    <p style={{ margin: '0 0 6px' }}>📬 Check your inbox and <strong style={{ color: '#0E1116' }}>spam</strong> folder.</p>
                    <p style={{ margin: 0 }}>⏱ If you don't receive anything in 5 minutes, check that the email is correct.</p>
                  </>
                )}
              </div>

              {/* Bouton renvoyer avec cooldown */}
              <button
                onClick={envoyerLien}
                disabled={resendCooldown > 0 || loading}
                style={{ width: '100%', padding: '11px', background: resendCooldown > 0 ? '#EBEBE9' : '#0E111618', border: `1px solid ${resendCooldown > 0 ? '#EBEBE9' : '#0E111640'}`, borderRadius: 10, color: resendCooldown > 0 ? '#6B6F76' : '#3A3D40', fontWeight: 600, fontSize: 14, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
                {resendCooldown > 0
                  ? (lang === 'fr' ? `Renvoyer dans ${resendCooldown}s` : `Resend in ${resendCooldown}s`)
                  : (lang === 'fr' ? '↺ Renvoyer le lien' : '↺ Resend link')}
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: '#3A3D40', textDecoration: 'none', fontWeight: 500 }}>
              ← {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
