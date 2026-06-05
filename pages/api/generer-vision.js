// pages/api/generer-vision.js — NOVAE v5 — Vision IA personnalisée
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, getIP, requireAuth } from '../../lib/apiGuards'

function parseVisionJson(text) {
  let raw = (text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()

  const start = raw.indexOf('{')
  const end   = raw.lastIndexOf('}')
  if (start !== -1 && end > start) raw = raw.slice(start, end + 1)

  // Corrige les virgules traînantes avant } ou ]
  raw = raw.replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(raw)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { programme, pays_origine, horizon, activites } = req.body
  if (!programme) return res.status(400).json({ error: 'Programme manquant' })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const pays = pays_origine || 'non renseigné'

  const prompt = `Tu es un conseiller de carrière expert pour nouveaux arrivants francophones qui étudient au Canada.

Profil de l'étudiant :
- Programme d'études : ${programme}
- Pays d'origine : ${pays}
- Horizon après études : ${horizon || 'non renseigné'}
- Ce qu'il aime faire : ${activites || 'non renseigné'}

Génère une vision de carrière personnalisée, concrète et inspirante. Réponds UNIQUEMENT en JSON valide sans markdown ni backticks :
{
  "metiers_actuels": [
    {"titre": "...", "description": "Description en 1-2 phrases concrètes", "salaire_canada": "75 000 – 95 000 $ CAD/an"},
    {"titre": "...", "description": "...", "salaire_canada": "..."},
    {"titre": "...", "description": "...", "salaire_canada": "..."}
  ],
  "metiers_futur": [
    {"titre": "...", "description": "Ce que ce métier fera dans 10 ans", "pourquoi_emerge": "Pourquoi ce rôle va exploser dans la prochaine décennie"},
    {"titre": "...", "description": "...", "pourquoi_emerge": "..."},
    {"titre": "...", "description": "...", "pourquoi_emerge": "..."}
  ],
  "impact_ia": "2-3 phrases sur comment l'IA va transformer ce secteur — opportunités ET risques, formulé de façon nuancée",
  "startups": [
    {
      "nom": "Nom accrocheur de la startup",
      "probleme": "Problème concret et précis lié à ${pays} (cite une réalité locale du pays)",
      "solution": "La solution proposée en 1-2 phrases",
      "pourquoi_toi": "Pourquoi un étudiant en ${programme} originaire de ${pays} est bien placé pour lancer ça",
      "exemple_mondial": "Nom d'une startup similaire qui a réussi ailleurs dans le monde"
    },
    {"nom": "...", "probleme": "...", "solution": "...", "pourquoi_toi": "...", "exemple_mondial": "..."},
    {"nom": "...", "probleme": "...", "solution": "...", "pourquoi_toi": "...", "exemple_mondial": "..."}
  ],
  "plan_5ans": {
    "annee_1_2": "Étapes actionnables concrètes : cours à prioriser, clubs/projets à rejoindre, compétences à acquérir, 1er réseau à construire",
    "annee_3_4": "Stage ou emploi précis à viser, certifications utiles, événements réseau, compétences complémentaires",
    "annee_5": "Décision claire rester au Canada ou retour — avec 3-4 actions concrètes (ex: type de poste, organisme, démarche immigration)"
  },
  "message_motivation": "Message personnel, chaleureux et inspirant de 2 phrases qui montre que ce parcours est unique et précieux"
}

Règles STRICTES :
- Chaque salaire_canada doit être une fourchette précise en dollars canadiens (ex: "62 000 – 78 000 $ CAD/an") réaliste pour le Canada en 2024-2025 selon le métier et la ville
- Les 3 idées de startup DOIVENT cibler des problèmes réels de ${pays} — pas d'exemples génériques "en Afrique", sois spécifique au pays
- Le plan_5ans doit contenir des actions concrètes et datables (pas de phrases vagues comme "développer son réseau")
- Les idées de startup doivent être réalisables avec un budget limité
- Les métiers futurs doivent émerger dans 5-10 ans (pas de science-fiction)
- Tout en français, ton bienveillant et encourageant
- JSON valide uniquement, pas de texte avant ou après`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0]?.text || ''

    try {
      const vision = parseVisionJson(rawText)
      res.status(200).json({ success: true, vision })
    } catch (err) {
      console.error('[generer-vision] JSON invalide:', rawText.substring(0, 300))
      res.status(500).json({
        error: 'Erreur de génération. Réessaie dans quelques secondes.',
      })
    }
  } catch (err) {
    console.error('[generer-vision]', err.message)
    res.status(500).json({ error: 'Erreur de génération. Réessaie dans quelques secondes.' })
  }
}
