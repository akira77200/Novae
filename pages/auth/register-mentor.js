// pages/auth/register-mentor.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

const SUJETS = ['PGWP','RAMQ','Logement','Emploi','Université','Budget','Banque','Immigration','RP','Express Entry','Impôts','Permis de travail']

const NIVEAUX = [
  { id: 'etudiant',      fr: 'Étudiant',      en: 'Student'      },
  { id: 'professionnel', fr: 'Professionnel', en: 'Professional' },
  { id: 'expert',        fr: 'Expert',        en: 'Expert'       },
]

export default function RegisterMentor() {
  const { C, sb, lang } = useApp()
  const router = useRouter()
  const isFr = lang === 'fr'

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
      setError(e.message?.includes('already')
        ? (isFr ? 'Cet email est déjà utilisé.' : 'This email is already in use.')
        : e.message)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '11px 14px', background: '#F7F7F5', border: '1px solid #EBEBE9', borderRadius: 10, color: '#0E1116', fontSize: 14, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6B6F76', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0E1116', marginBottom: 12 }}>
          {isFr ? 'Candidature envoyée' : 'Application submitted'}
        </h1>
        <p style={{ fontSize: 15, color: '#6B6F76', lineHeight: 1.7, marginBottom: 10 }}>
          {isFr
            ? <>Ton profil mentor a été créé. Il sera activé sous <strong style={{ color: '#0E1116' }}>48 heures</strong> après vérification.</>
            : <>Your mentor profile has been created. It will be activated within <strong style={{ color: '#0E1116' }}>48 hours</strong> after review.</>}
        </p>
        <p style={{ fontSize: 13, color: '#6B6F76', lineHeight: 1.7, marginBottom: 28 }}>
          {isFr
            ? 'Une fois activé, tu apparaîtras dans la liste des mentors et tu pourras recevoir des réservations.'
            : 'Once activated, you will appear in the mentor list and can start receiving bookings.'}
        </p>
        <button onClick={() => router.push('/')} style={{ padding: '12px 28px', background: '#0E1116', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          {isFr ? "Retour à l'accueil →" : 'Back to home →'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'system-ui,sans-serif', padding: '36px 20px 60px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0E1116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E1116', marginBottom: 4 }}>
            {isFr ? 'Devenir mentor' : 'Become a mentor'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B6F76' }}>
            {isFr
              ? 'Aide les nouveaux arrivants · Gagne 70% de chaque session'
              : 'Help newcomers · Earn 70% of each session'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {[1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? '#0E1116' : '#EBEBE9', transition: 'background 0.3s' }} />)}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBE9', borderRadius: 16, padding: '24px 24px 20px' }}>

          {step === 1 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0E1116', marginBottom: 4 }}>
                {isFr ? 'Étape 1 — Ton compte' : 'Step 1 — Your account'}
              </p>
              <label style={lbl}>{isFr ? 'Nom complet *' : 'Full name *'}</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Kwame Mensah" style={inp} />
              <label style={lbl}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
              <label style={lbl}>{isFr ? 'Mot de passe * (min. 8 caractères)' : 'Password * (min. 8 characters)'}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inp} minLength={8} />
              <button onClick={() => step1ok && setStep(2)} disabled={!step1ok}
                style={{ width: '100%', padding: '12px', background: step1ok ? '#0E1116' : '#EBEBE9', border: 'none', borderRadius: 10, color: step1ok ? '#fff' : '#6B6F76', fontWeight: 600, fontSize: 15, cursor: step1ok ? 'pointer' : 'not-allowed', marginTop: 20 }}>
                {isFr ? 'Continuer →' : 'Continue →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B6F76', marginTop: 14 }}>
                {isFr ? 'Déjà un compte ?' : 'Already have an account?'}{' '}
                <Link href="/auth/login" style={{ color: '#3A3D40', fontWeight: 600, textDecoration: 'none' }}>
                  {isFr ? 'Connexion' : 'Login'}
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0E1116', marginBottom: 4 }}>
                {isFr ? 'Étape 2 — Ton profil mentor' : 'Step 2 — Your mentor profile'}
              </p>

              <label style={lbl}>{isFr ? "Pays d'origine *" : 'Country of origin *'}</label>
              <input value={form.pays_origine} onChange={e => set('pays_origine', e.target.value)} placeholder="Côte d'Ivoire, Sénégal..." style={inp} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>{isFr ? "Pays d'accueil *" : 'Destination *'}</label>
                  <input value={form.pays_accueil} onChange={e => set('pays_accueil', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>{isFr ? 'Ville *' : 'City *'}</label>
                  <input value={form.ville_accueil} onChange={e => set('ville_accueil', e.target.value)} placeholder="Montréal..." style={inp} />
                </div>
              </div>

              <label style={lbl}>{isFr ? "Année d'arrivée" : 'Year of arrival'}</label>
              <input type="number" value={form.annee_arrivee} onChange={e => set('annee_arrivee', e.target.value)} placeholder="2021" min="2010" max="2026" style={inp} />

              <label style={lbl}>{isFr ? 'Niveau' : 'Level'}</label>
              <div style={{ display: 'flex', gap: 7 }}>
                {NIVEAUX.map(n => (
                  <button key={n.id} onClick={() => set('niveau', n.id)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1px solid ${form.niveau === n.id ? '#0E111660' : '#EBEBE9'}`, background: form.niveau === n.id ? '#0E111618' : 'transparent', color: form.niveau === n.id ? '#3A3D40' : '#6B6F76', fontSize: 13, cursor: 'pointer' }}>
                    {isFr ? n.fr : n.en}
                  </button>
                ))}
              </div>

              <label style={lbl}>{isFr ? 'Sujets * (min. 1)' : 'Topics * (min. 1)'}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SUJETS.map(s => (
                  <button key={s} onClick={() => toggleSujet(s)} style={{ padding: '6px 13px', borderRadius: 20, border: `1px solid ${form.sujets.includes(s) ? '#0E111660' : '#EBEBE9'}`, background: form.sujets.includes(s) ? '#0E111618' : 'transparent', color: form.sujets.includes(s) ? '#3A3D40' : '#6B6F76', fontSize: 12, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>

              <label style={lbl}>{isFr ? 'Bio * (min. 30 caractères)' : 'Bio * (min. 30 characters)'}</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                placeholder={isFr
                  ? "Arrivé de Côte d'Ivoire en 2022 pour l'informatique à UdeM. Je t'aide à éviter les erreurs que j'ai faites."
                  : "Arrived from Ivory Coast in 2022 to study CS at UdeM. I help you avoid the mistakes I made."}
                style={{ ...inp, resize: 'vertical', minHeight: 80 }} />
              <p style={{ fontSize: 11, color: form.bio.length >= 30 ? '#3A3D40' : '#6B6F76', marginTop: 4 }}>
                {form.bio.length}/30 {isFr ? 'minimum' : 'min'} {form.bio.length >= 30 ? '✓' : ''}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>{isFr ? 'Tarif 30 min (centimes CAD)' : 'Rate 30 min (CAD cents)'}</label>
                  <input type="number" value={form.tarif_30min} onChange={e => set('tarif_30min', e.target.value)} style={inp} />
                  <p style={{ fontSize: 11, color: '#6B6F76', marginTop: 3 }}>= {(parseInt(form.tarif_30min||0)/100).toFixed(2)} $ CAD</p>
                </div>
                <div>
                  <label style={lbl}>{isFr ? 'Tarif 45 min (centimes CAD)' : 'Rate 45 min (CAD cents)'}</label>
                  <input type="number" value={form.tarif_45min} onChange={e => set('tarif_45min', e.target.value)} style={inp} />
                  <p style={{ fontSize: 11, color: '#6B6F76', marginTop: 3 }}>= {(parseInt(form.tarif_45min||0)/100).toFixed(2)} $ CAD</p>
                </div>
              </div>

              <label style={lbl}>Calendly ({isFr ? 'optionnel' : 'optional'})</label>
              <input value={form.calendly_url} onChange={e => set('calendly_url', e.target.value)} placeholder="https://calendly.com/ton-nom" style={inp} />

              {error && <div style={{ padding: '10px 14px', background: '#DC262615', border: `1px solid ${'#DC2626'}40`, borderRadius: 9, color: '#DC2626', fontSize: 13, marginTop: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #EBEBE9', borderRadius: 10, color: '#6B6F76', fontSize: 14, cursor: 'pointer' }}>
                  {isFr ? '← Retour' : '← Back'}
                </button>
                <button onClick={submit} disabled={!step2ok || loading}
                  style={{ flex: 2, padding: '12px', background: step2ok ? '#0E1116' : '#EBEBE9', border: 'none', borderRadius: 10, color: step2ok ? '#fff' : '#6B6F76', fontWeight: 600, fontSize: 14, cursor: step2ok && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                  {loading
                    ? (isFr ? 'Envoi...' : 'Sending...')
                    : (isFr ? 'Soumettre ma candidature →' : 'Submit my application →')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
