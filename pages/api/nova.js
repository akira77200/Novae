// pages/api/nova.js — Assistant IA Nova (streaming SSE)
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Tu es Nova, l'assistante IA de Novae — une app qui aide les nouveaux arrivants au Canada (étudiants, travailleurs, familles).

Ton rôle : répondre à leurs questions sur l'immigration, la vie au Canada, les démarches administratives, les droits, la santé, les impôts, le logement, les études, le travail.

Règles :
- Réponds toujours en français par défaut, sauf si l'utilisateur écrit en anglais
- Sois chaleureuse, directe, précise — comme une amie qui a vécu la même expérience
- Donne des réponses courtes et actionnables (3-6 phrases max sauf si on te demande un détail)
- Cite des ressources officielles quand pertinent (canada.ca, ramq.gouv.qc.ca, etc.)
- Ne jamais inventer des dates ou des montants — dis "vérifie sur le site officiel" si tu n'es pas sûre
- Tu peux utiliser des emojis avec modération
- Si la question sort de ton domaine (Canada/immigration), redirige poliment vers ton expertise

Contexte Canada : RAMQ (QC), OHIP (ON), NAS, permis d'études, CAQ, PGWP, RP, impôts 30 avril, crédit TPS/TVH, T2202.`

export default async function handler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Configuration serveur manquante' })
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, profile } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages requis' })

  // Contexte profil optionnel injecté en system
  let systemFinal = SYSTEM_PROMPT
  if (profile) {
    const ctx = [
      profile.statut     && `Statut: ${profile.statut}`,
      profile.ville_accueil && `Ville: ${profile.ville_accueil}`,
      profile.pays_origine  && `Origine: ${profile.pays_origine}`,
      profile.date_arrivee  && `Arrivée: ${profile.date_arrivee}`,
    ].filter(Boolean).join(', ')
    if (ctx) systemFinal += `\n\nProfil de l'utilisateur : ${ctx}. Utilise ce contexte pour personnaliser tes réponses.`
  }

  // Streaming SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = await client.messages.stream({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     systemFinal,
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
