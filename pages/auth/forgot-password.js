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
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 6 }}>
            {lang === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>
            {lang === 'fr' ? 'Saisis ton email pour recevoir un lien de réinitialisation.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 28px 24px' }}>

          {!sent ? (
            <form onSubmit={envoyerLien}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
                {lang === 'fr' ? 'Adresse email' : 'Email address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ton@email.com"
                autoComplete="email"
                style={{ width: '100%', padding: '11px 14px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark', marginBottom: 20 }}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{ width: '100%', padding: '12px', background: email.trim() && !loading ? C.accent : C.border, border: 'none', borderRadius: 10, color: email.trim() && !loading ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: email.trim() && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                {loading
                  ? (lang === 'fr' ? 'Envoi...' : 'Sending...')
                  : (lang === 'fr' ? 'Envoyer le lien →' : 'Send reset link →')}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📧</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                {lang === 'fr' ? 'Email envoyé !' : 'Email sent!'}
              </p>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 20, textAlign: 'left', padding: '14px 16px', background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 10 }}>
                {lang === 'fr' ? (
                  <>
                    <p style={{ margin: '0 0 6px' }}>✅ Le lien est valide pendant <strong style={{ color: C.text }}>60 minutes</strong>.</p>
                    <p style={{ margin: '0 0 6px' }}>📬 Vérifie ta boîte de réception et tes <strong style={{ color: C.text }}>spams</strong>.</p>
                    <p style={{ margin: 0 }}>⏱ Si tu ne reçois rien dans 5 minutes, vérifie que l'email saisi est correct.</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 6px' }}>✅ The link is valid for <strong style={{ color: C.text }}>60 minutes</strong>.</p>
                    <p style={{ margin: '0 0 6px' }}>📬 Check your inbox and <strong style={{ color: C.text }}>spam</strong> folder.</p>
                    <p style={{ margin: 0 }}>⏱ If you don't receive anything in 5 minutes, check that the email is correct.</p>
                  </>
                )}
              </div>

              {/* Bouton renvoyer avec cooldown */}
              <button
                onClick={envoyerLien}
                disabled={resendCooldown > 0 || loading}
                style={{ width: '100%', padding: '11px', background: resendCooldown > 0 ? C.border : `${C.accent}18`, border: `1px solid ${resendCooldown > 0 ? C.border : C.accent + '40'}`, borderRadius: 10, color: resendCooldown > 0 ? C.muted : C.accent2, fontWeight: 600, fontSize: 14, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
                {resendCooldown > 0
                  ? (lang === 'fr' ? `Renvoyer dans ${resendCooldown}s` : `Resend in ${resendCooldown}s`)
                  : (lang === 'fr' ? '↺ Renvoyer le lien' : '↺ Resend link')}
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: C.accent2, textDecoration: 'none', fontWeight: 500 }}>
              ← {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
