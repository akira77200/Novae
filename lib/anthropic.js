// lib/anthropic.js — Shared Anthropic client + API key guard
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export function requireAnthropicKey(res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Configuration serveur manquante' })
    return false
  }
  return true
}
