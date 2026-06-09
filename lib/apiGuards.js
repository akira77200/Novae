// lib/apiGuards.js — Protections communes pour les APIs IA
import { createClient } from '@supabase/supabase-js'

// ── Rate limiting en mémoire (par IP, 20 req/heure) ──────────────
const rateLimitMap = new Map()

export function checkRateLimit(ip, maxRequests = 20) {
  const now       = Date.now()
  const windowMs  = 60 * 60 * 1000 // 1 heure

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  const data = rateLimitMap.get(ip)

  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (data.count >= maxRequests) return false

  data.count++
  return true
}

export function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

// ── Vérification token Supabase ───────────────────────────────────
export async function requireAuth(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, user: null, error: 'Connexion requise.' }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || token === 'undefined' || token === 'null' || token === '') {
    return { ok: false, user: null, error: 'Session expirée. Reconnecte-toi.' }
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error } = await sb.auth.getUser(token)
  if (error || !user) {
    return { ok: false, user: null, error: 'Session expirée. Reconnecte-toi.' }
  }
  return { ok: true, user, error: null }
}

// ── Vérification longueur message ────────────────────────────────
export function checkMessageLength(messages, max = 500) {
  const last = messages?.[messages.length - 1]
  return !last?.content || last.content.length <= max
}
