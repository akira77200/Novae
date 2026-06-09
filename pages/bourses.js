// pages/bourses.js — NOVAE v5 — Bourses d'études + Recherche universités
import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ─────────────────────────────────────────────────────────────────
// DONNÉES BOURSES
// ─────────────────────────────────────────────────────────────────
const BOURSES = [
  // ── Gouvernement canadien ──
  {
    id: 1,
    nom: 'Bourses d\'études supérieures du Canada Vanier',
    nom_en: 'Vanier Canada Graduate Scholarships',
    organisme: 'Gouvernement du Canada',
    type: 'gouvernement',
    montant: 50000, montant_devise: 'CAD', duree: '3 ans',
    niveau: ['doctorat'],
    domaines: ['Sciences', 'Santé', 'Sciences humaines'],
    pays_origine: null,
    description: 'Pour les étudiants au doctorat d\'exception. Critères : leadership, excellence académique, potentiel de recherche.',
    description_en: 'For exceptional doctoral students. Criteria: leadership, academic excellence, research potential.',
    lien: 'https://vanier.gc.ca',
    deadline: 'Novembre (variable)',
    icone: '🍁',
    new: false,
  },
  {
    id: 2,
    nom: 'Programme de bourses de la Francophonie (OIF)',
    nom_en: 'OIF Francophonie Scholarship Program',
    organisme: 'Organisation Internationale de la Francophonie',
    type: 'international',
    montant: null, montant_devise: 'CAD', duree: '1–3 ans',
    niveau: ['master', 'doctorat'],
    domaines: ['Tous domaines'],
    pays_origine: ['Sénégal', 'Côte d\'Ivoire', 'Mali', 'Cameroun', 'Congo', 'Maroc', 'Tunisie', 'Algérie', 'Madagascar', 'Haiti'],
    description: 'Bourses de mobilité pour étudiants francophones du Sud. Couvre frais de scolarité, billet, allocation mensuelle.',
    description_en: 'Mobility scholarships for Southern Francophone students. Covers tuition, airfare, monthly allowance.',
    lien: 'https://www.francophonie.org/bourses',
    deadline: 'Février–Mars',
    icone: '🌍',
    new: false,
  },
  {
    id: 3,
    nom: 'Bourses CRSH — Maîtrise et doctorat',
    nom_en: 'SSHRC Master\'s & Doctoral Fellowships',
    organisme: 'CRSH / SSHRC',
    type: 'gouvernement',
    montant: 17500, montant_devise: 'CAD', duree: '1–4 ans',
    niveau: ['master', 'doctorat'],
    domaines: ['Sciences humaines', 'Sciences sociales'],
    pays_origine: null,
    description: 'Conseil de recherches en sciences humaines du Canada. 17 500 $/an pour la maîtrise, 21 000 $/an pour le doctorat.',
    description_en: 'Social Sciences and Humanities Research Council. $17,500/yr for master\'s, $21,000/yr for doctoral.',
    lien: 'https://www.sshrc-crsh.gc.ca/funding-financement/programs-programmes/fellowships',
    deadline: 'Décembre',
    icone: '📚',
    new: false,
  },
  {
    id: 4,
    nom: 'Bourses CRSNG — Sciences naturelles',
    nom_en: 'NSERC Graduate Scholarships',
    organisme: 'CRSNG / NSERC',
    type: 'gouvernement',
    montant: 17300, montant_devise: 'CAD', duree: '1–3 ans',
    niveau: ['master', 'doctorat'],
    domaines: ['Sciences', 'Génie', 'Mathématiques', 'Informatique'],
    pays_origine: null,
    description: 'Pour les sciences naturelles et génie. BESC-M : 17 300 $/an. BESC-D : 21 000 $/an.',
    description_en: 'For natural sciences and engineering. CGSD-M: $17,300/yr. CGSD-D: $21,000/yr.',
    lien: 'https://www.nserc-crsng.gc.ca',
    deadline: 'Décembre',
    icone: '🔬',
    new: false,
  },
  // ── Universités ──
  {
    id: 5,
    nom: 'Bourse d\'excellence de l\'Université de Montréal',
    nom_en: 'Université de Montréal Excellence Award',
    organisme: 'Université de Montréal',
    type: 'universite',
    montant: 3000, montant_devise: 'CAD', duree: 'Par session',
    niveau: ['licence', 'master'],
    domaines: ['Tous domaines'],
    pays_origine: null,
    description: 'Pour étudiants étrangers avec moyenne ≥ 3.7/4.3. Réduction automatique des frais supplémentaires.',
    description_en: 'For international students with GPA ≥ 3.7/4.3. Automatic reduction of additional fees.',
    lien: 'https://www.umontreal.ca/etudes/financer-ses-etudes/bourses',
    deadline: 'À l\'admission',
    icone: '🎓',
    new: false,
  },
  {
    id: 6,
    nom: 'Bourse de recrutement international — McGill',
    nom_en: 'McGill International Recruitment Award',
    organisme: 'Université McGill',
    type: 'universite',
    montant: 5000, montant_devise: 'CAD', duree: '1 an (renouvelable)',
    niveau: ['licence'],
    domaines: ['Tous domaines'],
    pays_origine: null,
    description: 'Pour étudiants internationaux admis en 1re année de baccalauréat. Renouvelable si GPA maintenu.',
    description_en: 'For international students admitted to 1st year bachelor\'s. Renewable if GPA maintained.',
    lien: 'https://www.mcgill.ca/studentaid/scholarships-bursaries',
    deadline: 'Automatique à l\'admission',
    icone: '🏛️',
    new: false,
  },
  {
    id: 7,
    nom: 'Bourse Lester B. Pearson — Université de Toronto',
    nom_en: 'Lester B. Pearson International Scholarship',
    organisme: 'Université de Toronto',
    type: 'universite',
    montant: 80000, montant_devise: 'CAD', duree: '4 ans (tout inclus)',
    niveau: ['licence'],
    domaines: ['Tous domaines'],
    pays_origine: null,
    description: 'Couvre TOUT : frais de scolarité, logement, livres et frais accessoires pendant 4 ans. Extrêmement compétitive.',
    description_en: 'Covers EVERYTHING: tuition, accommodation, books and incidentals for 4 years. Extremely competitive.',
    lien: 'https://future.utoronto.ca/pearson',
    deadline: 'Novembre',
    icone: '⭐',
    new: false,
  },
  {
    id: 8,
    nom: 'Bourse d\'excellence internationale — UQAM',
    nom_en: 'UQAM International Excellence Scholarship',
    organisme: 'Université du Québec à Montréal',
    type: 'universite',
    montant: 2500, montant_devise: 'CAD', duree: 'Par année',
    niveau: ['licence', 'master'],
    domaines: ['Tous domaines'],
    pays_origine: null,
    description: 'Exemption partielle des frais majorés pour étudiants étrangers. Critères : excellence + implication.',
    description_en: 'Partial exemption from additional international fees. Criteria: excellence + involvement.',
    lien: 'https://etudier.uqam.ca/bourses',
    deadline: 'Avril',
    icone: '🎓',
    new: false,
  },
  // ── Gouvernements africains / partenariats ──
  {
    id: 9,
    nom: 'Programme de bourses du gouvernement marocain',
    nom_en: 'Moroccan Government Scholarship Program',
    organisme: 'Agence Marocaine de Coopération Internationale',
    type: 'pays_origine',
    montant: null, montant_devise: 'CAD', duree: 'Variable',
    niveau: ['master', 'doctorat'],
    domaines: ['Ingénierie', 'Sciences', 'Gestion'],
    pays_origine: ['Maroc'],
    description: 'Bourses pour Marocains souhaitant se spécialiser à l\'étranger. Couvre frais et allocation.',
    description_en: 'Scholarships for Moroccans pursuing specialization abroad. Covers fees and allowance.',
    lien: 'https://www.amci.ma',
    deadline: 'Variable selon pays',
    icone: '🇲🇦',
    new: false,
  },
  {
    id: 10,
    nom: 'Bourse d\'excellence MESRI — Algérie',
    nom_en: 'MESRI Excellence Scholarship — Algeria',
    organisme: 'Ministère de l\'Enseignement Supérieur Algérien',
    type: 'pays_origine',
    montant: null, montant_devise: 'CAD', duree: '2–3 ans',
    niveau: ['master', 'doctorat'],
    domaines: ['Sciences', 'Technologie', 'Recherche'],
    pays_origine: ['Algérie'],
    description: 'Programme national d\'excellence pour les meilleurs diplômés algériens. Formation à l\'étranger prise en charge.',
    description_en: 'National excellence program for top Algerian graduates. Full study abroad funding.',
    lien: 'https://www.mesrs.dz',
    deadline: 'Mars–Avril',
    icone: '🇩🇿',
    new: false,
  },
  {
    id: 11,
    nom: 'Bourse AFD / Campus France — Sénégal',
    nom_en: 'AFD / Campus France — Senegal Scholarship',
    organisme: 'Agence Française de Développement',
    type: 'international',
    montant: null, montant_devise: 'CAD', duree: '1–2 ans',
    niveau: ['master'],
    domaines: ['Développement durable', 'Finance', 'Santé publique'],
    pays_origine: ['Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Guinée'],
    description: 'Via Campus France. Orientation Afrique de l\'Ouest. Ouvert aux études au Canada dans certains cas.',
    description_en: 'Via Campus France. West Africa focus. Open to studies in Canada in certain cases.',
    lien: 'https://www.campusfrance.org/bourses',
    deadline: 'Novembre–Janvier',
    icone: '🌱',
    new: false,
  },
  {
    id: 12,
    nom: 'Bourse de la Fondation Mastercard',
    nom_en: 'Mastercard Foundation Scholarship',
    organisme: 'Fondation Mastercard',
    type: 'fondation',
    montant: null, montant_devise: 'CAD', duree: '4 ans',
    niveau: ['licence', 'master'],
    domaines: ['Tous domaines'],
    pays_origine: ['Sénégal', 'Ghana', 'Ouganda', 'Rwanda', 'Éthiopie', 'Kenya', 'Nigeria', 'Tanzanie'],
    description: 'Pour étudiants africains talentueux ayant un besoin financier. Couvre tout + mentorat + retour au pays.',
    description_en: 'For talented African students with financial need. Covers everything + mentoring + return home.',
    lien: 'https://mastercardfdn.org/scholars',
    deadline: 'Novembre–Décembre',
    icone: '🃏',
    new: true,
  },
]

// ─────────────────────────────────────────────────────────────────
// DONNÉES UNIVERSITÉS
// ─────────────────────────────────────────────────────────────────
const UNIVERSITES = [
  // QC
  { id: 1,  nom: 'Université de Montréal',     sigle: 'UdeM', ville: 'Montréal', province: 'QC', langue: 'fr', rang_qs: 141, type: 'public', frais_intl: 22000, programmes: ['Médecine','Droit','Informatique','Gestion','Sciences','Architecture'], lien: 'https://www.umontreal.ca', logo: '🔵' },
  { id: 2,  nom: 'Université McGill',           sigle: 'McGill', ville: 'Montréal', province: 'QC', langue: 'en', rang_qs: 46,  type: 'public', frais_intl: 25000, programmes: ['Médecine','Droit','Ingénierie','Gestion','Sciences','Architecture'], lien: 'https://www.mcgill.ca', logo: '🔴' },
  { id: 3,  nom: 'Université Concordia',        sigle: 'Concordia', ville: 'Montréal', province: 'QC', langue: 'en', rang_qs: 521, type: 'public', frais_intl: 20000, programmes: ['Commerce','Arts','Informatique','Design','Ingénierie','Communication'], lien: 'https://www.concordia.ca', logo: '🟡' },
  { id: 4,  nom: 'Université du Québec à Montréal', sigle: 'UQAM', ville: 'Montréal', province: 'QC', langue: 'fr', rang_qs: null, type: 'public', frais_intl: 16000, programmes: ['Communication','Sciences sociales','Arts','Gestion','Environnement'], lien: 'https://www.uqam.ca', logo: '🟢' },
  { id: 5,  nom: 'Université Laval',             sigle: 'Laval', ville: 'Québec', province: 'QC', langue: 'fr', rang_qs: 412, type: 'public', frais_intl: 17000, programmes: ['Médecine','Droit','Ingénierie','Sciences','Agriculture'], lien: 'https://www.ulaval.ca', logo: '🔵' },
  { id: 6,  nom: 'Université de Sherbrooke',     sigle: 'UdeS', ville: 'Sherbrooke', province: 'QC', langue: 'fr', rang_qs: null, type: 'public', frais_intl: 16500, programmes: ['Médecine','Ingénierie','Droit','Gestion','Éducation'], lien: 'https://www.usherbrooke.ca', logo: '🟣' },
  // ON
  { id: 7,  nom: 'Université de Toronto',        sigle: 'UofT', ville: 'Toronto', province: 'ON', langue: 'en', rang_qs: 21,  type: 'public', frais_intl: 55000, programmes: ['Médecine','Droit','Ingénierie','Commerce','Sciences','Arts'], lien: 'https://www.utoronto.ca', logo: '🔵' },
  { id: 8,  nom: 'Université McMaster',          sigle: 'McMaster', ville: 'Hamilton', province: 'ON', langue: 'en', rang_qs: 189, type: 'public', frais_intl: 35000, programmes: ['Médecine','Ingénierie','Commerce','Sciences','Arts'], lien: 'https://www.mcmaster.ca', logo: '🟠' },
  { id: 9,  nom: 'Université d\'Ottawa',         sigle: 'uOttawa', ville: 'Ottawa', province: 'ON', langue: 'bi', rang_qs: 291, type: 'public', frais_intl: 30000, programmes: ['Droit','Médecine','Sciences sociales','Génie','Gestion'], lien: 'https://www.uottawa.ca', logo: '🔴' },
  { id: 10, nom: 'Université Queen\'s',          sigle: 'Queen\'s', ville: 'Kingston', province: 'ON', langue: 'en', rang_qs: 209, type: 'public', frais_intl: 45000, programmes: ['Commerce','Ingénierie','Médecine','Droit','Arts'], lien: 'https://www.queensu.ca', logo: '🔵' },
  { id: 11, nom: 'Université de Waterloo',       sigle: 'Waterloo', ville: 'Waterloo', province: 'ON', langue: 'en', rang_qs: 154, type: 'public', frais_intl: 40000, programmes: ['Informatique','Ingénierie','Mathématiques','Commerce','Arts'], lien: 'https://uwaterloo.ca', logo: '🟡' },
  // BC
  { id: 12, nom: 'Université de la Colombie-Britannique', sigle: 'UBC', ville: 'Vancouver', province: 'BC', langue: 'en', rang_qs: 34,  type: 'public', frais_intl: 40000, programmes: ['Médecine','Droit','Ingénierie','Commerce','Sciences','Arts'], lien: 'https://www.ubc.ca', logo: '🔵' },
  { id: 13, nom: 'Université Simon Fraser',      sigle: 'SFU', ville: 'Burnaby', province: 'BC', langue: 'en', rang_qs: 321, type: 'public', frais_intl: 26000, programmes: ['Sciences','Informatique','Commerce','Arts','Communication'], lien: 'https://www.sfu.ca', logo: '🔴' },
  // AB
  { id: 14, nom: 'Université de l\'Alberta',     sigle: 'UAlberta', ville: 'Edmonton', province: 'AB', langue: 'en', rang_qs: 111, type: 'public', frais_intl: 28000, programmes: ['Ingénierie','Médecine','Agriculture','Droit','Sciences'], lien: 'https://www.ualberta.ca', logo: '🟢' },
  { id: 15, nom: 'Université de Calgary',        sigle: 'UCalgary', ville: 'Calgary', province: 'AB', langue: 'en', rang_qs: 182, type: 'public', frais_intl: 25000, programmes: ['Ingénierie','Médecine','Droit','Commerce','Sciences'], lien: 'https://www.ucalgary.ca', logo: '🔴' },
]

const ALL_DOMAINES_BOURSES = ['Tous', ...new Set(BOURSES.flatMap(b => b.domaines))]
const ALL_NIVEAUX_BOURSES  = ['Tous', 'licence', 'master', 'doctorat']
const ALL_TYPES_BOURSES    = [
  { id: 'Tous',         fr: 'Toutes',            en: 'All'           },
  { id: 'gouvernement', fr: 'Gouvernement CA',   en: 'Government CA' },
  { id: 'universite',   fr: 'Universités',       en: 'Universities'  },
  { id: 'international',fr: 'International',     en: 'International' },
  { id: 'fondation',    fr: 'Fondations',        en: 'Foundations'   },
  { id: 'pays_origine', fr: 'Pays d\'origine',   en: 'Home country'  },
]

const ALL_PROVINCES      = ['Toutes', 'QC', 'ON', 'BC', 'AB']
const ALL_LANGUES_UNIV   = [{ id: 'Toutes', fr: 'Toutes', en: 'All' }, { id: 'fr', fr: 'Français', en: 'French' }, { id: 'en', fr: 'Anglais', en: 'English' }, { id: 'bi', fr: 'Bilingue', en: 'Bilingual' }]
const ALL_PROGRAMMES_UNIV = ['Tous', 'Informatique', 'Ingénierie', 'Médecine', 'Droit', 'Commerce', 'Sciences', 'Arts', 'Gestion', 'Communication']

const NIVEAU_LABEL = { licence: 'Licence / Baccalauréat', master: 'Master / Maîtrise', doctorat: 'Doctorat / PhD' }
const TYPE_COLOR   = {
  gouvernement: { color: '#52B788', bg: 'rgba(82,183,136,0.12)'   },
  universite:   { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'   },
  international:{ color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'   },
  fondation:    { color: '#F97316', bg: 'rgba(249,115,22,0.12)'   },
  pays_origine: { color: '#B5838D', bg: 'rgba(181,131,141,0.12)'  },
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function Bourses() {
  const { C, lang, profile } = useApp()
  const [onglet, setOnglet] = useState('bourses')

  // ── Filtres bourses ──────────────────────────────────────────
  const [recherche, setRecherche] = useState('')
  const [fType,     setFType]     = useState('Tous')
  const [fNiveau,   setFNiveau]   = useState('Tous')
  const [fDomaine,  setFDomaine]  = useState('Tous')
  const [expanded,  setExpanded]  = useState(null)

  // ── Filtres universités ───────────────────────────────────────
  const [rechercheU,  setRechercheU]  = useState('')
  const [fProvince,   setFProvince]   = useState('Toutes')
  const [fLangueU,    setFLangueU]    = useState('Toutes')
  const [fProgramme,  setFProgramme]  = useState('Tous')
  const [triU,        setTriU]        = useState('rang')  // 'rang' | 'frais_asc' | 'alpha'

  // Pré-filtre depuis profil (pays d'origine)
  const paysOrigineProfil = profile?.pays_origine

  const boursesFiltrees = useMemo(() => BOURSES.filter(b => {
    if (fType   !== 'Tous' && b.type !== fType)                           return false
    if (fNiveau !== 'Tous' && !b.niveau.includes(fNiveau))                return false
    if (fDomaine !== 'Tous' && !b.domaines.includes(fDomaine))            return false
    if (recherche) {
      const q = recherche.toLowerCase()
      if (!b.nom.toLowerCase().includes(q) && !b.organisme.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false
    }
    return true
  }), [fType, fNiveau, fDomaine, recherche])

  const univFiltrees = useMemo(() => {
    let list = UNIVERSITES.filter(u => {
      if (fProvince !== 'Toutes' && u.province !== fProvince)             return false
      if (fLangueU  !== 'Toutes' && u.langue   !== fLangueU)              return false
      if (fProgramme !== 'Tous'  && !u.programmes.includes(fProgramme))   return false
      if (rechercheU) {
        const q = rechercheU.toLowerCase()
        if (!u.nom.toLowerCase().includes(q) && !u.sigle.toLowerCase().includes(q) && !u.ville.toLowerCase().includes(q)) return false
      }
      return true
    })
    if (triU === 'rang')      list = [...list].sort((a, b) => (a.rang_qs || 9999) - (b.rang_qs || 9999))
    if (triU === 'frais_asc') list = [...list].sort((a, b) => a.frais_intl - b.frais_intl)
    if (triU === 'alpha')     list = [...list].sort((a, b) => a.nom.localeCompare(b.nom))
    return list
  }, [fProvince, fLangueU, fProgramme, rechercheU, triU])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
            🎓 {lang === 'fr' ? 'Bourses & Universités' : 'Scholarships & Universities'}
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>
            {lang === 'fr'
              ? `${BOURSES.length} bourses · ${UNIVERSITES.length} universités canadiennes`
              : `${BOURSES.length} scholarships · ${UNIVERSITES.length} Canadian universities`}
          </p>
        </div>

        {/* ── Onglets principaux ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {[
            { id: 'bourses',    fr: '🏆 Bourses d\'études', en: '🏆 Scholarships'   },
            { id: 'universites',fr: '🏛️ Universités',       en: '🏛️ Universities'   },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: onglet === o.id ? C.accent : 'transparent', color: onglet === o.id ? '#fff' : C.muted }}>
              {lang === 'fr' ? o.fr : o.en}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            ONGLET BOURSES
            ════════════════════════════════════════════════════════ */}
        {onglet === 'bourses' && (
          <>
            {/* Filtres */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
              <input value={recherche} onChange={e => setRecherche(e.target.value)}
                placeholder={lang === 'fr' ? '🔍  Rechercher une bourse...' : '🔍  Search scholarships...'}
                style={{ padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none' }} />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_TYPES_BOURSES.map(t => (
                  <button key={t.id} onClick={() => setFType(t.id)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${fType === t.id ? C.accent + '50' : C.border}`, background: fType === t.id ? `${C.accent}15` : 'transparent', color: fType === t.id ? C.accent2 : C.muted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    {lang === 'fr' ? t.fr : t.en}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_NIVEAUX_BOURSES.map(n => (
                  <button key={n} onClick={() => setFNiveau(n)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${fNiveau === n ? '#60A5FA50' : C.border}`, background: fNiveau === n ? 'rgba(96,165,250,0.12)' : 'transparent', color: fNiveau === n ? '#60A5FA' : C.muted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    {n === 'Tous' ? (lang === 'fr' ? 'Tous niveaux' : 'All levels') : NIVEAU_LABEL[n] || n}
                  </button>
                ))}
              </div>
            </div>

            {/* Compteur */}
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
              {boursesFiltrees.length} {lang === 'fr' ? 'bourse(s) trouvée(s)' : 'scholarship(s) found'}
            </p>

            {/* Liste bourses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {boursesFiltrees.map(b => {
                const tc      = TYPE_COLOR[b.type] || TYPE_COLOR.gouvernement
                const isOpen  = expanded === b.id
                const matchPO = paysOrigineProfil && b.pays_origine?.some(p => paysOrigineProfil.toLowerCase().includes(p.toLowerCase()))

                return (
                  <div key={b.id} style={{ background: C.surface, border: `1px solid ${matchPO ? C.accent + '40' : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                    {/* Header carte */}
                    <div style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : b.id)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{b.icone}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{lang === 'fr' ? b.nom : (b.nom_en || b.nom)}</p>
                            {b.new && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${C.error}15`, color: C.error, letterSpacing: 0.4, flexShrink: 0 }}>{lang === 'fr' ? 'NOUVEAU' : 'NEW'}</span>}
                            {matchPO && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${C.accent}15`, color: C.accent2, letterSpacing: 0.4, flexShrink: 0 }}>✓ {lang === 'fr' ? 'TON PAYS' : 'YOUR COUNTRY'}</span>}
                          </div>
                          <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{b.organisme}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 500 }}>
                              {ALL_TYPES_BOURSES.find(t => t.id === b.type)?.[lang === 'fr' ? 'fr' : 'en'] || b.type}
                            </span>
                            {b.niveau.map(n => (
                              <span key={n} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'rgba(96,165,250,0.10)', color: '#60A5FA', fontWeight: 500 }}>
                                {n}
                              </span>
                            ))}
                            {b.montant && (
                              <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'rgba(52,211,153,0.10)', color: C.success, fontWeight: 600 }}>
                                {b.montant.toLocaleString()} $ {b.montant_devise}/{b.duree}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ color: C.muted, fontSize: 14, flexShrink: 0, marginTop: 4 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Détail expandable */}
                    {isOpen && (
                      <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginTop: 14, marginBottom: 12 }}>
                          {lang === 'fr' ? b.description : (b.description_en || b.description)}
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{lang === 'fr' ? 'Deadline' : 'Deadline'}</p>
                            <p style={{ fontSize: 13, color: C.warning, fontWeight: 600 }}>📅 {b.deadline}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{lang === 'fr' ? 'Durée' : 'Duration'}</p>
                            <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>⏱ {b.duree}</p>
                          </div>
                          {b.domaines.length > 0 && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{lang === 'fr' ? 'Domaines' : 'Fields'}</p>
                              <p style={{ fontSize: 12, color: C.text }}>{b.domaines.join(', ')}</p>
                            </div>
                          )}
                          {b.pays_origine && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{lang === 'fr' ? 'Pays éligibles' : 'Eligible countries'}</p>
                              <p style={{ fontSize: 12, color: C.text }}>{b.pays_origine.join(', ')}</p>
                            </div>
                          )}
                        </div>
                        <a href={b.lien} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-block', padding: '9px 20px', background: C.accent, borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                          {lang === 'fr' ? 'Postuler →' : 'Apply →'}
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}

              {boursesFiltrees.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
                  <p style={{ fontSize: 15, color: C.text, fontWeight: 600, marginBottom: 8 }}>
                    {lang === 'fr' ? 'Aucune bourse trouvée' : 'No scholarships found'}
                  </p>
                  <button onClick={() => { setRecherche(''); setFType('Tous'); setFNiveau('Tous') }}
                    style={{ padding: '8px 18px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                    {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            ONGLET UNIVERSITÉS
            ════════════════════════════════════════════════════════ */}
        {onglet === 'universites' && (
          <>
            {/* Filtres */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
              <input value={rechercheU} onChange={e => setRechercheU(e.target.value)}
                placeholder={lang === 'fr' ? '🔍  Rechercher une université...' : '🔍  Search universities...'}
                style={{ padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none' }} />

              {/* Province */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_PROVINCES.map(p => (
                  <button key={p} onClick={() => setFProvince(p)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${fProvince === p ? C.accent + '50' : C.border}`, background: fProvince === p ? `${C.accent}15` : 'transparent', color: fProvince === p ? C.accent2 : C.muted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    {p === 'Toutes' ? (lang === 'fr' ? 'Toutes provinces' : 'All provinces') : p}
                  </button>
                ))}
              </div>

              {/* Langue + Programme + Tri */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={fLangueU} onChange={e => setFLangueU(e.target.value)}
                  style={{ padding: '7px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: 'none' }}>
                  {ALL_LANGUES_UNIV.map(l => <option key={l.id} value={l.id}>{lang === 'fr' ? l.fr : l.en}</option>)}
                </select>
                <select value={fProgramme} onChange={e => setFProgramme(e.target.value)}
                  style={{ padding: '7px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: 'none' }}>
                  {ALL_PROGRAMMES_UNIV.map(p => <option key={p} value={p}>{p === 'Tous' ? (lang === 'fr' ? 'Tous programmes' : 'All programs') : p}</option>)}
                </select>
                <select value={triU} onChange={e => setTriU(e.target.value)}
                  style={{ padding: '7px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: 'none' }}>
                  <option value="rang">{lang === 'fr' ? 'Trier : Rang QS' : 'Sort: QS Rank'}</option>
                  <option value="frais_asc">{lang === 'fr' ? 'Trier : Frais ↑' : 'Sort: Fees ↑'}</option>
                  <option value="alpha">{lang === 'fr' ? 'Trier : A → Z' : 'Sort: A → Z'}</option>
                </select>
              </div>
            </div>

            {/* Compteur */}
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
              {univFiltrees.length} {lang === 'fr' ? 'université(s) trouvée(s)' : 'university(ies) found'}
            </p>

            {/* Grille universités */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {univFiltrees.map(u => (
                <div key={u.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* En-tête */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${C.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{u.logo}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 3 }}>{u.nom}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>📍 {u.ville}, {u.province}</p>
                    </div>
                    {u.rang_qs && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>QS World</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: C.accent2 }}>#{u.rang_qs}</p>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: u.langue === 'fr' ? 'rgba(96,165,250,0.12)' : u.langue === 'bi' ? 'rgba(167,139,250,0.12)' : 'rgba(251,191,36,0.12)', color: u.langue === 'fr' ? '#60A5FA' : u.langue === 'bi' ? '#A78BFA' : '#FBBF24', fontWeight: 600 }}>
                      {u.langue === 'fr' ? '🇫🇷 Français' : u.langue === 'bi' ? '🔀 Bilingue' : '🇬🇧 English'}
                    </span>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(52,211,153,0.10)', color: C.success, fontWeight: 500 }}>
                      ~{u.frais_intl.toLocaleString()} $/an
                    </span>
                  </div>

                  {/* Programmes */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {u.programmes.slice(0, 5).map(p => (
                      <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}>{p}</span>
                    ))}
                    {u.programmes.length > 5 && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, color: C.muted }}>+{u.programmes.length - 5}</span>
                    )}
                  </div>

                  {/* CTA */}
                  <a href={u.lien} target="_blank" rel="noreferrer"
                    style={{ display: 'block', textAlign: 'center', padding: '9px', background: `${C.accent}12`, border: `1px solid ${C.accent}25`, borderRadius: 9, color: C.accent2, fontWeight: 600, fontSize: 13, textDecoration: 'none', marginTop: 'auto' }}>
                    {lang === 'fr' ? 'Visiter le site →' : 'Visit website →'}
                  </a>
                </div>
              ))}

              {univFiltrees.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>🏛️</p>
                  <p style={{ fontSize: 15, color: C.text, fontWeight: 600, marginBottom: 8 }}>
                    {lang === 'fr' ? 'Aucune université trouvée' : 'No universities found'}
                  </p>
                  <button onClick={() => { setRechercheU(''); setFProvince('Toutes'); setFLangueU('Toutes'); setFProgramme('Tous') }}
                    style={{ padding: '8px 18px', background: C.accent, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                    {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
