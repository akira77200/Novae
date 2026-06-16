// components/FeedbackSection.js — NOVAE v5 — Feedback discret en bas de page
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function FeedbackSection({ page }) {
  const { C, lang, sb, user } = useApp()
  const [mode,    setMode]    = useState(null)   // null | 'note' | 'bug' | 'suggestion'
  const [note,    setNote]    = useState(0)
  const [texte,   setTexte]   = useState('')
  const [envoye,  setEnvoye]  = useState(false)
  const [loading, setLoading] = useState(false)

  const envoyer = async () => {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          type: mode,
          note: mode === 'note' ? note : null,
          texte,
          user_email: user?.email || 'anonyme',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      })
    } catch {}
    setEnvoye(true)
    setLoading(false)
  }

  const btnBase = {
    background: 'none',
    borderRadius: '99px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 500,
  }

  if (envoye) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#3A3D40', fontSize: '0.9rem' }}>
        ✅ {lang === 'fr' ? 'Merci pour ton retour !' : 'Thank you for your feedback!'}
      </div>
    )
  }

  return (
    <div style={{
      marginTop: '60px',
      borderTop: '1px solid #EBEBE9',
      padding: '24px 0',
    }}>

      {/* ── Boutons initiaux ── */}
      {!mode && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B6F76', fontSize: '0.85rem', marginBottom: '12px' }}>
            {lang === 'fr' ? 'Cette page t\'a été utile ?' : 'Was this page helpful?'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMode('note')}
              style={{ ...btnBase, border: `1px solid ${'#0E1116'}40`, color: '#3A3D40' }}
            >
              ⭐ {lang === 'fr' ? 'Donner une note' : 'Rate this page'}
            </button>
            <button
              onClick={() => setMode('bug')}
              style={{ ...btnBase, border: `1px solid ${'#DC2626'}40`, color: '#DC2626' }}
            >
              🐛 {lang === 'fr' ? 'Signaler un bug' : 'Report a bug'}
            </button>
            <button
              onClick={() => setMode('suggestion')}
              style={{ ...btnBase, border: `1px solid #0E111640`, color: '#0E1116' }}
            >
              💡 {lang === 'fr' ? 'Suggérer une amélioration' : 'Suggest improvement'}
            </button>
          </div>
        </div>
      )}

      {/* ── Mode Note ── */}
      {mode === 'note' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B6F76', fontSize: '0.85rem', marginBottom: '12px' }}>
            {lang === 'fr' ? 'Note cette page :' : 'Rate this page:'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setNote(n)}
                style={{
                  fontSize: '1.8rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: note >= n ? 1 : 0.3,
                  transition: 'opacity 0.2s',
                  padding: '2px 4px',
                }}
              >
                ⭐
              </button>
            ))}
          </div>
          {note > 0 && (
            <>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder={lang === 'fr' ? 'Un commentaire ? (optionnel)' : 'A comment? (optional)'}
                rows={3}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #EBEBE9',
                  background: 'transparent',
                  color: '#0E1116',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  display: 'block',
                  margin: '0 auto 12px',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
              <button
                onClick={envoyer}
                disabled={loading}
                style={{
                  background: '#0E1116',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (lang === 'fr' ? 'Envoi...' : 'Sending...') : (lang === 'fr' ? 'Envoyer' : 'Send')}
              </button>
            </>
          )}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => { setMode(null); setNote(0) }} style={{ ...btnBase, border: '1px solid #EBEBE9', color: '#6B6F76', fontSize: '0.78rem' }}>
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ── Mode Bug ou Suggestion ── */}
      {(mode === 'bug' || mode === 'suggestion') && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#6B6F76', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>
            {mode === 'bug'
              ? (lang === 'fr' ? 'Décris le problème que tu as rencontré :' : 'Describe the problem you encountered:')
              : (lang === 'fr' ? 'Quelle amélioration suggères-tu ?' : 'What improvement do you suggest?')}
          </p>
          <textarea
            value={texte}
            onChange={e => setTexte(e.target.value)}
            placeholder={
              mode === 'bug'
                ? (lang === 'fr' ? 'Ex: Le bouton X ne fonctionne pas quand...' : "Ex: Button X doesn't work when...")
                : (lang === 'fr' ? 'Ex: Il serait utile d\'avoir...' : 'Ex: It would be useful to have...')
            }
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${mode === 'bug' ? '#DC262640' : '#0E111640'}`,
              background: 'transparent',
              color: '#0E1116',
              fontSize: '0.85rem',
              resize: 'vertical',
              marginBottom: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              colorScheme: 'dark',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => { setMode(null); setTexte('') }}
              style={{
                background: 'none',
                border: '1px solid #EBEBE9',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#6B6F76',
              }}
            >
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              onClick={envoyer}
              disabled={loading || texte.length < 5}
              style={{
                background: mode === 'bug' ? '#DC2626' : '#0E1116',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: texte.length < 5 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                opacity: texte.length < 5 || loading ? 0.5 : 1,
              }}
            >
              {loading ? (lang === 'fr' ? 'Envoi...' : 'Sending...') : (lang === 'fr' ? 'Envoyer' : 'Send')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
