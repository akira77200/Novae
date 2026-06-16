// pages/bug-report.js — Signaler un bug
import { useState, useEffect } from 'react'
import Link from 'next/link'

import { useApp } from '../context/AppContext'

const PAGES_LIST = [
  { value: '/',                  fr: 'Accueil',              en: 'Home' },
  { value: '/dashboard',         fr: 'Tableau de bord',      en: 'Dashboard' },
  { value: '/arrivee',           fr: "Guide d'arrivée",      en: 'Arrival guide' },
  { value: '/documents',         fr: 'Documents',            en: 'Documents' },
  { value: '/echeances',         fr: 'Échéances',            en: 'Deadlines' },
  { value: '/mon-avenir',        fr: 'Mon Avenir',           en: 'My Future' },
  { value: '/cv',                fr: 'Créateur CV',          en: 'Resume builder' },
  { value: '/entrevue',          fr: 'Entrevue IA',          en: 'Mock interview' },
  { value: '/bienetre',          fr: 'Bien-être',            en: 'Wellbeing' },
  { value: '/quiz-culture',      fr: 'Quiz culture',         en: 'Culture quiz' },
  { value: '/day-to-day',        fr: 'Vie quotidienne',      en: 'Daily life' },
  { value: '/auth/login',        fr: 'Connexion',            en: 'Login' },
  { value: '/auth/register',     fr: 'Inscription',          en: 'Register' },
  { value: '/profile_1',         fr: 'Mon profil',           en: 'My profile' },
  { value: 'autre',              fr: 'Autre / je ne sais pas', en: 'Other / not sure' },
]

export default function BugReport() {
  const { C, lang, user, profile } = useApp()
  const isFr = lang === 'fr'

  const [email,       setEmail]       = useState('')
  const [page,        setPage]        = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)

  useEffect(() => {
    if (user?.email) setEmail(user.email)
    else if (profile?.email) setEmail(profile.email)
  }, [user, profile])

  useEffect(() => {
    if (typeof window !== 'undefined' && !page) {
      const path = window.location.pathname
      const match = PAGES_LIST.find(p => p.value === path)
      if (match) setPage(match.value)
    }
  }, [page])

  const submit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bug-report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), page, description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setSuccess(true)
      setDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 14px', background: 'var(--bg-subtle)',
    border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-h1)',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-h1)', fontFamily: 'system-ui,sans-serif' }}>
      
      <main style={{ maxWidth: 520, margin: '0 auto', padding: '36px 20px 80px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          🐛 {isFr ? 'Signaler un bug' : 'Report a bug'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          {isFr
            ? 'Décris le problème rencontré. Notre équipe le traitera rapidement.'
            : 'Describe the issue you encountered. Our team will look into it quickly.'}
        </p>

        {success ? (
          <div style={{ background: '#3A3D4012', border: `1px solid ${'#3A3D40'}40`, borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              {isFr ? 'Merci ! Ton rapport a été envoyé.' : 'Thank you! Your report was submitted.'}
            </p>
            <Link href="/" style={{ color: 'var(--text-body)', fontWeight: 600, textDecoration: 'none' }}>
              {isFr ? '← Retour à l\'accueil' : '← Back to home'}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={{ ...inp, marginBottom: 18 }}
            />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {isFr ? 'Page concernée' : 'Affected page'}
            </label>
            <select value={page} onChange={e => setPage(e.target.value)} style={{ ...inp, marginBottom: 18, cursor: 'pointer' }}>
              <option value="">{isFr ? '— Sélectionner —' : '— Select —'}</option>
              {PAGES_LIST.map(p => (
                <option key={p.value} value={p.value}>{isFr ? p.fr : p.en}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {isFr ? 'Description du bug' : 'Bug description'}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              placeholder={isFr ? 'Décris ce qui s\'est passé, les étapes pour reproduire le bug...' : 'Describe what happened and steps to reproduce...'}
              style={{ ...inp, resize: 'vertical', marginBottom: 18, fontFamily: 'inherit' }}
              required
            />

            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>⚠ {error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !description.trim()}
              style={{
                width: '100%', padding: 13, background: loading ? '#EBEBE9' : '#0E1116',
                border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700,
                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? (isFr ? 'Envoi...' : 'Sending...')
                : (isFr ? 'Envoyer le rapport' : 'Submit report')}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
