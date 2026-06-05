// lib/geoHelpers.js — Province / city detection + resource selection
import RESOURCES_DB from '../data/resources-db.js'

// ── Province detection from city name ─────────────────────────────
export const getProvince = (ville) => {
  if (!ville) return null
  const v = ville.toLowerCase()
  if (['montréal','montreal','québec','quebec','gatineau','laval','sherbrooke','longueuil','saguenay','trois-rivières','brossard','rimouski'].some(c => v.includes(c))) return 'QC'
  if (['ottawa','toronto','hamilton','london','windsor','kingston','waterloo','mississauga','brampton','markham','vaughan','barrie','sudbury'].some(c => v.includes(c))) return 'ON'
  if (['vancouver','victoria','burnaby','surrey','richmond','kelowna','abbotsford','nanaimo'].some(c => v.includes(c))) return 'BC'
  if (['calgary','edmonton','alberta', ' ab '].some(c => v.includes(c))) return 'AB'
  if (['winnipeg','manitoba',' mb '].some(c => v.includes(c))) return 'MB'
  if (['saskatoon','regina','saskatchewan',' sk '].some(c => v.includes(c))) return 'SK'
  if (['halifax','nova scotia','nouvelle-ecosse',' ns '].some(c => v.includes(c))) return 'NS'
  if (['moncton','fredericton','saint john','new brunswick',' nb '].some(c => v.includes(c))) return 'NB'
  return null
}

// ── Normalized city detection ─────────────────────────────────────
export const getCity = (ville) => {
  if (!ville) return null
  const v = ville.toLowerCase()
  if (v.includes('montreal') || v.includes('montréal')) return 'montreal'
  if (v.includes('quebec')   || v.includes('québec'))   return 'quebec'
  if (v.includes('ottawa'))    return 'ottawa'
  if (v.includes('toronto'))   return 'toronto'
  if (v.includes('vancouver')) return 'vancouver'
  if (v.includes('calgary'))   return 'calgary'
  if (v.includes('edmonton'))  return 'edmonton'
  if (v.includes('winnipeg'))  return 'winnipeg'
  return null
}

// ── Programmatic resource selection ───────────────────────────────
export const selectResources = (profile) => {
  const province = getProvince(profile.ville_accueil)
  const city     = getCity(profile.ville_accueil)
  const univKeyword = (profile.universite || '').toLowerCase()
  const pool = []

  // 1. Health — by province (top priority)
  const sante = RESOURCES_DB.sante.find(r => r.province === province)
  if (sante) pool.push({ ...sante, emoji: '🏥' })

  // 2. SIN — universal
  const nas = RESOURCES_DB.immigration.find(r => r.url.includes('numero-assurance-sociale'))
  if (nas) pool.push({ ...nas, emoji: '🪪' })

  // 3. University — match by keywords on name, else by province
  const univ =
    RESOURCES_DB.universites.find(u => u.keywords.some(k => univKeyword.includes(k))) ||
    RESOURCES_DB.universites.find(u => province && u.province === province)
  if (univ) pool.push({ name: univ.name, url: univ.url, description: `Site officiel – ${univ.name}`, emoji: '🎓' })

  // 4. Bank — Desjardins for QC, TD for others
  const banque = province === 'QC'
    ? RESOURCES_DB.banques.find(b => b.url.includes('desjardins'))
    : RESOURCES_DB.banques.find(b => b.url.includes('td.com'))
  if (banque) pool.push({ ...banque, emoji: '🏦' })

  // 5. Employment — max 2 resources
  const indeedVille    = city ? RESOURCES_DB.emploi.find(e => e.city === city && e.url.includes('indeed')) : null
  const indeedNational = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('indeed'))
  const guichetNational = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('guichetemplois'))
  if (indeedVille)    pool.push({ ...indeedVille,    emoji: '💼' })
  else if (indeedNational) pool.push({ ...indeedNational, emoji: '💼' })
  if (guichetNational) pool.push({ ...guichetNational, emoji: '🔍' })

  // 6. Housing by city if known, else national Kijiji
  const logementVille   = city ? RESOURCES_DB.logement.find(l => l.city === city) : null
  const logementNational = RESOURCES_DB.logement.find(l => l.province === 'all' && l.url.includes('kijiji'))
  if (logementVille)    pool.push({ ...logementVille,   emoji: '🏠' })
  else if (logementNational) pool.push({ ...logementNational, emoji: '🏠' })

  return pool.slice(0, 5)
}
