// pages/todo.js
import { useState, useEffect, useRef } from 'react'

import { useApp } from '../context/AppContext'

export default function Todo() {
  const { C, t, lang, user, loading: authLoading, sb } = useApp()

  const [todos,   setTodos]   = useState([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (hasFetched.current) return
    hasFetched.current = true
    if (user) {
      sb.from('todos').select('*').eq('utilisateur_id', user.id).order('created_at')
        .then(({ data }) => { setTodos(data || []); setLoading(false) })
    } else {
      setTodos(JSON.parse(localStorage.getItem('novae_todos') || '[]'))
      setLoading(false)
    }
  }, [authLoading, user?.id])

  const save = (list) => {
    setTodos(list)
    if (!user) localStorage.setItem('novae_todos', JSON.stringify(list))
  }

  const add = async () => {
    if (!input.trim()) return
    if (user) {
      const { data } = await sb.from('todos').insert({ utilisateur_id: user.id, titre: input.trim() }).select().single()
      if (data) setTodos(p => [...p, data])
    } else {
      save([...todos, { id: Date.now().toString(), titre: input.trim(), complete: false, created_at: new Date().toISOString() }])
    }
    setInput('')
  }

  const toggle = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    save(todos.map(t => t.id === id ? { ...t, complete: !t.complete } : t))
    if (user) await sb.from('todos').update({ complete: !todo.complete }).eq('id', id)
  }

  const del = async (id) => {
    save(todos.filter(t => t.id !== id))
    if (user) await sb.from('todos').delete().eq('id', id)
  }

  const pending   = todos.filter(t => !t.complete)
  const completed = todos.filter(t => t.complete)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '36px 20px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>{t.todo_title}</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 4, lineHeight: 1.6 }}>
          {lang === 'fr'
            ? 'Tes tâches personnelles libres — pour le suivi officiel d\'immigration, consulte ton'
            : 'Your personal free-form tasks — for official immigration tracking, check your'}
          {' '}
          <a href="/dashboard" style={{ color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>
            {lang === 'fr' ? 'Dashboard' : 'Dashboard'}
          </a>.
        </p>
        {!user && <p style={{ fontSize: 13, color: C.muted, marginBottom: 24, marginTop: 8 }}>
          {lang === 'fr' ? 'Connecte-toi pour sauvegarder tes tâches.' : 'Sign in to save your tasks.'}
        </p>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { val: todos.length,     label: 'Total',                     color: C.accent2 },
            { val: pending.length,   label: lang === 'fr' ? 'À faire' : 'To do', color: C.warning  },
            { val: completed.length, label: lang === 'fr' ? 'Faites' : 'Done',   color: C.success  },
          ].map((s, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</p>
              <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder={t.todo_placeholder}
            style={{ flex: 1, padding: '11px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
          <button onClick={add} disabled={!input.trim()} style={{ padding: '11px 18px', background: input.trim() ? C.accent : C.border, border: 'none', borderRadius: 10, color: input.trim() ? '#fff' : C.muted, fontWeight: 600, fontSize: 14, cursor: input.trim() ? 'pointer' : 'not-allowed' }}>
            {t.todo_add}
          </button>
        </div>

        {todos.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: C.muted, padding: '40px', fontSize: 14 }}>{t.todo_empty}</p>
        )}

        {/* À faire */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>
              {lang === 'fr' ? 'À faire' : 'To do'} · {pending.length}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {pending.map(todo => <TodoItem key={todo.id} todo={todo} C={C} onToggle={toggle} onDelete={del} />)}
            </div>
          </div>
        )}

        {/* Faites */}
        {completed.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>
              {lang === 'fr' ? 'Faites' : 'Done'} · {completed.length}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {completed.map(todo => <TodoItem key={todo.id} todo={todo} C={C} onToggle={toggle} onDelete={del} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function TodoItem({ todo, C, onToggle, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: hov ? C.surface2 : C.surface, border: `1px solid ${C.border}`, borderRadius: 10, opacity: todo.complete ? 0.5 : 1, transition: 'all 0.15s' }}>
      <button onClick={() => onToggle(todo.id)} style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${todo.complete ? C.success : C.border}`, background: todo.complete ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        {todo.complete && <span style={{ color: C.bg, fontSize: 11, fontWeight: 800 }}>✓</span>}
      </button>
      <p style={{ flex: 1, fontSize: 14, color: C.text, textDecoration: todo.complete ? 'line-through' : 'none' }}>{todo.titre}</p>
      {hov && <button onClick={() => onDelete(todo.id)} style={{ padding: '4px 9px', background: `${C.error}12`, border: `1px solid ${C.error}25`, borderRadius: 7, color: C.error, fontSize: 12, cursor: 'pointer' }}>✕</button>}
    </div>
  )
}
