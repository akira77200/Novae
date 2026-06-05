// context/AppContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const AppContext = createContext({})

const sb = typeof window !== 'undefined'
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'novae-auth',
        storage: {
          getItem:    (key) => { if (typeof window === 'undefined') return null;  return window.localStorage.getItem(key) },
          setItem:    (key, value) => { if (typeof window === 'undefined') return; window.localStorage.setItem(key, value) },
          removeItem: (key) => { if (typeof window === 'undefined') return; window.localStorage.removeItem(key) }
        }
      }
    })
  : null

// ── Limites par plan ───────────────────────────────────────────────
export const PLAN_LIMITS = {
  gratuit:  { cv: 1,   nova_daily: 5,   entrevue_monthly: 0   },
  starter:  { cv: 5,   nova_daily: 20,  entrevue_monthly: 3   },
  premium:  { cv: 999, nova_daily: 999, entrevie_monthly: 999 }
}

// ── Palette premium sobre ─────────────────────────────────────────
export const PALETTE = {
  dark: {
    bg:       '#0F0F0F',
    bg2:      '#141414',
    surface:  '#1C1C1E',
    surface2: '#242426',
    accent:   '#2D6A4F',
    accent2:  '#52B788',
    rose:     '#B5838D',
    text:     '#F5F5F4',
    text2:    '#D4D4D0',
    muted:    '#6B7280',
    muted2:   '#9CA3AF',
    border:   'rgba(255,255,255,0.07)',
    border2:  'rgba(255,255,255,0.13)',
    error:    '#F87171',
    warning:  '#FBBF24',
    success:  '#34D399',
  },
  light: {
    bg:       '#FAFAF9',
    bg2:      '#F5F5F3',
    surface:  '#FFFFFF',
    surface2: '#F9F9F8',
    accent:   '#2D6A4F',
    accent2:  '#52B788',
    rose:     '#B5838D',
    text:     '#1A1A1A',
    text2:    '#3A3A3A',
    muted:    '#6B7280',
    muted2:   '#9CA3AF',
    border:   'rgba(0,0,0,0.08)',
    border2:  'rgba(0,0,0,0.14)',
    error:    '#EF4444',
    warning:  '#F59E0B',
    success:  '#10B981',
  }
}

// ── Traductions ───────────────────────────────────────────────────
export const T = {
  fr: {
    app_name: 'Novae',
    tagline: 'Ton guide d\'arrivée au Canada',
    nav_home: 'Accueil',
    nav_checklist: 'Checklist',
    nav_culture: 'Culture',
    nav_daily: 'Quotidien',
    nav_todo: 'Mes tâches',
    nav_arrival: 'Arrivée',
    nav_mentors: 'Mentors',
    nav_future: 'Mon Avenir',
    nav_ebooks: 'Ebooks',
    nav_login: 'Connexion',
    nav_register: 'S\'inscrire',
    nav_logout: 'Déconnexion',
    nav_profile: 'Mon profil',
    loading: 'Chargement...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    close: 'Fermer',
    back: 'Retour',
    continue: 'Continuer',
    error_generic: 'Une erreur est survenue. Réessaie.',
    login_title: 'Connexion',
    login_email: 'Adresse email',
    login_password: 'Mot de passe',
    login_btn: 'Se connecter',
    login_google: 'Continuer avec Google',
    login_no_account: 'Pas encore de compte ?',
    login_signup: 'S\'inscrire',
    login_forgot: 'Mot de passe oublié ?',
    register_title: 'Créer un compte',
    register_name: 'Nom complet',
    register_email: 'Adresse email',
    register_password: 'Mot de passe (min. 8 caractères)',
    register_country_origin: 'Pays d\'origine',
    register_country_dest: 'Pays d\'accueil',
    register_city: 'Ville d\'accueil',
    register_city_other: 'Précise ta ville',
    register_status: 'Statut',
    register_arrival: 'Date d\'arrivée',
    register_btn: 'Créer mon compte',
    register_have_account: 'Déjà un compte ?',
    register_as_mentor: 'Devenir mentor →',
    status_student: 'Étudiant(e)',
    status_worker: 'Travailleur(se)',
    status_family: 'Famille',
    dash_welcome: 'Bienvenue',
    dash_progress: 'Progression',
    dash_done: 'Complétées',
    dash_remaining: 'Restantes',
    dash_since: 'Depuis l\'arrivée',
    checklist_all: 'Toutes',
    checklist_todo: 'À faire',
    checklist_done: 'Faites',
    mentor_title: 'Mentors disponibles',
    mentor_book: 'Réserver',
    mentor_empty: 'Aucun mentor disponible pour le moment.',
    mentor_become: 'Devenir mentor',
    ebook_title: 'Guides gratuits',
    ebook_read: 'Lire & Télécharger',
    guide_title: 'Guides premium',
    guide_buy: 'Acheter',
    culture_title: 'Culture canadienne',
    daily_title: 'Vie quotidienne',
    todo_title: 'Mes tâches',
    todo_add: 'Ajouter',
    todo_placeholder: 'Nouvelle tâche...',
    todo_empty: 'Aucune tâche. Ajoutes-en une.',
    arrival_title: 'Guide d\'arrivée',
    secure_payment: 'Paiement sécurisé · Stripe · CAD',
    refund_policy: 'Remboursé si annulation 24h avant',
  },
  en: {
    app_name: 'Novae',
    tagline: 'Your arrival guide to Canada',
    nav_home: 'Home',
    nav_checklist: 'Checklist',
    nav_culture: 'Culture',
    nav_daily: 'Daily Life',
    nav_todo: 'My Tasks',
    nav_arrival: 'Arrival',
    nav_mentors: 'Mentors',
    nav_future: 'My Future',
    nav_ebooks: 'Ebooks',
    nav_login: 'Login',
    nav_register: 'Sign up',
    nav_logout: 'Logout',
    nav_profile: 'My profile',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    continue: 'Continue',
    error_generic: 'An error occurred. Please try again.',
    login_title: 'Sign in',
    login_email: 'Email address',
    login_password: 'Password',
    login_btn: 'Sign in',
    login_google: 'Continue with Google',
    login_no_account: 'No account yet?',
    login_signup: 'Sign up',
    login_forgot: 'Forgot password?',
    register_title: 'Create an account',
    register_name: 'Full name',
    register_email: 'Email address',
    register_password: 'Password (min. 8 characters)',
    register_country_origin: 'Country of origin',
    register_country_dest: 'Destination country',
    register_city: 'City',
    register_city_other: 'Enter your city',
    register_status: 'Status',
    register_arrival: 'Arrival date',
    register_btn: 'Create my account',
    register_have_account: 'Already have an account?',
    register_as_mentor: 'Become a mentor →',
    status_student: 'Student',
    status_worker: 'Worker',
    status_family: 'Family',
    dash_welcome: 'Welcome',
    dash_progress: 'Progress',
    dash_done: 'Completed',
    dash_remaining: 'Remaining',
    dash_since: 'Since arrival',
    checklist_all: 'All',
    checklist_todo: 'To do',
    checklist_done: 'Done',
    mentor_title: 'Available Mentors',
    mentor_book: 'Book',
    mentor_empty: 'No mentors available right now.',
    mentor_become: 'Become a mentor',
    ebook_title: 'Free Guides',
    ebook_read: 'Read & Download',
    guide_title: 'Premium Guides',
    guide_buy: 'Buy',
    culture_title: 'Canadian Culture',
    daily_title: 'Daily Life',
    todo_title: 'My Tasks',
    todo_add: 'Add',
    todo_placeholder: 'New task...',
    todo_empty: 'No tasks yet. Add one above.',
    arrival_title: 'Arrival Guide',
    secure_payment: 'Secure payment · Stripe · CAD',
    refund_policy: 'Refunded if cancelled 24h before',
  }
}

export function AppProvider({ children }) {
  const [lang,    setLangState]  = useState('fr')
  const [theme,   setThemeState] = useState('dark')
  const [user,    setUser]       = useState(null)
  const [profile, setProfile]    = useState(null)
  const [loading, setLoading]    = useState(true)
  const [mounted, setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!sb) return
    const l = localStorage.getItem('novae_lang')  || 'fr'
    const t = localStorage.getItem('novae_theme') || 'dark'
    setLangState(l); setThemeState(t)

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      console.log('[auth] event:', event, 'session:', session?.user?.email)
      setUser(session?.user || null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (id) => {
    try {
      const { data } = await sb.from('profiles').select('*').eq('id', id).single()
      if (data) {
        setProfile(data)
      } else {
        // Profil manquant — créer automatiquement
        const { data: { user } } = await sb.auth.getUser()
        if (user) {
          const { data: newProfile } = await sb.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          }).select().single()
          setProfile(newProfile)
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const setLang  = (l) => { setLangState(l);  if (typeof window !== 'undefined') localStorage.setItem('novae_lang', l) }
  const setTheme = (t) => { setThemeState(t); if (typeof window !== 'undefined') localStorage.setItem('novae_theme', t) }
  const C = PALETTE[theme] || PALETTE.dark
  const t = T[lang] || T.fr
  const refreshProfile = () => user && loadProfile(user.id)
  const userPlan = profile?.plan || 'gratuit'
  const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.gratuit

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, C, t, user, profile, loading, mounted, sb, refreshProfile, userPlan, planLimits }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
