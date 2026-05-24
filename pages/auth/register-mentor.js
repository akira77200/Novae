// pages/auth/register-mentor.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { useApp } from '../../context/AppContext'

const SUJETS = ['PGWP','RAMQ','Logement','Emploi','Université','Budget','Banque','Immigration','RP','Express Entry','Impôts','Permis de travail']

export default function RegisterMentor() {
  const { C } = useApp()
  const router = useRouter()
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [form,    setForm]    = useState({
    full_name: '', email: '', password: '', bio: '',
    pays_origine: '', pays_accueil: 'Canada', ville_accueil: '',
    annee_arrivee: '', sujets: [], niveau: 'etudiant',
    tarif_30min: '1499', tarif_45min: '1999', calendly_url: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleSujet = (s) => set('sujets', form.sujets.includes(s) ? form.sujets.filter(x => x !== s) : [...form.sujets, s])

  const step1ok = form.full_name && form.email.includes('@') && form.password.length >= 8
  const step2ok = form.pays_origine && form.ville_accueil && form.sujets.length > 0 && form.bio.length >= 30

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const { data, error: e } = await sb.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.full_name } } })
      if (e) throw e
      if (data.user) {
        await sb.from('profiles').upsert({ id: data.user.id, email: form.email, full_name: form.full_name, pays_origine: form.pays_origine, pays_accueil: form.pays_accueil, ville_accueil: form.ville_accueil })
        const { error: me } = await sb.from('mentors').insert({
          user_id: data.user.id, full_name: form.full_name, email: form.email, bio: form.bio,
          pays_origine: form.pays_origine, pays_accueil: form.pays_accueil, ville_accueil: form.ville_accueil,
          annee_arrivee: form.annee_arrivee ? parseInt(form.annee_arrivee) : null,
          sujets: form.sujets, niveau: form.niveau,
          tarif_30min: parseInt(form.tarif_30min) || 1499,
          tarif_45min: parseInt(form.tarif_45min) || 1999,
          calendly_url: form.calendly_url || null,
          actif: false, disponible: true,
        })
        if (me) throw me
      }
      setSuccess(true)
    } catch (e) {
      setError(e.message?.includes('already') ? 'Cet email est déjà utilisé.' : e.message)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '11px 14px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }

  if (success) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 12 }}>Candidature envoyée</h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
          Ton profil mentor a été créé. Il sera activé sous <strong style={{ color: C.text }}>48 heures</strong> après vérification.
        </p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
          Une fois activé, tu apparaîtras dans la liste des mentors et tu pourras recevoir des réservations.
        </p>
        <button onClick={() => router.push('/')} style={{ padding: '12px 28px', background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Retour à l'accueil →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', padding: '36px 20px 60px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>Devenir mentor</h1>
          <p style={{ fontSize: 13, color: C.muted }}>Aide les nouveaux arrivants · Gagne 70% de chaque session</p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {[1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? C.accent : C.border, transition: 'background 0.3s' }} />)}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 24px 20px' }}>

          {step === 1 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Étape 1 — Ton compte</p>
              <label style={lbl}>Nom complet *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Kwame Mensah" style={inp} />
              <label style={lbl}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
              <label style={lbl}>Mot de passe * (min. 8 caractères)</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inp} minLength={8} />
              <button onClick={() => step1ok && setStep(2)} disabled={!step1ok}
                style={{ width: '100%', padding: '12px', background: step1ok ? C.accent : C.border, border: 'none', borderRadius: 10, color: step1ok ? '#fff' : C.muted, fontWeight: 600, fontSize: 15, cursor: step1ok ? 'pointer' : 'not-allowed', marginTop: 20 }}>
                Continuer →
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 14 }}>
                Déjà un compte ?{' '}
                <Link href="/auth/login" style={{ color: C.accent2, fontWeight: 600, textDecoration: 'none' }}>Connexion</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Étape 2 — Ton profil mentor</p>

              <label style={lbl}>Pays d'origine *</label>
              <input value={form.pays_origine} onChange={e => set('pays_origine', e.target.value)} placeholder="Côte d'Ivoire, Sénégal..." style={inp} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>Pays d'accueil *</label><input value={form.pays_accueil} onChange={e => set('pays_accueil', e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Ville *</label><input value={form.ville_accueil} onChange={e => set('ville_accueil', e.target.value)} placeholder="Montréal..." style={inp} /></div>
              </div>

              <label style={lbl}>Année d'arrivée</label>
              <input type="number" value={form.annee_arrivee} onChange={e => set('annee_arrivee', e.target.value)} placeholder="2021" min="2010" max="2026" style={inp} />

              <label style={lbl}>Niveau</label>
              <div style={{ display: 'flex', gap: 7 }}>
                {[{id:'etudiant',l:'Étudiant'},{id:'professionnel',l:'Professionnel'},{id:'expert',l:'Expert'}].map(n => (
                  <button key={n.id} onClick={() => set('niveau', n.id)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1px solid ${form.niveau === n.id ? C.accent+'60' : C.border}`, background: form.niveau === n.id ? C.accent+'18' : 'transparent', color: form.niveau === n.id ? C.accent2 : C.muted, fontSize: 13, cursor: 'pointer' }}>
                    {n.l}
                  </button>
                ))}
              </div>

              <label style={lbl}>Sujets * (min. 1)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SUJETS.map(s => (
                  <button key={s} onClick={() => toggleSujet(s)} style={{ padding: '6px 13px', borderRadius: 20, border: `1px solid ${form.sujets.includes(s) ? C.accent+'60' : C.border}`, background: form.sujets.includes(s) ? C.accent+'18' : 'transparent', color: form.sujets.includes(s) ? C.accent2 : C.muted, fontSize: 12, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>

              <label style={lbl}>Bio * (min. 30 caractères)</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                placeholder="Arrivé de Côte d'Ivoire en 2022 pour l'informatique à UdeM. Je t'aide à éviter les erreurs que j'ai faites."
                style={{ ...inp, resize: 'vertical', minHeight: 80 }} />
              <p style={{ fontSize: 11, color: form.bio.length >= 30 ? C.success : C.muted, marginTop: 4 }}>
                {form.bio.length}/30 minimum {form.bio.length >= 30 ? '✓' : ''}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>Tarif 30 min (centimes CAD)</label>
                  <input type="number" value={form.tarif_30min} onChange={e => set('tarif_30min', e.target.value)} style={inp} />
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>= {(parseInt(form.tarif_30min||0)/100).toFixed(2)} $ CAD</p>
                </div>
                <div>
                  <label style={lbl}>Tarif 45 min (centimes CAD)</label>
                  <input type="number" value={form.tarif_45min} onChange={e => set('tarif_45min', e.target.value)} style={inp} />
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>= {(parseInt(form.tarif_45min||0)/100).toFixed(2)} $ CAD</p>
                </div>
              </div>

              <label style={lbl}>Lien Calendly (optionnel)</label>
              <input value={form.calendly_url} onChange={e => set('calendly_url', e.target.value)} placeholder="https://calendly.com/ton-nom" style={inp} />

              {error && <div style={{ padding: '10px 14px', background: `${C.error}15`, border: `1px solid ${C.error}40`, borderRadius: 9, color: C.error, fontSize: 13, marginTop: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                <button onClick={submit} disabled={!step2ok || loading}
                  style={{ flex: 2, padding: '12px', background: step2ok ? C.accent : C.border, border: 'none', borderRadius: 10, color: step2ok ? '#fff' : C.muted, fontWeight: 600, fontSize: 14, cursor: step2ok && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Envoi...' : 'Soumettre ma candidature →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
