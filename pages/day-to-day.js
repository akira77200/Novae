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

const CATEGORIES = [
  { id: 'halal',   fr: 'Épiceries halal',    en: 'Halal groceries',    icon: '🥩', color: '#52B788', query: (c) => `halal+grocery+${c}` },
  { id: 'hair',    fr: 'Coiffeurs afro',      en: 'Afro hairdressers',  icon: '💈', color: '#B5838D', query: (c) => `afro+hair+salon+${c}` },
  { id: 'exotic',  fr: 'Épiceries exotiques', en: 'Exotic stores',      icon: '🛒', color: '#FBBF24', query: (c) => `african+caribbean+grocery+${c}` },
  { id: 'prices',  fr: 'Prix comparés',       en: 'Price comparison',   icon: '💰', color: '#60A5FA', query: null },
]

export default function DayToDay() {
  const { C, lang } = useApp()
  const [city,   setCity]   = useState('Montreal')
  const [active, setActive] = useState('halal')
  const cat    = CATEGORIES.find(c => c.id === active)
  const prices = PRICES[city] || PRICES.Montreal

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
        {active !== 'prices' && cat?.query && (
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
      </main>
    </div>
  )
}
