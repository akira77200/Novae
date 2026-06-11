// pages/api/cv/generer.js — Guide CV canadien via Claude
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, getIP, requireAuth } from '../../../lib/apiGuards'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Configuration serveur manquante' })
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 10)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { profil, experiences, formation, competences, langues, poste_cible } = req.body
  if (!profil?.nom) return res.status(400).json({ error: 'profil.nom requis' })

  const expText = (experiences || []).map((e, i) =>
    `${i + 1}. ${e.poste} chez ${e.entreprise} (${e.debut}–${e.fin || 'présent'}) — ${e.description || 'aucune description'}`
  ).join('\n') || 'Aucune expérience renseignée.'

  const prompt = `Tu es un expert en recrutement canadien. Génère un guide d'optimisation de CV adapté au marché canadien pour ce candidat.

Données du candidat :
- Nom : ${profil.nom}
- Poste cible : ${poste_cible || 'non spécifié'}
- Ville : ${profil.ville || 'Canada'}
- Statut : ${profil.statut || 'non spécifié'}
- Formation : ${formation || 'non spécifiée'}
- Compétences : ${(competences || []).join(', ') || 'non spécifiées'}
- Langues : ${(langues || []).join(', ') || 'non spécifiées'}
- Expériences :
${expText}

Génère un JSON STRICT (sans markdown, sans backticks) avec exactement ces clés :
{
  "resume_professionnel": "Résumé professionnel de 3-4 phrases percutantes, optimisé pour le marché canadien. Commence fort. Mentionne le poste cible, la valeur apportée, et une réalisation clé.",
  "experiences_optimisees": [
    {
      "poste": "Titre original du poste",
      "poste_optimise": "Titre optimisé pour le marché canadien (plus vendeur si besoin)",
      "bullets": [
        "Verbe d'action fort + réalisation concrète + métrique si possible",
        "Verbe d'action fort + réalisation concrète",
        "Verbe d'action fort + réalisation concrète"
      ]
    }
  ],
  "competences_classees": {
    "techniques": ["compétence technique 1", "compétence technique 2", "compétence technique 3"],
    "langues": ["Français (natif)", "Anglais (avancé)"],
    "soft_skills": ["Leadership", "Communication interculturelle", "Adaptabilité"]
  },
  "conseils_canadiens": [
    "Conseil spécifique au marché canadien (format, longueur, style)",
    "Conseil sur l'adaptation culturelle du CV",
    "Conseil sur les mots-clés ATS populaires dans ce secteur",
    "Conseil sur la mise en page (pas de photo, pas d'âge, pas d'état civil)"
  ],
  "mots_cles_secteur": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5", "mot-clé 6", "mot-clé 7", "mot-clé 8"]
}

Règles :
- Chaque bullet commence par un verbe d'action au passé (Développé, Géré, Augmenté, Optimisé, Coordonné, etc.)
- Ajoute des métriques quand possible (ex: "Réduit les délais de 30%", "Géré une équipe de 5 personnes")
- 2 à 4 bullets par expérience
- Si la description est vide, génère des bullets plausibles et réalistes selon le poste
- mots_cles_secteur = mots-clés recherchés par les recruteurs ATS dans ce domaine
- Tout en français professionnel
- JSON valide uniquement`

  try {
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0]?.text || '{}')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    const json = JSON.parse(raw)
    return res.status(200).json({ success: true, data: json })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
