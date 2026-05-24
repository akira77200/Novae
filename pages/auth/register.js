// pages/auth/register.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { useApp } from '../../context/AppContext'

const PAYS = ['Canada','France','Belgique','Royaume-Uni','Allemagne','Autre']
const VILLES = {
  Canada: ['Montréal','Toronto','Vancouver','Québec','Ottawa','Gatineau','Calgary','Autre'],
  France: ['Paris','Lyon','Marseille','Bordeaux','Toulouse','Autre'],
  Belgique: ['Bruxelles','Liège','Gand','Autre'],
  'Royaume-Uni': ['Londres','Manchester','Birmingham','Autre'],
  Allemagne: ['Berlin','Munich','Hambourg','Autre'],
  Autre: ['Autre'],
}

export default function Register() {
  const { C, t } = useApp()
  const router = useRouter()
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    full_name: '', email: '', password: '',
    pays_origine: '', pays_accueil: '', ville_accueil: '', ville_custom: '',
    statut: '', date_arrivee: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const step1ok = form.full_name && form.email.includes('@') && form.password.length >= 8
  const step2ok = form.pays_origine && form.pays_accueil && form.ville_accueil && (form.ville_accueil !== 'Autre' || form.ville_custom) && form.statut

  const handleGoogle = async () => {
    await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/onboarding` } })
  }

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const { data, error: e } = await sb.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name } }
      })
      if (e) throw e
      if (data.user) {
        const ville = form.ville_accueil === 'Autre' ? form.ville_custom : form.ville_accueil
        await sb.from('profiles').upsert({
          id: data.user.id, email: form.email, full_name: form.full_name,
          pays_origine: form.pays_origine, pays_accueil: form.pays_accueil,
          ville_accueil: ville, ville_custom: form.ville_custom,
          statut: form.statut, date_arrivee: form.date_arrivee || null,
          onboarding_complete: true,
        })
      }
      router.push('/dashboard')
    } catch (e) {
      setError(e.message?.includes('already') ? 'Cet email est déjà utilisé.' : e.message)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '11px 14px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }
  const chip = (active) => ({ padding: '7px 15px', borderRadius: 20, border: `1px solid ${active ? C.accent + '60' : C.border}`, background: active ? C.accent + '18' : 'transparent', color: active ? C.accent2 : C.muted, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 4 }}>{t.register_title}</h1>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? C.accent : C.border, transition: 'background 0.3s' }} />)}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '26px 26px 22px' }}>

          {step === 1 && (
            <>
              <button onClick={handleGoogle} style={{ width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {t.login_google}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 12, color: C.muted }}>ou</span><div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <label style={lbl}>{t.register_name}</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Kofi Mensah" style={inp} />

              <label style={lbl}>{t.register_email}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ton@email.com" style={inp} />

              <label style={lbl}>{t.register_password}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={inp} minLength={8} />

              <button onClick={() => step1ok && setStep(2)} disabled={!step1ok}
                style={{ width: '100%', padding: '12px', background: step1ok ? C.accent : C.border, border: 'none', borderRadius: 10, color: step1ok ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: step1ok ? 'pointer' : 'not-allowed', marginTop: 22 }}>
                {t.continue} →
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 18 }}>
                {t.register_have_account}{' '}
                <Link href="/auth/login" style={{ color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>{t.nav_login}</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <label style={lbl}>{t.register_country_origin}</label>
              <input value={form.pays_origine} onChange={e => set('pays_origine', e.target.value)} placeholder="Côte d'Ivoire, Sénégal, Maroc..." style={inp} />

              <label style={lbl}>{t.register_country_dest}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {PAYS.map(p => <button key={p} onClick={() => { set('pays_accueil', p); set('ville_accueil', '') }} style={chip(form.pays_accueil === p)}>{p}</button>)}
              </div>

              {form.pays_accueil && (<>
                <label style={lbl}>{t.register_city}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                  {(VILLES[form.pays_accueil] || []).map(v => <button key={v} onClick={() => set('ville_accueil', v)} style={chip(form.ville_accueil === v)}>{v}</button>)}
                </div>
                {form.ville_accueil === 'Autre' && (
                  <input value={form.ville_custom} onChange={e => set('ville_custom', e.target.value)} placeholder={t.register_city_other} style={{ ...inp, marginTop: 10 }} />
                )}
              </>)}

              <label style={lbl}>{t.register_status}</label>
              <div style={{ display: 'flex', gap: 7 }}>
                {[{id:'etudiant',l:'🎓 '+t.status_student},{id:'travailleur',l:'💼 '+t.status_worker},{id:'famille',l:'👨‍👩‍👧 '+t.status_family}]
                  .map(s => <button key={s.id} onClick={() => set('statut', s.id)} style={chip(form.statut === s.id)}>{s.l}</button>)}
              </div>

              <label style={lbl}>{t.register_arrival}</label>
              <input type="date" value={form.date_arrivee} onChange={e => set('date_arrivee', e.target.value)} style={inp} />

              {error && <div style={{ padding: '10px 14px', background: `${C.error}15`, border: `1px solid ${C.error}40`, borderRadius: 9, color: C.error, fontSize: 13, marginTop: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 15, cursor: 'pointer' }}>← {t.back}</button>
                <button onClick={submit} disabled={!step2ok || loading}
                  style={{ flex: 2, padding: '12px', background: step2ok ? C.accent : C.border, border: 'none', borderRadius: 10, color: step2ok ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: step2ok && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '...' : t.register_btn}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 16 }}>
                <Link href="/auth/register-mentor" style={{ color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>{t.register_as_mentor}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
