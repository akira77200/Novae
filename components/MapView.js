import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icônes Leaflet avec Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Coordonnées des grandes villes canadiennes
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

export default function MapView({ city, query }) {
  const [places,  setPlaces]  = useState([])
  const [loading, setLoading] = useState(false)
  const [center,  setCenter]  = useState([45.5017, -73.5673])

  useEffect(() => {
    const key    = normalizeCity(city)
    const coords = CITY_COORDS[key] || CITY_COORDS.montreal
    setCenter(coords)

    // query contient déjà la ville sous forme "halal+grocery+Montreal"
    // On remplace les + par des espaces pour Nominatim
    const searchQuery = query.replace(/\+/g, ' ')

    setLoading(true)
    setPlaces([])

    fetch('https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({
        q:              searchQuery,
        format:         'json',
        limit:          10,
        countrycodes:   'ca',
        addressdetails: 1,
      }), {
      headers: { 'Accept-Language': 'fr' }
    })
      .then(r => r.json())
      .then(data => {
        const results = data
          .filter(p => p.lat && p.lon)
          .map(p => ({
            lat:     parseFloat(p.lat),
            lon:     parseFloat(p.lon),
            name:    p.display_name.split(',')[0],
            address: p.display_name.split(',').slice(1, 3).join(',').trim(),
          }))
        setPlaces(results)
      })
      .catch(err => console.warn('Nominatim:', err))
      .finally(() => setLoading(false))
  }, [city, query])

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query.replace(/\+/g, ' '))}`

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>

      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000, background: 'rgba(0,0,0,0.7)',
          color: '#fff', padding: '8px 16px', borderRadius: '8px',
          fontSize: '0.85rem', pointerEvents: 'none',
        }}>
          Recherche en cours...
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '420px', width: '100%' }}
        key={`${city}-${query}`}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lon]}>
            <Popup>
              <strong>{place.name}</strong><br />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{place.address}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {!loading && places.length === 0 && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(0,0,0,0.75)',
          color: '#fff', padding: '8px 16px', borderRadius: '8px',
          fontSize: '0.82rem', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          Aucun résultat trouvé pour cette recherche
        </div>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute', bottom: '10px', right: '10px',
          zIndex: 1000, background: '#2D6A4F',
          color: '#fff', padding: '6px 12px',
          borderRadius: '8px', fontSize: '0.78rem',
          textDecoration: 'none', fontWeight: 600,
        }}
      >
        Ouvrir dans Google Maps →
      </a>

    </div>
  )
}
