// pages/api/generer-vision.js — NOVAE v5 — Vision IA personnalisée
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { programme, pays_origine, horizon, activites } = req.body
  if (!programme) return res.status(400).json({ error: 'Programme manquant' })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Tu es un conseiller de carrière expert pour étudiants africains francophones qui étudient au Canada.

Profil de l'étudiant :
- Programme d'études : ${programme}
- Pays d'origine : ${pays_origine || 'non renseigné'}
- Horizon après études : ${horizon || 'non renseigné'}
- Ce qu'il aime faire : ${activites || 'non renseigné'}

Génère une vision de carrière personnalisée, concrète et inspirante. Réponds UNIQUEMENT en JSON valide sans markdown ni backticks :
{
  "metiers_actuels": [
    {"titre": "...", "description": "Description en 1-2 phrases concrètes", "salaire_canada": "Ex: 75 000 – 95 000 $ CAD"},
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
      "probleme": "Problème concret et précis en ${pays_origine || 'Afrique'}",
      "solution": "La solution proposée en 1-2 phrases",
      "pourquoi_toi": "Pourquoi un étudiant en ${programme} est bien placé pour lancer ça",
      "exemple_mondial": "Nom d'une startup similaire qui a réussi ailleurs dans le monde"
    },
    {"nom": "...", "probleme": "...", "solution": "...", "pourquoi_toi": "...", "exemple_mondial": "..."},
    {"nom": "...", "probleme": "...", "solution": "...", "pourquoi_toi": "...", "exemple_mondial": "..."}
  ],
  "plan_5ans": {
    "annee_1_2": "Compétences clés à acquérir, projets académiques à mener, premier réseau à construire",
    "annee_3_4": "Stage stratégique visé, compétences complémentaires, réseau professionnel à développer",
    "annee_5": "Décision raisonnée — rester au Canada ou retour avec un plan clair — avec des étapes concrètes"
  },
  "message_motivation": "Message personnel, chaleureux et inspirant de 2 phrases qui montre que ce parcours est unique et précieux"
}

Règles importantes :
- Les salaires doivent être réalistes pour le Canada en 2024-2025
- Les idées de startup doivent être réalisables avec un budget limité et des compétences de jeune diplômé
- Les métiers futurs doivent vraiment émerger dans 5-10 ans (pas de science-fiction)
- Tout en français, ton bienveillant et encourageant`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const vision = JSON.parse(raw)
    res.status(200).json({ success: true, vision })
  } catch (err) {
    console.error('[generer-vision]', err.message)
    res.status(500).json({ error: err.message })
  }
}
