// components/MapView.js — NOVAE v5 — Overpass API (OpenStreetMap POI)
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useApp } from '../context/AppContext'

// Fix icônes Leaflet avec Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ── Coordonnées des grandes villes canadiennes ────────────────────────────
const CITY_COORDS = {
  montreal:  [45.5017,  -73.5673],
  toronto:   [43.6532,  -79.3832],
  ottawa:    [45.4215,  -75.6972],
  vancouver: [49.2827, -123.1207],
  calgary:   [51.0447, -114.0719],
  edmonton:  [53.5461, -113.4938],
  winnipeg:  [49.8951,  -97.1384],
  quebec:    [46.8139,  -71.2080],
  halifax:   [44.6488,  -63.5752],
  saskatoon: [52.1332, -106.6700],
  regina:    [50.4452, -104.6189],
}

function normalizeCity(city) {
  if (!city) return 'montreal'
  const c = city.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
  for (const key of Object.keys(CITY_COORDS)) {
    if (c.includes(key)) return key
  }
  return 'montreal'
}

// ── Détection catégorie depuis la prop query ──────────────────────────────
function detectCategory(query) {
  const q = (query || '').toLowerCase()
  if (q.includes('halal'))                                         return 'halal'
  if (q.includes('afro') || q.includes('hair'))                    return 'afro'
  if (q.includes('african') || q.includes('caribbean') || q.includes('exotic')) return 'grocery'
  return 'generic'
}

// ── Construction des requêtes Overpass ────────────────────────────────────
function buildOverpassQuery(category, lat, lng, radius = 5000, rawQuery = '') {
  const a = `(around:${radius},${lat},${lng})`

  if (category === 'halal') {
    return `[out:json][timeout:25];
(
  node["amenity"="restaurant"]["diet:halal"="yes"]${a};
  node["shop"="butcher"]["diet:halal"="yes"]${a};
  node["name"~"[Hh]alal"]${a};
  node["name"~"[Bb]oucherie"]${a};
  way["amenity"="restaurant"]["diet:halal"="yes"]${a};
  way["shop"="butcher"]["diet:halal"="yes"]${a};
);
out center 15;`
  }

  if (category === 'afro') {
    return `[out:json][timeout:25];
(
  node["shop"="hairdresser"]["name"~"[Aa]fro|[Bb]raids|[Nn]atural|[Tt]ress"]${a};
  node["shop"="hairdresser"]["speciality"~"afro"]${a};
  node["name"~"[Aa]fro|[Bb]raids|[Cc]ornrow"]${a};
);
out center 15;`
  }

  if (category === 'grocery') {
    return `[out:json][timeout:25];
(
  node["shop"="supermarket"]["name"~"[Aa]fric|[Cc]arib|[Ee]xotic|[Ii]nter"]${a};
  node["shop"="grocery"]["name"~"[Aa]fric|[Cc]arib|[Mm]aroc|[Ss]ene"]${a};
  node["name"~"[Aa]frique|[Aa]frican|[Cc]aribbean|[Mm]arche [Aa]fric"]${a};
);
out center 15;`
  }

  // generic — on cherche par les premiers mots de la query
  const terms = rawQuery.replace(/\+/g, ' ').trim().split(' ').slice(0, 2).join('|')
  return `[out:json][timeout:25];
(
  node["name"~"${terms}",i]${a};
);
out center 15;`
}

// ── Extraction des résultats Overpass ─────────────────────────────────────
function parseElements(elements) {
  return elements
    .map(el => {
      // nodes ont lat/lon directement ; ways ont element.center.lat/lon
      const lat = el.lat ?? el.center?.lat
      const lon = el.lon ?? el.center?.lon
      if (lat == null || lon == null) return null

      const tags    = el.tags || {}
      const name    = tags.name || tags['name:fr'] || tags['name:en'] || 'Commerce'
      const type    = tags.amenity || tags.shop || ''
      const address = [tags['addr:housenumber'], tags['addr:street']]
        .filter(Boolean).join(' ')

      return { lat: parseFloat(lat), lon: parseFloat(lon), name, type, address }
    })
    .filter(Boolean)
}

// ── Composant ─────────────────────────────────────────────────────────────
export default function MapView({ city, query }) {
  const { lang } = useApp()
  const isFr = lang === 'fr'

  const [places,  setPlaces]  = useState([])
  const [loading, setLoading] = useState(false)
  const [errKind, setErrKind] = useState(null)   // null | 'timeout' | 'network'
  const [center,  setCenter]  = useState([45.5017, -73.5673])

  useEffect(() => {
    const cityKey = normalizeCity(city)
    const coords  = CITY_COORDS[cityKey] || CITY_COORDS.montreal
    setCenter(coords)

    const [lat, lng] = coords
    const category   = detectCategory(query)
    const oql        = buildOverpassQuery(category, lat, lng, 5000, query)

    console.log('[MapView] category détectée:', category)
    console.log('[MapView] coords:', lat, lng)

    setLoading(true)
    setPlaces([])
    setErrKind(null)

    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), 22000)

    fetch('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    'data=' + encodeURIComponent(oql),
      signal:  controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error('network')
        return r.json()
      })
      .then(json => {
        const elements = json.elements || []
        console.log('[MapView] résultats Overpass:', elements.length)
        setPlaces(parseElements(elements))
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          setErrKind('timeout')
          console.warn('[MapView] timeout Overpass')
        } else {
          setErrKind('network')
          console.warn('[MapView] erreur réseau:', err.message)
        }
      })
      .finally(() => {
        clearTimeout(timer)
        setLoading(false)
      })

    return () => { controller.abort(); clearTimeout(timer) }
  }, [city, query])

  const googleUrl = `https://www.google.com/maps/search/${encodeURIComponent(query.replace(/\+/g, ' ') + ' ' + city)}`

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>

      {/* Loader */}
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', zIndex: 1000,
          background: 'rgba(0,0,0,0.72)', color: '#fff',
          padding: '8px 18px', borderRadius: 9, fontSize: '0.85rem', pointerEvents: 'none',
        }}>
          {isFr ? 'Recherche en cours…' : 'Searching…'}
        </div>
      )}

      {/* Carte Leaflet */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 420, width: '100%' }}
        key={`${city}-${query}`}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon]}>
            <Popup>
              <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
              {p.type && (
                <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 2, textTransform: 'capitalize' }}>
                  {p.type}
                </div>
              )}
              {p.address && (
                <div style={{ fontSize: '0.78rem', color: '#555', marginTop: 2 }}>
                  {p.address}
                </div>
              )}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(p.name + ' ' + city)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2D6A4F', fontSize: '0.78rem', display: 'block', marginTop: 6, fontWeight: 600 }}
              >
                {isFr ? 'Voir sur Google Maps →' : 'View on Google Maps →'}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Messages overlay ────────────────────────────────────────── */}

      {/* Timeout */}
      {!loading && errKind === 'timeout' && (
        <div style={{
          position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(180,50,50,0.88)', color: '#fff',
          padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
          textAlign: 'center', maxWidth: '90%',
        }}>
          {isFr
            ? 'Service temporairement indisponible, réessaie dans quelques secondes.'
            : 'Service temporarily unavailable, try again in a few seconds.'}
        </div>
      )}

      {/* Erreur réseau */}
      {!loading && errKind === 'network' && (
        <div style={{
          position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(180,50,50,0.88)', color: '#fff',
          padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
          textAlign: 'center', maxWidth: '90%',
        }}>
          {isFr
            ? 'Erreur réseau. Utilise Google Maps ci-dessous.'
            : 'Network error. Use Google Maps below.'}
        </div>
      )}

      {/* 0 résultat (sans erreur) */}
      {!loading && !errKind && places.length === 0 && (
        <div style={{
          position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(0,0,0,0.78)', color: '#fff',
          padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
          textAlign: 'center', maxWidth: '90%',
        }}>
          {isFr
            ? 'Peu de résultats OSM pour cette recherche. Essaie Google Maps pour plus de résultats.'
            : 'Few OSM results for this search. Try Google Maps for more results.'}
        </div>
      )}

      {/* Lien Google Maps permanent */}
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute', bottom: 10, right: 10,
          zIndex: 1000, background: '#2D6A4F', color: '#fff',
          padding: '6px 12px', borderRadius: 8,
          fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600,
        }}
      >
        {isFr ? 'Ouvrir dans Google Maps →' : 'Open in Google Maps →'}
      </a>

    </div>
  )
}
