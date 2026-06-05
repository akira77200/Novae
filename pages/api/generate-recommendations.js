import { anthropic } from '../../lib/anthropic';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { parseClaudeJson } from '../../lib/parseJson';
import RESOURCES_DB from '../../data/resources-db.js';
import { checkRateLimit, getIP, requireAuth } from '../../lib/apiGuards';

// ── Détection province depuis ville ──────────────────────────────
const getProvince = (ville) => {
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

// ── Détection ville normalisée ────────────────────────────────────
const getCity = (ville) => {
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

// ── Sélection programmatique des ressources ───────────────────────
// Priorité : santé > NAS > université > banque > emploi municipal > logement
const selectResources = (profile) => {
  const province = getProvince(profile.ville_accueil)
  const city     = getCity(profile.ville_accueil)
  const univKeyword = (profile.universite || '').toLowerCase()
  const pool = []

  // 1. Santé — selon province (priorité max)
  const sante = RESOURCES_DB.sante.find(r => r.province === province)
  if (sante) pool.push({ ...sante, emoji: '🏥' })

  // 2. NAS — universel
  const nas = RESOURCES_DB.immigration.find(r => r.url.includes('numero-assurance-sociale'))
  if (nas) pool.push({ ...nas, emoji: '🪪' })

  // 3. Université — match par mots-clés sur le nom, sinon par province
  const univ =
    RESOURCES_DB.universites.find(u => u.keywords.some(k => univKeyword.includes(k))) ||
    RESOURCES_DB.universites.find(u => province && u.province === province)
  if (univ) pool.push({ name: univ.name, url: univ.url, description: `Site officiel – ${univ.name}`, emoji: '🎓' })

  // 4. Banque — Desjardins pour QC, TD pour les autres
  const banque = province === 'QC'
    ? RESOURCES_DB.banques.find(b => b.url.includes('desjardins'))
    : RESOURCES_DB.banques.find(b => b.url.includes('td.com'))
  if (banque) pool.push({ ...banque, emoji: '🏦' })

  // 5. Emploi — max 2 ressources
  //    Si ville connue → Indeed filtré par ville + Guichet Emplois national
  //    Si ville inconnue → Indeed Canada + Guichet Emplois national
  const indeedVille    = city ? RESOURCES_DB.emploi.find(e => e.city === city && e.url.includes('indeed')) : null
  const indeedNational = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('indeed'))
  const guichetNational = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('guichetemplois'))
  if (indeedVille)    pool.push({ ...indeedVille,    emoji: '💼' })
  else if (indeedNational) pool.push({ ...indeedNational, emoji: '💼' })
  if (guichetNational) pool.push({ ...guichetNational, emoji: '🔍' })

  // 6. Logement par ville si connue, sinon Kijiji national
  const logementVille   = city ? RESOURCES_DB.logement.find(l => l.city === city) : null
  const logementNational = RESOURCES_DB.logement.find(l => l.province === 'all' && l.url.includes('kijiji'))
  if (logementVille)    pool.push({ ...logementVille,   emoji: '🏠' })
  else if (logementNational) pool.push({ ...logementNational, emoji: '🏠' })

  return pool.slice(0, 5)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { profile } = req.body;
  if (!profile?.id) return res.status(400).json({ error: 'Profil manquant' });

  const prompt = `Tu es un conseiller bienveillant pour étudiants africains
francophones arrivant au Canada. Génère des recommandations PERSONNALISÉES.

Profil :
- Nom : ${profile.full_name || 'Non renseigné'}
- Pays d'origine : ${profile.pays_origine || 'Non renseigné'}
- Ville au Canada : ${profile.ville_accueil || 'Non renseignée'}
- Université : ${profile.universite || 'Non renseignée'}
- Programme : ${profile.programme || 'Non renseigné'}
- Statut : ${profile.statut || 'etudiant'}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "welcome_message": "Message chaleureux personnalisé de 2 phrases pour ${profile.full_name?.split(' ')[0] || 'toi'}",
  "books": [
    {"title": "...", "author": "...", "why": "Explication courte pourquoi ce livre", "emoji": "📚"},
    {"title": "...", "author": "...", "why": "...", "emoji": "📘"},
    {"title": "...", "author": "...", "why": "...", "emoji": "📗"}
  ],
  "tips": [
    {"text": "Conseil concret et actionnable", "category": "finance", "emoji": "💰"},
    {"text": "...", "category": "social", "emoji": "🤝"},
    {"text": "...", "category": "academique", "emoji": "🎓"},
    {"text": "...", "category": "sante", "emoji": "🏥"}
  ]
}

Règles :
- Pour books : recommande des vrais livres avec vrais auteurs adaptés au programme
- Si programme contient statistique/math → livres académiques réels (ex: Casella & Berger)
- Si programme contient informatique → livres tech réels
- Si programme non renseigné → livres sur l'intégration au Canada + développement personnel
- Tout en français`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const llmResult = parseClaudeJson(message.content[0].text);

    // Ressources construites programmatiquement depuis RESOURCES_DB — jamais inventées
    const resources = selectResources(profile)

    const recommendations = {
      welcome_message: llmResult.welcome_message,
      books:           llmResult.books     || [],
      tips:            llmResult.tips      || [],
      resources,
    }

    // Sauvegarder dans Supabase avec la clé service (bypass RLS)
    await supabaseAdmin
      .from('profiles')
      .update({ ai_recommendations: recommendations })
      .eq('id', profile.id);

    res.status(200).json({ success: true, recommendations });

  } catch (err) {
    console.error('[generate-recommendations]', err.message);
    res.status(500).json({ error: err.message });
  }
}
