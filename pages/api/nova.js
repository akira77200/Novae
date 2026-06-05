// pages/api/nova.js — Assistant IA Nova (streaming SSE)
import { anthropic, requireAnthropicKey } from '../../lib/anthropic'
import { initSSE, streamAnthropicResponse } from '../../lib/sse'
import { checkRateLimit, getIP, requireAuth, checkMessageLength } from '../../lib/apiGuards'

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
  if (!requireAnthropicKey(res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (!checkRateLimit(ip, 20)) {
    return res.status(429).json({ error: 'Trop de messages. Réessaie dans une heure.' })
  }

  const authResult = await requireAuth(req)
  if (!authResult.ok) {
    return res.status(401).json({
      error: authResult.error === 'Connexion requise.'
        ? 'Connexion requise pour utiliser Nova.'
        : authResult.error
    })
  }

  const { messages, profile } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages requis' })

  // 3. Longueur max 500 caractères par message
  if (!checkMessageLength(messages, 500)) {
    return res.status(400).json({ error: 'Message trop long (max 500 caractères).' })
  }

  // Contexte profil optionnel injecté en system
  let systemFinal = SYSTEM_PROMPT
  if (profile) {
    const ctx = [
      profile.statut        && `Statut: ${profile.statut}`,
      profile.ville_accueil && `Ville: ${profile.ville_accueil}`,
      profile.pays_origine  && `Origine: ${profile.pays_origine}`,
      profile.date_arrivee  && `Arrivée: ${profile.date_arrivee}`,
    ].filter(Boolean).join(', ')
    if (ctx) systemFinal += `\n\nProfil de l'utilisateur : ${ctx}. Utilise ce contexte pour personnaliser tes réponses.`
  }

  initSSE(res)

  const stream = await anthropic.messages.stream({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system:     systemFinal,
    messages:   messages.map(m => ({ role: m.role, content: m.content })),
  })

  await streamAnthropicResponse(stream, res)
}
