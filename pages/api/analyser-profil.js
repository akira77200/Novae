import Anthropic from '@anthropic-ai/sdk'
import { requireAuth, checkRateLimit, getIP } from '../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 10)) return res.status(429).json({ error: 'Trop de requêtes. Réessaie dans une minute.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  // Support both { orientData } and { reponses } body shapes
  const reponses = req.body.orientData || req.body.reponses
  const lang = req.body.lang || 'fr'
  if (!reponses) return res.status(400).json({ error: 'Données manquantes.' })

  const prompt = `Tu es un conseiller d'orientation expert pour étudiants internationaux au Canada.

Analyse ce profil avec TOUTES les informations :

MATIÈRES FORTES : ${reponses.matieres?.join(', ') || 'Non renseigné'}
DESCRIPTION LIBRE MATIÈRES : "${reponses.matieresTexte || ''}"

ACTIVITÉ PRÉFÉRÉE : ${reponses.activite || 'Non renseigné'}
DESCRIPTION LIBRE ACTIVITÉS : "${reponses.activiteTexte || ''}"

RAPPORT AU RISQUE : ${reponses.risque || 'Non renseigné'}
DESCRIPTION LIBRE RISQUE : "${reponses.risqueTexte || ''}"

HORIZON : ${reponses.horizon || 'Non renseigné'}
DESCRIPTION LIBRE HORIZON : "${reponses.horizonTexte || ''}"

PAYS D'ORIGINE : ${reponses.pays || reponses.paysAutre2 || 'Non renseigné'}
BUDGET : ${reponses.budget || 'Non renseigné'}

IMPORTANT : Les descriptions libres sont plus importantes que les chips. Si l'étudiant a écrit quelque chose en texte libre, c'est sa vraie voix. Cite ses propres mots dans tes recommandations. Personnalise VRAIMENT selon ce qu'il a écrit.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires :
{
  "message_personnalise": "Message qui cite ses propres mots et montre que tu as vraiment lu son profil (2-3 phrases)",
  "traits_dominants": ["trait1", "trait2", "trait3"],
  "valeurs_profondes": ["valeur1", "valeur2", "valeur3"],
  "type_environnement": "Description courte du type d'environnement de travail qui lui correspond",
  "style_travail": "Description courte de son style de travail naturel",
  "programmes_recommandes": [
    {
      "id": "id-programme",
      "score": 87,
      "raison": "Basé sur ce que TU as écrit — lien direct entre le profil et ce programme (2-3 phrases spécifiques)",
      "avertissement": "Une chose concrète à anticiper (ou null)",
      "alternative": "Un programme complémentaire à considérer (ou null)"
    },
    { "id": "...", "score": 75, "raison": "...", "avertissement": null, "alternative": null },
    { "id": "...", "score": 68, "raison": "...", "avertissement": null, "alternative": null }
  ],
  "questions_reflexion": [
    "Question personnalisée ancrée dans son profil spécifique",
    "Deuxième question de réflexion",
    "Troisième question de réflexion"
  ],
  "plan_suggere": {
    "annee_1_2": "Priorités concrètes des 2 premières années",
    "competences_cles": ["compétence1", "compétence2", "compétence3", "compétence4"],
    "premier_emploi": "Premier emploi réaliste et accessible",
    "vision_5_ans": "Vision inspirante à 5 ans ancrée dans ses valeurs"
  }
}

IDs de programmes valides (utilise exactement ces IDs) :
data-science, genie-logiciel, cybersecurite, ia-ml, reseaux, genie-civil, genie-electrique, genie-mecanique, genie-minier, finance, administration, marketing, entrepreneuriat, rh, sante, pharmacie, sante-publique, psychologie, droit, sciences-po, education, environnement, energie, agriculture, design-ux

Règles : scores entre 55 et 97, premier programme = score le plus élevé. Réponds en ${lang === 'fr' ? 'français' : 'anglais'}`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].text.trim()
    // Nettoyer le JSON avant parse (enlever ```json, ``` etc.)
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const analyse = JSON.parse(cleaned)

    return res.status(200).json({ success: true, analyse })

  } catch (err) {
    console.error('[analyser-profil]', err.message)
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Erreur de traitement IA. Réessaie.' })
    }
    return res.status(500).json({ error: err.message || 'Erreur serveur.' })
  }
}
