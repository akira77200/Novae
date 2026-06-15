// pages/day-to-day.js
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

import { useApp } from '../context/AppContext'
import FeedbackSection from '../components/FeedbackSection'
import SAFE_LINKS from '../lib/safeLinks'

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', borderRadius: '12px', color: '#888', fontSize: 14 }}>
      Loading map...
    </div>
  ),
})

const PRICES = {
  Montreal: [
    { produit: 'Lait 4L',       maxi: 5.49,  superc: 5.29, iga: 5.99, walmart: 5.19 },
    { produit: 'Pain tranché',   maxi: 3.99,  superc: 3.79, iga: 4.29, walmart: 3.49 },
    { produit: 'Poulet entier',  maxi: 10.99, superc: 10.49,iga: 12.99,walmart: 9.99  },
    { produit: 'Riz 2kg',        maxi: 4.99,  superc: 4.79, iga: 5.49, walmart: 4.49 },
    { produit: 'Œufs 12',        maxi: 5.49,  superc: 5.29, iga: 5.99, walmart: 5.09 },
    { produit: 'Tomates 1kg',    maxi: 2.99,  superc: 2.79, iga: 3.49, walmart: 2.69 },
    { produit: 'Bananes 1kg',    maxi: 1.49,  superc: 1.29, iga: 1.79, walmart: 1.19 },
    { produit: 'Pâtes 900g',     maxi: 2.49,  superc: 2.29, iga: 2.99, walmart: 2.19 },
  ],
  Toronto: [
    { produit: 'Lait 4L',        maxi: 5.99, superc: null, iga: 6.49, walmart: 5.49 },
    { produit: 'Pain tranché',   maxi: 4.29, superc: null, iga: 4.79, walmart: 3.79 },
    { produit: 'Poulet entier',  maxi: 11.99,superc: null, iga: 13.99,walmart: 10.99 },
    { produit: 'Riz 2kg',        maxi: 5.49, superc: null, iga: 5.99, walmart: 4.99 },
  ],
}

// ── Données coût de la vie ────────────────────────────────────────
const COUT_VILLES = {
  Montreal: {
    label: 'Montréal',
    loyer_studio: 1350, loyer_coloc: 900,
    epicerie: 380, transport: 109, telephone: 40, internet: 60, loisirs: 100,
    smig_h: 16.10, note: 'STM mensuel : 109 $/mois · RAMQ couvre la santé',
  },
  Toronto: {
    label: 'Toronto',
    loyer_studio: 1900, loyer_coloc: 1250,
    epicerie: 420, transport: 156, telephone: 45, internet: 65, loisirs: 120,
    smig_h: 17.20, note: 'TTC mensuel : 156 $/mois · OHIP pour la santé',
  },
  Vancouver: {
    label: 'Vancouver',
    loyer_studio: 2100, loyer_coloc: 1300,
    epicerie: 430, transport: 109, telephone: 45, internet: 65, loisirs: 130,
    smig_h: 17.40, note: 'TransLink mensuel : 109 $/mois',
  },
  Ottawa: {
    label: 'Ottawa',
    loyer_studio: 1500, loyer_coloc: 1000,
    epicerie: 390, transport: 125, telephone: 40, internet: 60, loisirs: 100,
    smig_h: 16.55, note: 'OC Transpo mensuel : 125 $/mois',
  },
  Calgary: {
    label: 'Calgary',
    loyer_studio: 1450, loyer_coloc: 950,
    epicerie: 400, transport: 115, telephone: 45, internet: 60, loisirs: 110,
    smig_h: 15.00, note: 'Calgary Transit : 115 $/mois · Pas de taxe provinciale',
  },
  Quebec: {
    label: 'Québec',
    loyer_studio: 1050, loyer_coloc: 700,
    epicerie: 350, transport: 96, telephone: 38, internet: 58, loisirs: 90,
    smig_h: 16.10, note: 'RTC mensuel : 96 $/mois · RAMQ couvre la santé',
  },
}

const POSTES_BUDGET = [
  { id: 'loyer',     fr: 'Loyer',      en: 'Rent',      icon: '🏠', color: '#52B788' },
  { id: 'epicerie',  fr: 'Épicerie',   en: 'Groceries', icon: '🛒', color: '#FBBF24' },
  { id: 'transport', fr: 'Transport',  en: 'Transit',   icon: '🚇', color: '#60A5FA' },
  { id: 'telephone', fr: 'Téléphone',  en: 'Phone',     icon: '📱', color: '#B5838D' },
  { id: 'internet',  fr: 'Internet',   en: 'Internet',  icon: '📡', color: '#A78BFA' },
  { id: 'loisirs',   fr: 'Loisirs',    en: 'Leisure',   icon: '🎭', color: '#F97316' },
]

// ── Données convertisseur devises ─────────────────────────────────
// Taux : combien d'unités locales pour 1 CAD
const DEVISES = [
  { code: 'XOF', nom: 'Franc CFA (BCEAO)', pays: 'Sénégal, Côte d\'Ivoire, Mali…', taux: 440,   drapeau: '🇸🇳', ex: 200000 },
  { code: 'XAF', nom: 'Franc CFA (BEAC)',  pays: 'Cameroun, Gabon, Congo…',         taux: 440,   drapeau: '🇨🇲', ex: 200000 },
  { code: 'MAD', nom: 'Dirham marocain',   pays: 'Maroc',                            taux: 4.15,  drapeau: '🇲🇦', ex: 10000  },
  { code: 'DZD', nom: 'Dinar algérien',    pays: 'Algérie',                          taux: 100,   drapeau: '🇩🇿', ex: 50000  },
  { code: 'TND', nom: 'Dinar tunisien',    pays: 'Tunisie',                          taux: 2.25,  drapeau: '🇹🇳', ex: 3000   },
  { code: 'NGN', nom: 'Naira nigérian',    pays: 'Nigeria',                          taux: 1000,  drapeau: '🇳🇬', ex: 500000 },
  { code: 'GHS', nom: 'Cédi ghanéen',      pays: 'Ghana',                            taux: 17,    drapeau: '🇬🇭', ex: 20000  },
  { code: 'KES', nom: 'Shilling kényan',   pays: 'Kenya',                            taux: 95,    drapeau: '🇰🇪', ex: 50000  },
  { code: 'ETB', nom: 'Birr éthiopien',    pays: 'Éthiopie',                         taux: 80,    drapeau: '🇪🇹', ex: 30000  },
  { code: 'EGP', nom: 'Livre égyptienne',  pays: 'Égypte',                           taux: 22,    drapeau: '🇪🇬', ex: 15000  },
  { code: 'EUR', nom: 'Euro',              pays: 'Zone euro / France',               taux: 0.68,  drapeau: '🇪🇺', ex: 1000   },
  { code: 'USD', nom: 'Dollar américain',  pays: 'USA',                              taux: 0.73,  drapeau: '🇺🇸', ex: 1000   },
]

// Exemples de dépenses courantes en CAD pour contextualiser
const EXEMPLES_CAD = [
  { label: 'Mensuel STM (Montréal)',  cad: 109 },
  { label: 'Épicerie / semaine',       cad: 80  },
  { label: 'Loyer coloc / mois',       cad: 900 },
  { label: 'Forfait téléphone',        cad: 40  },
  { label: 'Repas resto rapide',       cad: 15  },
]

// ── Données logement par ville ────────────────────────────────────
const LOGEMENT_DATA = {
  Montreal: {
    label: 'Montréal',
    options: [
      {
        type: 'Chambre en colocation', type_en: 'Shared room',
        budget_min: 500, budget_max: 950,
        description: 'Appartement partagé avec 2–4 colocataires', description_en: 'Apartment shared with 2–4 roommates',
        quartiers: ['Rosemont','Plateau-Mont-Royal','Côte-des-Neiges'],
        avantages: ['Moins cher','Souvent meublé','Rencontres sociales'],
        avantages_en: ['Cheaper','Often furnished','Social connections'],
        inconvenients: ["Moins d'intimité",'Règles communes'],
        inconvenients_en: ['Less privacy','Shared rules'],
        conseil: 'Idéal pour les 6 premiers mois', conseil_en: 'Ideal for the first 6 months',
        lien: 'https://www.kijiji.ca/b-colocation/montreal/k0l80002',
      },
      {
        type: 'Studio / 3½', type_en: 'Studio / 1-bedroom',
        budget_min: 950, budget_max: 1450,
        description: 'Appartement seul, entrée indépendante', description_en: 'Solo apartment, private entrance',
        quartiers: ['Verdun','Mercier','Saint-Michel','Rosemont'],
        avantages: ['Intimité totale','Liberté','Pas de conflits'],
        avantages_en: ['Full privacy','Freedom','No conflicts'],
        inconvenients: ['Plus cher','Souvent non meublé'],
        inconvenients_en: ['More expensive','Often unfurnished'],
        conseil: "Prévoir 1er mois + dépôt = 2× le loyer avant d'arriver", conseil_en: 'Budget 1st month + deposit = 2× rent before arrival',
        lien: 'https://www.kijiji.ca/b-appartement-condo/montreal/k0l80002',
      },
      {
        type: 'Résidence universitaire', type_en: 'University residence',
        budget_min: 700, budget_max: 1250,
        description: 'Chambre sur le campus universitaire', description_en: 'Room on the university campus',
        quartiers: ['Sur campus'],
        avantages: ['Tout inclus','Sécurité','Communauté étudiante'],
        avantages_en: ['All-inclusive','Safe','Student community'],
        inconvenients: ['Places limitées','Règles strictes','Moins de liberté'],
        inconvenients_en: ['Limited spots','Strict rules','Less freedom'],
        conseil: 'Réserver dès l\'admission — places limitées !', conseil_en: 'Book right at admission — spots are limited!',
        lien: 'https://www.umontreal.ca/etudiant-e-s/residences',
      },
    ],
  },
  Toronto: {
    label: 'Toronto',
    options: [
      {
        type: 'Chambre en colocation', type_en: 'Shared room',
        budget_min: 800, budget_max: 1300,
        description: 'Chambre dans une maison partagée', description_en: 'Room in a shared house',
        quartiers: ['Scarborough','North York','Etobicoke'],
        avantages: ['Moins cher','Réseau social rapide'],
        avantages_en: ['Cheaper','Quick social network'],
        inconvenients: ["Moins d'intimité",'Trajets plus longs'],
        inconvenients_en: ['Less privacy','Longer commutes'],
        conseil: 'Facebook Marketplace est très utilisé à Toronto', conseil_en: 'Facebook Marketplace is heavily used in Toronto',
        lien: 'https://www.kijiji.ca/b-colocation/toronto/k0l1700273',
      },
      {
        type: 'Studio / Bachelor', type_en: 'Studio / Bachelor',
        budget_min: 1300, budget_max: 1900,
        description: 'Petit appartement seul dans la ville', description_en: 'Small solo apartment in the city',
        quartiers: ['Mississauga','Brampton','Hamilton'],
        avantages: ['Intimité','Indépendance'],
        avantages_en: ['Privacy','Independence'],
        inconvenients: ['Cher proche du centre','Souvent non meublé'],
        inconvenients_en: ['Expensive near downtown','Often unfurnished'],
        conseil: 'Vise les banlieues bien desservies par le TTC ou GO Train', conseil_en: 'Target suburbs well-served by TTC or GO Train',
        lien: 'https://www.kijiji.ca/b-appartement-condo/toronto/k0l1700273',
      },
      {
        type: 'Résidence universitaire', type_en: 'University residence',
        budget_min: 1000, budget_max: 1600,
        description: 'Résidence on-campus ou off-campus affiliée', description_en: 'On-campus or affiliated off-campus residence',
        quartiers: ['Sur campus'],
        avantages: ['Sécurité','Proximité cours','Communauté'],
        avantages_en: ['Safe','Close to classes','Community'],
        inconvenients: ['Très limité','Cher'],
        inconvenients_en: ['Very limited','Expensive'],
        conseil: 'UofT offre des résidences dès la 1ère année — priorité aux nouveaux', conseil_en: 'UofT offers residences from 1st year — priority to new students',
        lien: 'https://studentlife.utoronto.ca/task/find-housing/',
      },
    ],
  },
  Ottawa: {
    label: 'Ottawa',
    options: [
      {
        type: 'Chambre en colocation', type_en: 'Shared room',
        budget_min: 600, budget_max: 950,
        description: 'Chambre dans un appartement ou maison partagée', description_en: 'Room in a shared apartment or house',
        quartiers: ['Vanier','Gloucester','Nepean'],
        avantages: ['Abordable','Francophone ou anglophone selon quartier'],
        avantages_en: ['Affordable','French or English depending on neighbourhood'],
        inconvenients: ["Moins d'intimité"],
        inconvenients_en: ['Less privacy'],
        conseil: 'Vanier est le quartier le plus abordable près du centre', conseil_en: 'Vanier is the most affordable neighbourhood close to downtown',
        lien: 'https://www.kijiji.ca/b-colocation/ottawa/k0l1600124',
      },
      {
        type: 'Studio / 1 chambre', type_en: 'Studio / 1 bedroom',
        budget_min: 950, budget_max: 1500,
        description: 'Appartement seul, ville bilingue', description_en: 'Solo apartment, bilingual city',
        quartiers: ['Centretown','Kanata','Barrhaven'],
        avantages: ['Ville bilingue','Qualité de vie élevée'],
        avantages_en: ['Bilingual city','High quality of life'],
        inconvenients: ['Plus cher près du parlement'],
        inconvenients_en: ['More expensive near Parliament Hill'],
        conseil: 'Kanata est idéal pour les étudiants en technologie', conseil_en: 'Kanata is ideal for tech students near Carleton/uOttawa',
        lien: 'https://www.kijiji.ca/b-appartement-condo/ottawa/k0l1600124',
      },
    ],
  },
  Vancouver: {
    label: 'Vancouver',
    options: [
      {
        type: 'Chambre en colocation', type_en: 'Shared room',
        budget_min: 900, budget_max: 1350,
        description: 'Chambre dans une maison ou appartement partagé', description_en: 'Room in a shared house or apartment',
        quartiers: ['Surrey','Burnaby','New Westminster'],
        avantages: ['Moins cher dans les banlieues','Accès SkyTrain'],
        avantages_en: ['Cheaper in suburbs','SkyTrain access'],
        inconvenients: ['Marché très tendu','Concurrence élevée'],
        inconvenients_en: ['Very competitive market','High demand'],
        conseil: 'Cherche via UBC ou SFU Housing Off-Campus en priorité', conseil_en: 'Start with UBC or SFU Off-Campus Housing boards',
        lien: 'https://www.kijiji.ca/b-colocation/vancouver/k0l1700287',
      },
      {
        type: 'Résidence universitaire', type_en: 'University residence',
        budget_min: 1100, budget_max: 1700,
        description: 'Résidence UBC ou SFU — recommandé', description_en: 'UBC or SFU residence — recommended',
        quartiers: ['UBC Point Grey','SFU Burnaby'],
        avantages: ['Tout inclus','Sécurité','Communauté campus'],
        avantages_en: ['All-inclusive','Safe','Campus community'],
        inconvenients: ['Places très limitées à UBC','Priorité aux 1ères années'],
        inconvenients_en: ['Very limited at UBC','Priority to 1st-year students'],
        conseil: 'UBC a l\'une des plus belles résidences universitaires du Canada', conseil_en: 'UBC has one of the most beautiful university residences in Canada',
        lien: 'https://vancouver.housing.ubc.ca',
      },
    ],
  },
  Calgary: {
    label: 'Calgary',
    options: [
      {
        type: 'Chambre en colocation', type_en: 'Shared room',
        budget_min: 550, budget_max: 900,
        description: 'Chambre partagée — marché plus abordable', description_en: 'Shared room — more affordable market',
        quartiers: ['Forest Lawn','Marlborough','Falconridge'],
        avantages: ['Pas de taxe provinciale','Marché moins tendu qu\'à Toronto'],
        avantages_en: ['No provincial tax','Less competitive than Toronto'],
        inconvenients: ['Hiver rigoureux','Moins de transports en commun'],
        inconvenients_en: ['Harsh winters','Less public transit'],
        conseil: 'Calgary est la ville canadienne avec le meilleur rapport coût/salaire', conseil_en: 'Calgary has the best cost/salary ratio among major Canadian cities',
        lien: 'https://www.kijiji.ca/b-colocation/calgary/k0l1700221',
      },
      {
        type: 'Studio / 1 chambre', type_en: 'Studio / 1 bedroom',
        budget_min: 900, budget_max: 1450,
        description: 'Appartement solo — prix raisonnables vs Toronto/Vancouver', description_en: 'Solo apartment — reasonable vs Toronto/Vancouver',
        quartiers: ['Beltline','Mission','Kensington'],
        avantages: ['Abordable','Pas de taxe provinciale','Nature proche'],
        avantages_en: ['Affordable','No provincial tax','Nature nearby'],
        inconvenients: ['Voiture souvent nécessaire en banlieue'],
        inconvenients_en: ['Car often needed in suburbs'],
        conseil: 'Beltline est le quartier le plus vivant et proche de l\'université', conseil_en: 'Beltline is the most vibrant neighbourhood near the university',
        lien: 'https://www.kijiji.ca/b-appartement-condo/calgary/k0l1700221',
      },
    ],
  },
}

const CHECKLIST_BAIL = [
  { fr: "Visite l'appartement en personne avant de payer quoi que ce soit",    en: 'Visit the apartment in person before paying anything' },
  { fr: 'Vérifie que le bail est en français au Québec (droit légal)',          en: 'In Quebec, ensure the lease is in French (legal right)' },
  { fr: "Ne paie jamais plus d'un mois de loyer à l'avance",                  en: 'Never pay more than one month of rent in advance' },
  { fr: "Prends des photos de l'état des lieux à l'entrée",                   en: 'Take photos of the apartment condition when you move in' },
  { fr: 'Vérifie si le chauffage est inclus dans le loyer (vital en hiver)',   en: 'Check if heating is included in rent (vital in winter)' },
  { fr: 'Demande si les électroménagers sont fournis (frigo, cuisinière)',      en: 'Ask if appliances are included (fridge, stove)' },
  { fr: 'Vérifie la proximité des transports en commun',                       en: 'Check proximity to public transit' },
]

const CATEGORIES = [
  { id: 'logement',   fr: 'Logement',            en: 'Housing',            icon: '🏠', color: '#F97316', query: null },
  { id: 'budget',     fr: 'Budget mensuel',      en: 'Monthly budget',     icon: '📊', color: '#34D399', query: null },
  { id: 'convertir',  fr: 'Convertisseur',       en: 'Converter',          icon: '💱', color: '#A78BFA', query: null },
  { id: 'halal',      fr: 'Épiceries halal',     en: 'Halal groceries',    icon: '🥩', color: '#52B788', query: (c) => `halal+grocery+${c}` },
  { id: 'hair',       fr: 'Coiffeurs afro',      en: 'Afro hairdressers',  icon: '💈', color: '#B5838D', query: (c) => `afro+hair+salon+${c}` },
  { id: 'exotic',     fr: 'Épiceries exotiques', en: 'Exotic stores',      icon: '🛒', color: '#FBBF24', query: (c) => `african+caribbean+grocery+${c}` },
  { id: 'prices',     fr: 'Prix comparés',       en: 'Price comparison',   icon: '💰', color: '#60A5FA', query: null },
]

const detectStudyCity = (universite) => {
  if (!universite) return null
  const u = universite.toLowerCase()
  if (u.includes('montréal') || u.includes('montreal') || u.includes('udem') || u.includes('concordia') || u.includes('polytechnique') || u.includes('uqam')) return 'Montréal'
  if (u.includes('toronto') || u.includes('ryerson') || u.includes('york') || u.includes('ocad')) return 'Toronto'
  if (u.includes('british columbia') || u.includes('ubc') || u.includes('sfu') || u.includes('simon fraser')) return 'Vancouver'
  if (u.includes('ottawa') || u.includes('carleton')) return 'Ottawa'
  if (u.includes('calgary') || u.includes('mount royal')) return 'Calgary'
  if (u.includes('laval') || u.includes('ulaval')) return 'Québec'
  return null
}

const safeLien = (url) => {
  if (url && url.startsWith('https://www.kijiji.ca'))
    return SAFE_LINKS.kijiji.url + url.slice('https://www.kijiji.ca'.length)
  return url
}

export default function DayToDay() {
  const { C, lang, theme, profile } = useApp()
  const [city,    setCity]   = useState('Montreal')
  const [active,  setActive] = useState('logement')

  const [studyCitySuggestion, setStudyCitySuggestion] = useState('')
  useEffect(() => {
    try {
      const progId = localStorage.getItem('novae_programme_choisi')
      if (!progId && !profile?.universite) return
      const studyCity = detectStudyCity(profile?.universite || '')
      const currentCity = (profile?.ville_accueil || '').split(',')[0].trim()
      if (studyCity && currentCity && !currentCity.toLowerCase().includes(studyCity.toLowerCase()))
        setStudyCitySuggestion(studyCity)
    } catch {}
  }, [profile])
  const cat    = CATEGORIES.find(c => c.id === active)
  const prices = PRICES[city] || PRICES.Montreal

  // ── État calculateur budget ───────────────────────────────────
  const [budgetVille,  setBudgetVille]  = useState('Montreal')
  const [modeLogement, setModeLogement] = useState('coloc') // 'studio' | 'coloc'
  const [budgetCustom, setBudgetCustom] = useState({})      // surcharges manuelles

  // ── État estimateur logement ─────────────────────────────────
  const [logVille,    setLogVille]    = useState('Montreal')
  const [logBudget,   setLogBudget]   = useState(900)
  const [bailChecks,  setBailChecks]  = useState([])

  const villeData = COUT_VILLES[budgetVille] || COUT_VILLES.Montreal
  const loyer     = modeLogement === 'studio' ? villeData.loyer_studio : villeData.loyer_coloc

  const getVal = (id) => {
    if (id === 'loyer') return budgetCustom.loyer !== undefined ? budgetCustom.loyer : loyer
    return budgetCustom[id] !== undefined ? budgetCustom[id] : villeData[id]
  }
  const setVal = (id, v) => setBudgetCustom(p => ({ ...p, [id]: Number(v) }))
  const total  = POSTES_BUDGET.reduce((s, p) => s + (getVal(p.id) || 0), 0)
  const hMois  = Math.ceil(total / villeData.smig_h / 4.33) // semaines par mois

  // ── État convertisseur ────────────────────────────────────────
  const [deviseCode, setDeviseCode] = useState('XOF')
  const [montant,    setMontant]    = useState('')
  const devise   = DEVISES.find(d => d.code === deviseCode) || DEVISES[0]
  const montantN = parseFloat(montant.replace(',', '.')) || 0
  const enCAD    = montantN > 0 ? (montantN / devise.taux) : 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 20px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
          🌆 {lang === 'fr' ? 'Vie quotidienne' : 'Daily Life'}
        </h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: studyCitySuggestion ? 16 : 28, lineHeight: 1.6 }}>
          {lang === 'fr' ? 'Trouve ce dont tu as besoin autour de toi.' : 'Find what you need around you.'}
        </p>

        {/* Suggestion ville d'études */}
        {studyCitySuggestion && (
          <div style={{ padding: '11px 16px', background: `${C.accent}08`, border: `1px solid ${C.accent}25`, borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <p style={{ fontSize: 13, color: C.muted, flex: 1, margin: 0 }}>
              {lang === 'fr'
                ? `Tu étudies à ${studyCitySuggestion} ? Découvre le coût de la vie là-bas →`
                : `Studying in ${studyCitySuggestion}? Discover the cost of living there →`}
            </p>
            <button onClick={() => { setBudgetVille(Object.keys(COUT_VILLES).find(k => COUT_VILLES[k].label === studyCitySuggestion) || 'Montreal'); setActive('budget') }}
              style={{ fontSize: 12, color: C.accent2, fontWeight: 600, background: 'transparent', border: `1px solid ${C.accent}30`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {lang === 'fr' ? 'Voir →' : 'View →'}
            </button>
          </div>
        )}

        {/* City selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, flexShrink: 0 }}>
            {lang === 'fr' ? 'Ville' : 'City'}
          </span>
          <input value={city} onChange={e => setCity(e.target.value)}
            placeholder="Montreal, Toronto..."
            style={{ maxWidth: 240, padding: '9px 13px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)} style={{
              padding: '9px 16px', borderRadius: 10, border: `1px solid`,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: active === c.id ? `${c.color}18` : 'transparent',
              borderColor: active === c.id ? `${c.color}50` : C.border,
              color: active === c.id ? c.color : C.muted,
            }}>
              {c.icon} {lang === 'fr' ? c.fr : c.en}
            </button>
          ))}
        </div>

        {/* Carte OpenStreetMap via Leaflet */}
        {active !== 'prices' && active !== 'budget' && active !== 'convertir' && active !== 'logement' && cat?.query && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            <MapView city={city} query={cat.query(city)} />
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: C.muted }}>
                {lang === 'fr' ? cat.fr : cat.en} · {city} · {lang === 'fr' ? 'via OpenStreetMap' : 'via OpenStreetMap'}
              </p>
            </div>
          </div>
        )}

        {/* Price comparison — BÊTA */}
        {active === 'prices' && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: theme === 'dark' ? '#1a2a1e' : '#f9fafb',
            borderRadius: '16px',
            border: '2px dashed #2D6A4F40',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
            <div style={{
              display: 'inline-block',
              background: '#F4A261',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>
              {lang === 'fr' ? 'BÊTA — EN COURS DE VALIDATION' : 'BETA — UNDER VALIDATION'}
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: C.text,
              marginBottom: '12px',
            }}>
              {lang === 'fr' ? 'Comparatif de prix — Bientôt disponible' : 'Price Comparison — Coming Soon'}
            </h3>
            <p style={{
              color: C.muted,
              fontSize: '0.9rem',
              maxWidth: '400px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
            }}>
              {lang === 'fr'
                ? 'Nous travaillons à valider les prix avec des sources fiables. Cette section sera disponible prochainement avec des données vérifiées.'
                : 'We are working to validate prices with reliable sources. This section will be available soon with verified data.'}
            </p>
            <p style={{ color: '#2D6A4F', fontSize: '0.85rem', fontWeight: 600 }}>
              {lang === 'fr'
                ? '💡 Tu connais les prix dans ta ville ? Partage-les avec nous →'
                : '💡 Do you know prices in your city? Share them with us →'}
            </p>
          </div>
        )}

        {/* ══ CALCULATEUR BUDGET MENSUEL ══ */}
        {active === 'budget' && (
          <div>
            {/* Sélecteur ville */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {Object.entries(COUT_VILLES).map(([k, v]) => (
                <button key={k} onClick={() => { setBudgetVille(k); setBudgetCustom({}) }}
                  style={{ padding: '7px 16px', borderRadius: 10, border: `1px solid ${budgetVille === k ? C.accent + '50' : C.border}`, background: budgetVille === k ? `${C.accent}15` : 'transparent', color: budgetVille === k ? C.accent2 : C.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Mode logement */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              {[
                { id: 'coloc',  fr: '🛏 Colocation (chambre)',  en: '🛏 Shared (room)'  },
                { id: 'studio', fr: '🏠 Studio seul',           en: '🏠 Studio alone'   },
              ].map(m => (
                <button key={m.id} onClick={() => { setModeLogement(m.id); setBudgetCustom(p => ({ ...p, loyer: undefined })) }}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${modeLogement === m.id ? C.accent + '50' : C.border}`, background: modeLogement === m.id ? `${C.accent}15` : 'transparent', color: modeLogement === m.id ? C.accent2 : C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {lang === 'fr' ? m.fr : m.en}
                </button>
              ))}
            </div>

            {/* Lignes budget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {POSTES_BUDGET.map(p => {
                const val = getVal(p.id)
                const pct = total > 0 ? Math.round((val / total) * 100) : 0
                return (
                  <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{lang === 'fr' ? p.fr : p.en}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number" min="0" step="10"
                          value={val}
                          onChange={e => setVal(p.id, e.target.value)}
                          style={{ width: 80, padding: '5px 8px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 13, textAlign: 'right', outline: 'none' }}
                        />
                        <span style={{ fontSize: 12, color: C.muted }}>$</span>
                        <span style={{ fontSize: 11, color: p.color, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    {/* Barre de progression */}
                    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div style={{ padding: '18px 22px', background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{lang === 'fr' ? 'Total mensuel estimé' : 'Estimated monthly total'}</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: C.accent2, letterSpacing: -1 }}>{total.toFixed(0)} <span style={{ fontSize: 16, fontWeight: 500 }}>$ CAD</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                    {lang === 'fr' ? `Salaire min. ${villeData.smig_h.toFixed(2)} $/h` : `Min. wage ${villeData.smig_h.toFixed(2)} $/h`}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.warning }}>
                    ~{hMois}h <span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>{lang === 'fr' ? '/ mois pour couvrir' : '/ month to cover'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Note ville */}
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.6 }}>
              📌 {villeData.note}
            </p>
            <p style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>
              {lang === 'fr' ? '* Modifie chaque ligne pour personnaliser ton budget.' : '* Edit each line to customize your budget.'}
            </p>
          </div>
        )}

        {/* ══ ESTIMATEUR LOGEMENT ══ */}
        {active === 'logement' && (() => {
          const villeData   = LOGEMENT_DATA[logVille] || LOGEMENT_DATA.Montreal
          const optionsDispo = villeData.options.filter(
            o => logBudget >= o.budget_min && logBudget <= o.budget_max + 200
          )
          const toggleCheck = (i) => setBailChecks(p =>
            p.includes(i) ? p.filter(x => x !== i) : [...p, i]
          )
          return (
            <div>
              {/* Sélecteur ville */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {Object.entries(LOGEMENT_DATA).map(([k,v]) => (
                  <button key={k} onClick={()=>{ setLogVille(k); setLogBudget(900) }}
                    style={{ padding:'7px 16px', borderRadius:10, border:`1px solid ${logVille===k?'#F97316'+'50':C.border}`, background:logVille===k?'rgba(249,115,22,0.12)':'transparent', color:logVille===k?'#F97316':C.muted, fontSize:13, fontWeight:500, cursor:'pointer' }}>
                    {v.label}
                  </button>
                ))}
              </div>

              {/* SECTION 1 — Slider budget */}
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px', marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>
                  {lang==='fr'?'Mon budget logement / mois':'My housing budget / month'}
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12, flexWrap:'wrap' }}>
                  <input type="range" min={400} max={2500} step={50} value={logBudget}
                    onChange={e=>setLogBudget(Number(e.target.value))}
                    style={{ flex:1, minWidth:160, accentColor:'#F97316' }} />
                  <div style={{ padding:'8px 16px', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.30)', borderRadius:10, minWidth:110, textAlign:'center' }}>
                    <p style={{ fontSize:22, fontWeight:800, color:'#F97316', lineHeight:1 }}>{logBudget} $</p>
                    <p style={{ fontSize:10, color:C.muted, marginTop:2 }}>CAD / {lang==='fr'?'mois':'month'}</p>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:11, color:C.muted }}>400 $</span>
                  <span style={{ fontSize:11, color:C.muted }}>2 500 $</span>
                </div>
              </div>

              {/* SECTION 2 — Options selon budget */}
              <p style={{ fontSize:13, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, marginBottom:12 }}>
                {lang==='fr'
                  ? `Options disponibles à ${villeData.label} pour ${logBudget} $/mois`
                  : `Options in ${villeData.label} for $${logBudget}/month`}
              </p>

              {optionsDispo.length === 0 ? (
                <div style={{ padding:'24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, textAlign:'center', marginBottom:20 }}>
                  <p style={{ fontSize:36, marginBottom:10 }}>💸</p>
                  <p style={{ fontSize:14, color:C.text, fontWeight:600, marginBottom:6 }}>
                    {lang==='fr'?'Budget insuffisant pour cette ville':'Budget too low for this city'}
                  </p>
                  <p style={{ fontSize:13, color:C.muted }}>
                    {lang==='fr'
                      ? `Augmente ton budget ou choisis une autre ville.`
                      : `Increase your budget or choose another city.`}
                  </p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
                  {optionsDispo.map((opt, i) => (
                    <div key={i} style={{ background:C.surface, border:`1px solid ${'rgba(249,115,22,0.25)'}`, borderRadius:14, overflow:'hidden' }}>
                      {/* Header */}
                      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(249,115,22,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                          {i===0?'🛏️':i===1?'🏠':'🏛️'}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:2 }}>
                            {lang==='fr'?opt.type:opt.type_en}
                          </p>
                          <p style={{ fontSize:12, color:C.muted }}>{lang==='fr'?opt.description:opt.description_en}</p>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ fontSize:16, fontWeight:800, color:'#F97316' }}>{opt.budget_min}–{opt.budget_max} $</p>
                          <p style={{ fontSize:10, color:C.muted }}>{lang==='fr'?'/ mois':'/ month'}</p>
                        </div>
                      </div>
                      <div style={{ padding:'14px 18px' }}>
                        {/* Quartiers */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                          <span style={{ fontSize:11, color:C.muted, marginRight:4 }}>📍</span>
                          {opt.quartiers.map(q => (
                            <span key={q} style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'rgba(249,115,22,0.08)', color:'#F97316', border:'1px solid rgba(249,115,22,0.20)', fontWeight:500 }}>{q}</span>
                          ))}
                        </div>
                        {/* Avantages / Inconvénients */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                          <div>
                            {(lang==='fr'?opt.avantages:opt.avantages_en).map((a,j) => (
                              <p key={j} style={{ fontSize:12, color:C.success, marginBottom:3 }}>✅ {a}</p>
                            ))}
                          </div>
                          <div>
                            {(lang==='fr'?opt.inconvenients:opt.inconvenients_en).map((a,j) => (
                              <p key={j} style={{ fontSize:12, color:C.warning, marginBottom:3 }}>⚠️ {a}</p>
                            ))}
                          </div>
                        </div>
                        {/* Conseil clé */}
                        <div style={{ padding:'9px 12px', background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.18)', borderRadius:8, marginBottom:12 }}>
                          <p style={{ fontSize:12, color:'#F97316', fontWeight:600 }}>
                            💡 {lang==='fr'?opt.conseil:opt.conseil_en}
                          </p>
                        </div>
                        {/* CTA */}
                        <a href={safeLien(opt.lien)} target="_blank" rel="noreferrer"
                          style={{ display:'inline-block', padding:'8px 18px', background:'#F97316', border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>
                          {lang==='fr'?'Chercher →':'Search →'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 3 — Checklist bail */}
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px' }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>
                  📋 {lang==='fr'?'Avant de signer un bail au Canada :':'Before signing a lease in Canada:'}
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {CHECKLIST_BAIL.map((item,i) => {
                    const checked = bailChecks.includes(i)
                    return (
                      <button key={i} onClick={()=>toggleCheck(i)}
                        style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 12px', background:checked?`${C.success}08`:'transparent', border:`1px solid ${checked?C.success+'30':C.border}`, borderRadius:10, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                        <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${checked?C.success:C.border}`, background:checked?C.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          {checked && <span style={{ color:C.bg, fontSize:11, fontWeight:800 }}>✓</span>}
                        </div>
                        <p style={{ fontSize:13, color:checked?C.text:C.muted, lineHeight:1.5, textDecoration:checked?'line-through':undefined }}>
                          {lang==='fr'?item.fr:item.en}
                        </p>
                      </button>
                    )
                  })}
                </div>
                {bailChecks.length === CHECKLIST_BAIL.length && (
                  <div style={{ marginTop:14, padding:'10px 14px', background:`${C.success}10`, border:`1px solid ${C.success}30`, borderRadius:10, textAlign:'center' }}>
                    <p style={{ fontSize:13, color:C.success, fontWeight:600 }}>
                      ✅ {lang==='fr'?'Tu es prêt(e) à signer en toute sécurité !':'You\'re ready to sign safely!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ══ CONVERTISSEUR AFRICA → CANADA ══ */}
        {active === 'convertir' && (
          <div>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
              {lang === 'fr'
                ? 'Convertis ta monnaie locale en dollars canadiens pour mieux planifier ton budget.'
                : 'Convert your local currency to Canadian dollars to better plan your budget.'}
            </p>

            {/* Sélecteur devise */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
                {lang === 'fr' ? 'Ta devise' : 'Your currency'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEVISES.map(d => (
                  <button key={d.code} onClick={() => { setDeviseCode(d.code); setMontant(String(d.ex)) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 11, border: `1px solid ${deviseCode === d.code ? C.accent + '50' : C.border}`, background: deviseCode === d.code ? `${C.accent}12` : C.surface, cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 20 }}>{d.drapeau}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.code} — {d.nom}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{d.pays}</p>
                    </div>
                    <span style={{ fontSize: 12, color: C.muted }}>1 CAD = {d.taux} {d.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de conversion */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                    {devise.drapeau} Montant en {devise.code}
                  </p>
                  <input
                    type="number" min="0" value={montant}
                    onChange={e => setMontant(e.target.value)}
                    placeholder="ex. 200000"
                    style={{ width: '100%', padding: '12px 14px', background: C.bg2, border: `1px solid ${C.accent}40`, borderRadius: 10, color: C.text, fontSize: 18, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ padding: '0 4px 12px', color: C.muted, fontSize: 22 }}>→</div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                    🍁 Équivalent CAD
                  </p>
                  <div style={{ padding: '12px 14px', background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 10 }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: C.accent2 }}>
                      {enCAD > 0 ? enCAD.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                      {enCAD > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}> $</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Taux affiché */}
              <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginBottom: 18 }}>
                1 CAD = {devise.taux} {devise.code} · 1 {devise.code} = {(1 / devise.taux).toFixed(4)} CAD
              </p>

              {/* Exemples contextuels */}
              {enCAD > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
                    {lang === 'fr' ? 'Avec ce montant tu peux payer...' : 'With this amount you can cover...'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {EXEMPLES_CAD.map((ex, i) => {
                      const nb = enCAD / ex.cad
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: C.bg2, borderRadius: 9 }}>
                          <span style={{ fontSize: 13, color: C.text }}>{ex.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: nb >= 1 ? C.success : C.error }}>
                            {nb >= 1
                              ? `${nb.toFixed(nb < 10 ? 1 : 0)}× ✓`
                              : `${(nb * 100).toFixed(0)}% ✗`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Raccourcis montants */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                {lang === 'fr' ? 'Montants rapides' : 'Quick amounts'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[devise.ex / 4, devise.ex / 2, devise.ex, devise.ex * 2, devise.ex * 5].map((v, i) => (
                  <button key={i} onClick={() => setMontant(String(Math.round(v)))}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${C.border}`, background: Number(montant) === Math.round(v) ? `${C.accent}15` : 'transparent', color: Number(montant) === Math.round(v) ? C.accent2 : C.muted, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    {Math.round(v).toLocaleString()} {devise.code}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 11, color: C.muted, marginTop: 18, fontStyle: 'italic', lineHeight: 1.6 }}>
              ⚠ {lang === 'fr'
                ? 'Taux indicatifs basés sur les moyennes 2025. Vérifie le taux réel sur XE.com avant tout transfert.'
                : 'Indicative rates based on 2025 averages. Check the actual rate on XE.com before any transfer.'}
            </p>
          </div>
        )}

        <FeedbackSection page="day-to-day" />
      </main>
    </div>
  )
}
