// pages/api/guides/generer.js — Génération de guides complets via Claude
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, getIP } from '../../../lib/apiGuards'

export const GUIDES_CONTENT = {
  ramq: {
    titre: 'Guide complet RAMQ — Assurance maladie Québec',
    sections: [
      "Qu'est-ce que la RAMQ et qui y a droit",
      'Documents nécessaires pour s\'inscrire',
      'Comment s\'inscrire étape par étape',
      'Délai de carence de 3 mois — que faire pendant cette période',
      'Ce qui est couvert et ce qui ne l\'est pas',
      'Comment obtenir sa carte d\'assurance maladie',
      'Renouvellement et changement d\'adresse',
      'Numéros et contacts utiles',
    ],
  },
  nas: {
    titre: 'Guide complet NAS — Numéro d\'Assurance Sociale',
    sections: [
      "Qu'est-ce que le NAS et pourquoi c'est urgent",
      'Qui peut obtenir un NAS',
      'Documents requis',
      'Où aller et comment faire la demande',
      "Délai d'obtention",
      'Comment protéger son NAS',
      'NAS temporaire vs permanent',
    ],
  },
  banque: {
    titre: 'Guide complet — Ouvrir un compte bancaire au Canada',
    sections: [
      'Pourquoi ouvrir un compte rapidement',
      'Les grandes banques canadiennes comparées',
      'Comptes étudiants sans frais',
      'Documents nécessaires',
      'Étapes pour ouvrir un compte',
      'Carte de débit vs carte de crédit',
      'Comment commencer à construire sa cote de crédit',
      'Virements internationaux — comment envoyer de l\'argent',
    ],
  },
  credit: {
    titre: 'Guide complet — Construire sa cote de crédit au Canada',
    sections: [
      "Qu'est-ce que la cote de crédit",
      "Pourquoi c'est crucial pour un nouvel arrivant",
      'Comment démarrer sans historique',
      'Carte de crédit sécurisée — comment ça marche',
      'Les erreurs à éviter absolument',
      'Suivre sa cote de crédit gratuitement',
      'Objectif 700+ en 12 mois — plan détaillé',
    ],
  },
  impots: {
    titre: 'Guide complet — Déclaration de revenus au Canada',
    sections: [
      'Pourquoi déclarer même avec peu de revenus',
      'Fédéral vs provincial — deux déclarations',
      'Documents à rassembler (T4, relevés)',
      'Logiciels gratuits pour déclarer',
      'Crédits et déductions pour étudiants',
      'Date limite et pénalités',
      'Premier remboursement — à quoi s\'attendre',
    ],
  },
  logement: {
    titre: 'Guide complet — Trouver un logement au Canada',
    sections: [
      'Types de logement disponibles',
      'Budget recommandé par ville',
      'Sites pour chercher un logement',
      'Comment éviter les arnaques',
      "Le bail — ce qu'il faut savoir",
      'Dépôt de garantie — vos droits',
      'Résidence universitaire vs appartement',
      'Colocation — avantages et conseils',
    ],
  },
}

const cache = new Map()

function parseGuideJson(text) {
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
  raw = raw.replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(raw)
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 10)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const type = req.query?.type || req.body?.type
  const guide = GUIDES_CONTENT[type]
  if (!guide) return res.status(400).json({ error: 'Type de guide invalide' })

  if (cache.has(type)) {
    return res.status(200).json({ success: true, type, ...cache.get(type) })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Configuration serveur manquante' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Tu es un expert en intégration des nouveaux arrivants au Canada.
Rédige un guide complet en français pour : "${guide.titre}".

Sections obligatoires (dans cet ordre) :
${guide.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Réponds UNIQUEMENT en JSON valide sans markdown :
{
  "titre": "${guide.titre}",
  "introduction": "2-3 phrases d'introduction",
  "sections": [
    { "titre": "Titre de section", "contenu": "Contenu détaillé en 3-6 paragraphes ou listes à puces. Concret, actionnable, avec liens officiels quand pertinent (canada.ca, ramq.gouv.qc.ca, etc.)." }
  ]
}

Règles :
- Une entrée dans "sections" pour CHAQUE section listée ci-dessus
- Informations à jour pour 2024-2025
- Ton clair et rassurant pour nouveaux arrivants
- Pas de texte hors JSON`

  try {
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages:   [{ role: 'user', content: prompt }],
    })

    const parsed = parseGuideJson(message.content[0]?.text || '{}')
    const payload = {
      titre:        parsed.titre || guide.titre,
      introduction: parsed.introduction || '',
      sections:     parsed.sections || [],
    }

    cache.set(type, payload)
    res.status(200).json({ success: true, type, ...payload })
  } catch (err) {
    console.error('[guides/generer]', err.message)
    res.status(500).json({ error: 'Erreur de génération du guide. Réessaie.' })
  }
}
