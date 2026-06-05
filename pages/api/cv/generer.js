// pages/api/cv/generer.js — Génération résumé + bullet points via Claude
import { anthropic, requireAnthropicKey } from '../../../lib/anthropic'
import { parseClaudeJson } from '../../../lib/parseJson'
import { checkRateLimit, getIP, requireAuth } from '../../../lib/apiGuards'

export default async function handler(req, res) {
  if (!requireAnthropicKey(res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { profil, experiences, formation, competences, langues, poste_cible } = req.body
  if (!profil?.nom) return res.status(400).json({ error: 'profil.nom requis' })

  const expText = (experiences || []).map((e, i) =>
    `${i + 1}. ${e.poste} chez ${e.entreprise} (${e.debut}–${e.fin || 'présent'}) — ${e.description || 'aucune description'}`
  ).join('\n') || 'Aucune expérience renseignée.'

  const prompt = `Tu es un expert en recrutement canadien. Génère du contenu pour un CV professionnel adapté au marché canadien.

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

Génère un JSON STRICT (sans markdown) avec exactement ces clés :
{
  "resume": "Résumé professionnel de 2-3 phrases percutantes pour le marché canadien. Commence par un verbe d'action ou une qualification forte. Mentionne la ville si pertinent.",
  "bullets": [
    {"index": 0, "points": ["bullet 1", "bullet 2", "bullet 3"]},
    ...un objet par expérience dans l'ordre
  ],
  "competences_triees": ["compétence 1", "compétence 2", ...jusqu'à 8 max, triées par pertinence pour le poste cible]
}

Règles pour les bullets :
- Commence chaque bullet par un verbe d'action passé fort (Développé, Géré, Augmenté, Optimisé, etc.)
- Ajoute des métriques quand possible (ex: "Réduit les délais de 30%")
- 2 à 4 bullets par expérience
- Adapte au marché canadien (vocabulaire, normes)
- Si la description est vide, invente des bullets plausibles selon le poste`

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    })

    const json = parseClaudeJson(msg.content[0]?.text)
    return res.status(200).json({ success: true, data: json })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
