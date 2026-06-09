import Anthropic from '@anthropic-ai/sdk'
import { requireAuth, checkRateLimit, getIP } from '../../lib/apiGuards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 10)) return res.status(429).json({ error: 'Trop de requêtes. Réessaie dans une minute.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  // Support both { orientData } and { reponses } body shapes
  const orientData = req.body.orientData || req.body.reponses
  const lang = req.body.lang || 'fr'
  if (!orientData) return res.status(400).json({ error: 'Données manquantes.' })

  const { quiTuEs, forces, forcesTexte, journeeIdeale, changements, changementsTexte, pays, budget, horizon } = orientData

  const prompt = `Tu es un conseiller d'orientation bienveillant et expert pour nouveaux arrivants au Canada. Analyse le profil de cet étudiant et génère des recommandations profondes et personnalisées.

PROFIL FOURNI :
- Présentation personnelle : "${quiTuEs || 'Non renseigné'}"
- Forces naturelles sélectionnées : ${forces?.length ? forces.join(', ') : 'aucune'}
- Autres forces décrites : "${forcesTexte || 'aucune'}"
- Journée idéale dans 10 ans : "${journeeIdeale || 'Non renseigné'}"
- Domaines d'impact souhaités : ${changements?.length ? changements.join(', ') : 'aucun'}
- Précision sur l'impact : "${changementsTexte || 'aucune'}"
- Pays d'origine : ${pays || 'Non renseigné'}
- Budget annuel estimé : ${budget || 'Non renseigné'}
- Horizon après études : ${horizon || 'Non renseigné'}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Voici le schéma exact :
{
  "message_personnalise": "Message chaleureux et profond de 2-3 phrases qui montre que tu as vraiment LU et COMPRIS ce que cette personne a écrit. Cite des éléments spécifiques de son profil.",
  "traits_dominants": ["trait1", "trait2", "trait3"],
  "valeurs_profondes": ["valeur1", "valeur2", "valeur3"],
  "type_environnement": "Description courte du type d'environnement de travail qui lui correspond",
  "style_travail": "Description courte de son style de travail naturel",
  "programmes_recommandes": [
    {
      "id": "id-programme",
      "score": 87,
      "raison": "Explication personnalisée de 2-3 phrases qui fait le lien direct entre les éléments du profil et ce programme. Sois spécifique, pas générique.",
      "avertissement": "Une chose concrète à savoir ou à anticiper (optionnel, peut être null)",
      "alternative": "Un programme alternatif ou complémentaire à considérer (optionnel, peut être null)"
    },
    { "id": "...", "score": 75, "raison": "...", "avertissement": null, "alternative": null },
    { "id": "...", "score": 68, "raison": "...", "avertissement": null, "alternative": null }
  ],
  "questions_reflexion": [
    "Question profonde et personnalisée qui aide la personne à clarifier ses choix",
    "Deuxième question de réflexion",
    "Troisième question de réflexion"
  ],
  "plan_suggere": {
    "annee_1_2": "Description concrète des priorités des 2 premières années",
    "competences_cles": ["compétence1", "compétence2", "compétence3", "compétence4"],
    "premier_emploi": "Description d'un premier emploi réaliste et accessible",
    "vision_5_ans": "Vision inspirante et réaliste à 5 ans, ancrée dans les valeurs de la personne"
  }
}

IDs de programmes valides (utilise exactement ces IDs) :
data-science, genie-logiciel, cybersecurite, ia-ml, reseaux, genie-civil, genie-electrique, genie-mecanique, genie-minier, finance, administration, marketing, entrepreneuriat, rh, sante, pharmacie, sante-publique, psychologie, droit, sciences-po, education, environnement, energie, agriculture, design-ux

Règles importantes :
- Les scores doivent être entre 55 et 97
- Le premier programme doit avoir le score le plus élevé
- message_personnalise doit montrer que tu as LU le profil réel, pas une réponse générique
- questions_reflexion doivent être pertinentes au profil spécifique, pas génériques
- Réponds en ${lang === 'fr' ? 'français' : 'anglais'}`

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
