// pages/day-to-day.js
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', borderRadius: '12px', color: '#888', fontSize: 14 }}>
      Chargement de la carte...
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

const CATEGORIES = [
  { id: 'halal',      fr: 'Épiceries halal',    en: 'Halal groceries',    icon: '🥩', color: '#52B788', query: (c) => `halal+grocery+${c}` },
  { id: 'hair',       fr: 'Coiffeurs afro',      en: 'Afro hairdressers',  icon: '💈', color: '#B5838D', query: (c) => `afro+hair+salon+${c}` },
  { id: 'exotic',     fr: 'Épiceries exotiques', en: 'Exotic stores',      icon: '🛒', color: '#FBBF24', query: (c) => `african+caribbean+grocery+${c}` },
  { id: 'prices',     fr: 'Prix comparés',       en: 'Price comparison',   icon: '💰', color: '#60A5FA', query: null },
  { id: 'budget',     fr: 'Budget mensuel',      en: 'Monthly budget',     icon: '📊', color: '#34D399', query: null },
  { id: 'convertir',  fr: 'Convertisseur',       en: 'Converter',          icon: '💱', color: '#A78BFA', query: null },
]

export default function DayToDay() {
  const { C, lang } = useApp()
  const [city,    setCity]   = useState('Montreal')
  const [active,  setActive] = useState('halal')
  const cat    = CATEGORIES.find(c => c.id === active)
  const prices = PRICES[city] || PRICES.Montreal

  // ── État calculateur budget ───────────────────────────────────
  const [budgetVille,  setBudgetVille]  = useState('Montreal')
  const [modeLogement, setModeLogement] = useState('coloc') // 'studio' | 'coloc'
  const [budgetCustom, setBudgetCustom] = useState({})      // surcharges manuelles

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
      <Navbar />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 20px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
          🌆 {lang === 'fr' ? 'Vie quotidienne' : 'Daily Life'}
        </h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
          {lang === 'fr' ? 'Trouve ce dont tu as besoin autour de toi.' : 'Find what you need around you.'}
        </p>

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
        {active !== 'prices' && active !== 'budget' && active !== 'convertir' && cat?.query && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            <MapView city={city} query={cat.query(city)} />
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: C.muted }}>
                {lang === 'fr' ? cat.fr : cat.en} · {city} · {lang === 'fr' ? 'via OpenStreetMap' : 'via OpenStreetMap'}
              </p>
            </div>
          </div>
        )}

        {/* Price comparison */}
        {active === 'prices' && (
          <div>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>
              {lang === 'fr' ? `Comparaison des prix à ${city} (données indicatives)` : `Price comparison in ${city} (indicative data)`}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Produit','Maxi','Super C','IGA','Walmart'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, textAlign: i === 0 ? 'left' : 'center', color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prices.map((row, i) => {
                    const vals = [row.maxi, row.superc, row.iga, row.walmart].filter(Boolean)
                    const min  = Math.min(...vals)
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? C.surface : 'transparent' }}>
                        <td style={{ padding: '10px 14px', border: `1px solid ${C.border}`, fontWeight: 500, color: C.text }}>{row.produit}</td>
                        {[row.maxi, row.superc, row.iga, row.walmart].map((p, j) => (
                          <td key={j} style={{ padding: '10px 14px', border: `1px solid ${C.border}`, textAlign: 'center', fontWeight: p === min && p ? 700 : 400, color: p === min && p ? C.success : p ? C.text : C.muted }}>
                            {p ? `${p.toFixed(2)} $` : '—'}
                            {p === min && p && <span style={{ fontSize: 10, marginLeft: 3 }}>✓</span>}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 10, fontStyle: 'italic' }}>
              {lang === 'fr' ? '✓ = Prix le plus bas pour ce produit.' : '✓ = Lowest price for this item.'}
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
      </main>
    </div>
  )
}
