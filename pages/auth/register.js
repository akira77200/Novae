// pages/auth/register.js — NOVAE v5 — Inscription
import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '../../context/AppContext'

const PAYS = ['Canada','France','Belgique','Royaume-Uni','Allemagne','Autre']

const PAYS_PAR_REGION = {
  "🌍 Afrique": [
    "Afrique du Sud","Algérie","Angola","Bénin","Botswana","Burkina Faso",
    "Burundi","Cameroun","Cap-Vert","Centrafrique","Comores","Congo",
    "Côte d'Ivoire","Djibouti","Égypte","Éthiopie","Gabon","Gambie","Ghana",
    "Guinée","Guinée-Bissau","Kenya","Lesotho","Libéria","Libye",
    "Madagascar","Malawi","Mali","Maroc","Maurice","Mauritanie","Mozambique",
    "Namibie","Niger","Nigeria","Ouganda","Rwanda","Sénégal","Sierra Leone",
    "Somalie","Soudan","Tanzanie","Tchad","Togo","Tunisie","Zambie","Zimbabwe",
  ],
  "🌏 Asie": [
    "Afghanistan","Arabie Saoudite","Bangladesh","Birmanie","Cambodge",
    "Chine","Corée du Sud","Émirats arabes unis","Inde","Indonésie","Irak",
    "Iran","Israël","Japon","Jordanie","Kazakhstan","Koweït","Laos","Liban",
    "Malaisie","Mongolie","Népal","Oman","Ouzbékistan","Pakistan","Philippines",
    "Qatar","Singapour","Sri Lanka","Syrie","Taïwan","Thaïlande","Turquie",
    "Viêt Nam","Yémen",
  ],
  "🌎 Amériques": [
    "Argentine","Bolivie","Brésil","Chili","Colombie","Costa Rica","Cuba",
    "Équateur","États-Unis","Guatemala","Haïti","Honduras","Jamaïque",
    "Mexique","Nicaragua","Panama","Paraguay","Pérou",
    "République dominicaine","Salvador","Suriname","Trinité-et-Tobago",
    "Uruguay","Venezuela",
  ],
  "🌍 Europe": [
    "Albanie","Allemagne","Autriche","Belgique","Biélorussie","Bulgarie",
    "Croatie","Danemark","Espagne","Finlande","France","Grèce","Hongrie",
    "Irlande","Italie","Moldavie","Norvège","Pays-Bas","Pologne","Portugal",
    "République tchèque","Roumanie","Royaume-Uni","Russie","Serbie",
    "Slovaquie","Slovénie","Suède","Suisse","Ukraine",
  ],
  "🌊 Océanie": [
    "Australie","Fidji","Nouvelle-Zélande","Papouasie-Nouvelle-Guinée","Samoa",
  ],
}
const VILLES = {
  Canada:       ['Montréal','Toronto','Vancouver','Québec','Ottawa','Gatineau','Calgary','Autre'],
  France:       ['Paris','Lyon','Marseille','Bordeaux','Toulouse','Autre'],
  Belgique:     ['Bruxelles','Liège','Gand','Autre'],
  'Royaume-Uni':['Londres','Manchester','Birmingham','Autre'],
  Allemagne:    ['Berlin','Munich','Hambourg','Autre'],
  Autre:        ['Autre'],
}

export default function Register() {
  const { C, t, lang, sb, theme } = useApp()

  const [step,     setStep]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [welcome,  setWelcome]  = useState(false)
  const [sentEmail,setSentEmail]= useState('')

  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    pays_origine: '', pays_accueil: '', ville_accueil: '', ville_custom: '',
    statut: '', date_arrivee: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const envoyerBienvenue = async (email, fullName) => {
    const prenom = fullName?.trim().split(/\s+/)[0] || ''
    try {
      await fetch('/api/email/bienvenue', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, prenom }),
      })
    } catch (_) { /* MVP — silencieux */ }
  }

  // Validations
  const emailOk   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const passOk    = form.password.length >= 8
  const matchOk   = form.password === form.confirm_password && form.confirm_password.length > 0
  const step1ok   = form.full_name.trim().length >= 2 && emailOk && passOk && matchOk
  const step2ok   = form.pays_origine && form.pays_accueil && form.ville_accueil &&
                    (form.ville_accueil !== 'Autre' || form.ville_custom) && form.statut

  const handleGoogle = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${base}/auth/callback` },
    })
  }

  const submit = async () => {
    if (!step2ok || loading) return
    setLoading(true); setError('')
    try {
      const ville = form.ville_accueil === 'Autre' ? form.ville_custom : form.ville_accueil

      const { data, error: e } = await sb.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options:  { data: { full_name: form.full_name.trim() } },
      })
      if (e) throw e

      // Sauvegarde profil si user créé (session immédiate ou après confirmation)
      const userId = data.user?.id
      if (userId) {
        await sb.from('profiles').upsert({
          id:                userId,
          email:             form.email.trim().toLowerCase(),
          full_name:         form.full_name.trim(),
          pays_origine:      form.pays_origine,
          pays_accueil:      form.pays_accueil,
          ville_accueil:     ville,
          ville_custom:      form.ville_custom || null,
          statut:            form.statut,
          date_arrivee:      form.date_arrivee || null,
          onboarding_complete: true,
        })
      }

      await envoyerBienvenue(form.email.trim().toLowerCase(), form.full_name.trim())

      // Supabase peut nécessiter une confirmation email
      if (!data.session) {
        setSentEmail(form.email.trim())
        setSuccess(true)
      } else {
        setWelcome(true)
      }
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('already') || msg.includes('exists'))
        setError(lang === 'fr' ? 'Cet email est déjà utilisé. Essaie de te connecter.' : 'This email is already in use. Try signing in.')
      else if (msg.includes('password'))
        setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.')
      else
        setError(msg || (lang === 'fr' ? 'Une erreur est survenue. Réessaie.' : 'An error occurred. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const inp  = { width: '100%', padding: '11px 14px', background: '#F7F7F5', border: '1px solid #EBEBE9', borderRadius: 10, color: '#0E1116', fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }
  const lbl  = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6F76', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }
  const chip = (active) => ({ padding: '7px 15px', borderRadius: 20, border: `1px solid ${active ? '#0E111660' : '#EBEBE9'}`, background: active ? '#0E111618' : 'transparent', color: active ? '#3A3D40' : '#6B6F76', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' })

  // ── Écran bienvenue — compte activé immédiatement ──────────────
  if (welcome) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0E1116', marginBottom: 12 }}>
          {lang === 'fr'
            ? `Bienvenue sur Novae${form.full_name.trim() ? `, ${form.full_name.trim().split(/\s+/)[0]}` : ''} !`
            : `Welcome to Novae${form.full_name.trim() ? `, ${form.full_name.trim().split(/\s+/)[0]}` : ''}!`}
        </h2>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBE9', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#6B6F76', lineHeight: 1.7 }}>
            {lang === 'fr'
              ? <>Ton compte est prêt. Commence par ta checklist d'arrivée et explore les guides gratuits pour tes premières démarches au Canada.</>
              : <>Your account is ready. Start with your arrival checklist and explore free guides for your first steps in Canada.</>}
          </p>
        </div>
        <Link href="/dashboard" style={{ display: 'inline-block', padding: '11px 24px', background: '#0E1116', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          {lang === 'fr' ? 'Accéder à mon tableau de bord →' : 'Go to my dashboard →'}
        </Link>
      </div>
    </div>
  )

  // ── Écran succès — confirmation email ──────────────────────────
  if (success) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>📬</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0E1116', marginBottom: 12 }}>
          {lang === 'fr' ? 'Bienvenue sur Novae !' : 'Welcome to Novae!'}
        </h2>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBE9', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#6B6F76', lineHeight: 1.7 }}>
            {lang === 'fr'
              ? <>Un email de confirmation a été envoyé à <strong style={{ color: '#0E1116' }}>{sentEmail}</strong>.<br />Clique sur le lien pour activer ton compte.<br /><br />Tu ne le trouves pas ? Vérifie tes <strong>spams</strong>.<br /><br />Un message de bienvenue t'attend une fois ton compte activé.</>
              : <>A confirmation email was sent to <strong style={{ color: '#0E1116' }}>{sentEmail}</strong>.<br />Click the link to activate your account.<br /><br />Can't find it? Check your <strong>spam folder</strong>.<br /><br />A welcome message awaits you once your account is active.</>}
          </p>
        </div>
        <Link href="/auth/login" style={{ display: 'inline-block', padding: '11px 24px', background: '#0E1116', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          {lang === 'fr' ? '← Retour à la connexion' : '← Back to login'}
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0E1116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>N</div>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: -0.3, marginBottom: 4 }}>{t.register_title}</h1>
        </div>

        {/* Barre progression */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1,2].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? '#0E1116' : '#EBEBE9', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBE9', borderRadius: 16, padding: '26px 26px 22px' }}>

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <>
              <button onClick={handleGoogle} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #EBEBE9', background: 'transparent', color: '#0E1116', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#0E1116" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#3A3D40" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#6B6F76" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#DC2626" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.login_google}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: '#EBEBE9' }} />
                <span style={{ fontSize: 12, color: '#6B6F76' }}>{lang === 'fr' ? 'ou' : 'or'}</span>
                <div style={{ flex: 1, height: 1, background: '#EBEBE9' }} />
              </div>

              <label style={lbl}>{t.register_name}</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Kofi Mensah" style={inp} autoComplete="name" />

              <label style={lbl}>{t.register_email}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ton@email.com" style={inp} autoComplete="email" />
              {form.email && !emailOk && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{lang === 'fr' ? 'Email invalide' : 'Invalid email'}</p>}

              <label style={lbl}>{t.register_password}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={inp} autoComplete="new-password" />
              {form.password && !passOk && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{lang === 'fr' ? 'Minimum 8 caractères' : 'Minimum 8 characters'}</p>}

              <label style={lbl}>{lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}</label>
              <input type="password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="••••••••" style={inp} autoComplete="new-password" />
              {form.confirm_password && !matchOk && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}</p>}

              <button onClick={() => step1ok && setStep(2)} disabled={!step1ok}
                style={{ width: '100%', padding: '12px', background: step1ok ? '#0E1116' : '#EBEBE9', border: 'none', borderRadius: 10, color: step1ok ? '#fff' : '#6B6F76', fontWeight: 600, fontSize: 15, cursor: step1ok ? 'pointer' : 'not-allowed', marginTop: 22 }}>
                {t.continue} →
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B6F76', marginTop: 18 }}>
                {t.register_have_account}{' '}
                <Link href="/auth/login" style={{ color: '#3A3D40', fontWeight: 600, textDecoration: 'none' }}>{t.nav_login}</Link>
              </p>
            </>
          )}

          {/* ── ÉTAPE 2 ── */}
          {step === 2 && (
            <>
              <label style={lbl}>{t.register_country_origin}</label>
              <select
                value={form.pays_origine}
                onChange={e => set('pays_origine', e.target.value)}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: '8px', border: '1px solid #0E111640',
                  background: theme === 'dark' ? '#0E1116' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  colorScheme: theme === 'dark' ? 'dark' : 'light',
                }}
              >
                <option value="">{lang === 'fr' ? '— Sélectionne ton pays —' : '— Select your country —'}</option>
                {Object.entries(PAYS_PAR_REGION).map(([region, pays]) => (
                  <optgroup key={region} label={region}>
                    {pays.map(p => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                ))}
                <option value="Autre">🌐 {lang === 'fr' ? 'Mon pays n\'est pas dans la liste' : 'My country is not listed'}</option>
              </select>
              {form.pays_origine === 'Autre' && (
                <input
                  type="text"
                  placeholder={lang === 'fr' ? 'Écris ton pays ici...' : 'Write your country here...'}
                  onChange={e => set('pays_origine', e.target.value)}
                  style={{ marginTop:'8px', width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #0E1116', background:'transparent', color:'inherit', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }}
                />
              )}

              <label style={lbl}>{t.register_country_dest}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {PAYS.map(p => (
                  <button key={p} onClick={() => { set('pays_accueil', p); set('ville_accueil', '') }} style={chip(form.pays_accueil === p)}>{p}</button>
                ))}
              </div>

              {form.pays_accueil && (
                <>
                  <label style={lbl}>{t.register_city}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                    {(VILLES[form.pays_accueil] || []).map(v => (
                      <button key={v} onClick={() => set('ville_accueil', v)} style={chip(form.ville_accueil === v)}>{v}</button>
                    ))}
                  </div>
                  {form.ville_accueil === 'Autre' && (
                    <input value={form.ville_custom} onChange={e => set('ville_custom', e.target.value)} placeholder={t.register_city_other} style={{ ...inp, marginTop: 10 }} />
                  )}
                </>
              )}

              <label style={lbl}>{t.register_status}</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {[
                  { id:'etudiant',    l: '🎓 ' + t.status_student },
                  { id:'travailleur', l: '💼 ' + t.status_worker  },
                  { id:'famille',     l: '👨‍👩‍👧 ' + t.status_family  },
                ].map(s => (
                  <button key={s.id} onClick={() => set('statut', s.id)} style={chip(form.statut === s.id)}>{s.l}</button>
                ))}
              </div>

              <label style={lbl}>{t.register_arrival}</label>
              <input type="date" value={form.date_arrivee} onChange={e => set('date_arrivee', e.target.value)} style={inp} />

              {error && (
                <div style={{ padding: '10px 14px', background: '#DC262615', border: `1px solid ${'#DC2626'}40`, borderRadius: 9, color: '#DC2626', fontSize: 13, marginTop: 14 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #EBEBE9', borderRadius: 10, color: '#6B6F76', fontSize: 15, cursor: 'pointer' }}>
                  ← {t.back}
                </button>
                <button onClick={submit} disabled={!step2ok || loading}
                  style={{ flex: 2, padding: '12px', background: step2ok ? '#0E1116' : '#EBEBE9', border: 'none', borderRadius: 10, color: step2ok ? '#fff' : '#6B6F76', fontWeight: 600, fontSize: 15, cursor: step2ok && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}>
                  {loading ? (lang === 'fr' ? 'Création...' : 'Creating...') : t.register_btn}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B6F76', marginTop: 16 }}>
                <Link href="/auth/register-mentor" style={{ color: '#3A3D40', fontWeight: 600, textDecoration: 'none' }}>{t.register_as_mentor}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
