// components/NovaChat.js — Assistant IA Nova — bouton flottant + drawer
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

const SUGGESTIONS_FR = [
  "Comment m'inscrire à la RAMQ ?",
  "Quand dois-je faire mes impôts ?",
  "Comment obtenir mon NAS ?",
  "Puis-je travailler avec mon permis d'études ?",
]
const SUGGESTIONS_EN = [
  'How do I register for RAMQ?',
  'When do I file my taxes?',
  'How do I get my SIN?',
  'Can I work with my study permit?',
]

export default function NovaChat() {
  const { C, lang, profile, mounted, sb } = useApp()
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState([]) // { role, content }
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const [hasNew,    setHasNew]    = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef   = useRef(null)

  // Scroll au bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHasNew(false)
    }
  }, [open])

  // Message d'accueil au premier ouverture
  useEffect(() => {
    if (open && messages.length === 0) {
      const prenom = profile?.full_name?.split(' ')[0]
      setMessages([{
        role:    'assistant',
        content: lang === 'fr'
          ? `Bonjour${prenom ? ` ${prenom}` : ''} 👋 Je suis Nova, ton assistante immigration. Comment puis-je t'aider aujourd'hui ?`
          : `Hi${prenom ? ` ${prenom}` : ''} 👋 I'm Nova, your immigration assistant. How can I help you today?`,
      }])
    }
  }, [open])

  const envoyer = async (texte) => {
    const msg = (texte || input).trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const history = [...messages, userMsg]
    setMessages(history)
    setStreaming(true)

    // Placeholder réponse streaming
    const assistantIdx = history.length
    setMessages(p => [...p, { role: 'assistant', content: '' }])

    abortRef.current = new AbortController()
    try {
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setMessages(p => {
          const copy = [...p]
          copy[assistantIdx] = { role: 'assistant', content: lang === 'fr' ? 'Connecte-toi pour utiliser Nova.' : 'Sign in to use Nova.' }
          return copy
        })
        return
      }

      const res = await fetch('/api/nova', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body:    JSON.stringify({
          messages: history,
          profile: profile ? {
            statut:       profile.statut,
            ville_accueil:profile.ville_accueil,
            pays_origine: profile.pays_origine,
            date_arrivee: profile.date_arrivee,
          } : null,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Erreur ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break
          try {
            const { text, error } = JSON.parse(raw)
            if (error) throw new Error(error)
            if (text) {
              setMessages(p => {
                const copy = [...p]
                copy[assistantIdx] = { ...copy[assistantIdx], content: copy[assistantIdx].content + text }
                return copy
              })
            }
          } catch (parseErr) {
            if (parseErr.message && !raw.includes('[DONE]')) {
              console.warn('[NovaChat] SSE parse error:', parseErr.message)
            }
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMessages(p => {
          const copy = [...p]
          copy[assistantIdx] = { role: 'assistant', content: lang === 'fr' ? "Désolée, une erreur s'est produite. Réessaie." : 'Sorry, an error occurred. Please try again.' }
          return copy
        })
      }
    } finally {
      setStreaming(false)
      if (!open) setHasNew(true)
    }
  }

  const reinitialiser = () => {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
    setInput('')
  }

  if (!mounted) return null

  const suggestions = lang === 'fr' ? SUGGESTIONS_FR : SUGGESTIONS_EN

  return (
    <>
      {/* ── Drawer Chat ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 84, right: 20, zIndex: 200,
          width: 360, maxWidth: 'calc(100vw - 40px)',
          height: 520, maxHeight: 'calc(100vh - 120px)',
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'system-ui,sans-serif',
          animation: 'novaSlideUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✨</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Nova</p>
              <p style={{ fontSize: 11, color: C.accent2 }}>{lang === 'fr' ? 'Assistante immigration · En ligne' : 'Immigration assistant · Online'}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={reinitialiser} title={lang === 'fr' ? 'Nouvelle conversation' : 'New conversation'}
                style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 13 }}>↺</button>
              <button onClick={() => setOpen(false)}
                style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 13 }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Suggestions si conversation vide (1 message = accueil) */}
            {messages.length <= 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => envoyer(s)}
                    style={{ textAlign: 'left', padding: '8px 12px', background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 10, color: C.accent2, fontSize: 12, cursor: 'pointer', lineHeight: 1.4 }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.role === 'user'
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isUser ? C.accent : C.surface2,
                    border: isUser ? 'none' : `1px solid ${C.border}`,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: isUser ? '#fff' : C.text,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {m.content || (
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent2, animation: 'novaDot 1.2s infinite 0s' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent2, animation: 'novaDot 1.2s infinite 0.2s' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent2, animation: 'novaDot 1.2s infinite 0.4s' }} />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer() } }}
              placeholder={lang === 'fr' ? 'Pose ta question à Nova...' : 'Ask Nova a question...'}
              disabled={streaming}
              style={{
                flex: 1, padding: '9px 12px',
                background: C.bg2, border: `1px solid ${C.border}`,
                borderRadius: 10, color: C.text, fontSize: 13, outline: 'none',
                opacity: streaming ? 0.7 : 1,
              }}
            />
            <button
              onClick={() => envoyer()}
              disabled={!input.trim() || streaming}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: input.trim() && !streaming ? C.accent : C.border,
                border: 'none', color: '#fff', fontSize: 16, cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* ── Bouton flottant ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 20, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? C.surface : 'linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)',
          border: open ? `1.5px solid ${C.border2}` : 'none',
          boxShadow: '0 8px 24px rgba(45,106,79,0.40)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          transition: 'all 0.2s',
          color: open ? C.muted : '#fff',
        }}
        title={open ? (lang === 'fr' ? 'Fermer Nova' : 'Close Nova') : (lang === 'fr' ? 'Parler à Nova' : 'Chat with Nova')}
      >
        {open ? '✕' : '✨'}

        {/* Badge nouveau message */}
        {hasNew && !open && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 14, height: 14, borderRadius: '50%',
            background: '#F87171', border: `2px solid ${C.bg}`,
          }} />
        )}
      </button>

      {/* ── Animations CSS ── */}
      <style>{`
        @keyframes novaSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes novaDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
    </>
  )
}
