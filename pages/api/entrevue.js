// pages/api/entrevue.js — Simulation entrevue IA (streaming SSE)
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, getIP, requireAuth, checkMessageLength } from '../../lib/apiGuards'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = {
  emploi: (poste, lang) => `Tu es un recruteur canadien expérimenté qui fait passer un entretien d'embauche pour le poste de "${poste}".

Règles STRICTES :
- Pose UNE SEULE question à la fois
- Attends la réponse avant de continuer
- Après chaque réponse : donne un feedback COURT (2-3 phrases max : ce qui était bien, ce qui pourrait être amélioré) puis enchaîne avec la question suivante
- Après 5-6 échanges : donne un bilan final structuré (Points forts / À améliorer / Score /10)
- Adapte-toi au marché canadien : questions comportementales STAR, diversité, culture d'entreprise
- Langue : ${lang === 'fr' ? 'français' : 'anglais'}
- Commence directement par te présenter brièvement et poser ta première question`,

  admission: (programme, lang) => `Tu es un responsable des admissions dans une université canadienne pour le programme "${programme}".

Règles STRICTES :
- Pose UNE SEULE question à la fois
- Après chaque réponse : feedback COURT (ce qui était convaincant, ce qui manque) puis question suivante
- Après 5-6 échanges : bilan final (Motivation / Cohérence du projet / Préparation / Score /10)
- Questions typiques : motivation, projet professionnel, expériences pertinentes, connaissance du programme, vie au Canada
- Langue : ${lang === 'fr' ? 'français' : 'anglais'}
- Commence par te présenter et poser ta première question`,

  visa: (type, lang) => `Tu es un agent d'immigration canadien qui évalue une demande de ${type}.

Règles STRICTES :
- Pose UNE SEULE question à la fois
- Feedback COURT après chaque réponse (réponse claire ou à clarifier)
- Après 5-6 échanges : bilan (Cohérence / Documents / Points de vigilance / Avis favorable ou défavorable)
- Questions sur : intentions réelles, liens avec pays d'origine, ressources financières, projet post-études/travail
- Sois professionnel mais neutre — pas d'encouragements excessifs
- Langue : ${lang === 'fr' ? 'français' : 'anglais'}
- Commence par te présenter et poser ta première question`,
}

export default async function handler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Configuration serveur manquante' })
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de requêtes.' })

  const authResult = await requireAuth(req)
  if (!authResult.ok) return res.status(401).json({ error: authResult.error })

  const { messages, type, cible, lang } = req.body
  if (!messages?.length || !type) return res.status(400).json({ error: 'messages et type requis' })

  // 3. Longueur max 500 caractères
  if (!checkMessageLength(messages, 500)) {
    return res.status(400).json({ error: 'Message trop long (max 500 caractères).' })
  }

  const systemPrompt =
    type === 'emploi'    ? SYSTEM.emploi(cible || 'poste non spécifié', lang)    :
    type === 'admission' ? SYSTEM.admission(cible || 'programme non spécifié', lang) :
    SYSTEM.visa(cible || 'permis d\'études', lang)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = await client.messages.stream({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system:     systemPrompt,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    })
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }
    res.write('data: [DONE]\n\n')
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
  } finally {
    res.end()
  }
}
