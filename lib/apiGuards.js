// lib/apiGuards.js — Protections communes pour les APIs IA
import { createClient } from '@supabase/supabase-js'

// ── Rate limiting en mémoire (par IP, 20 req/heure) ──────────────
const rateLimitMap = new Map()

export function checkRateLimit(ip, maxRequests = 20) {
  const now      = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 heure

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

export function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

// ── Vérification token Supabase ───────────────────────────────────
export async function requireAuth(req) {
  try {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization']

    if (!authHeader) {
      return { ok: false, user: null, error: 'Connexion requise.', code: 'NO_HEADER' }
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return { ok: false, user: null, error: 'Format token invalide.', code: 'INVALID_FORMAT' }
    }

    const token = parts[1]

    if (!token || token === 'undefined' || token === 'null' || token.length < 20) {
      return { ok: false, user: null, error: 'Token invalide.', code: 'INVALID_TOKEN' }
    }

    // Client serveur sans autoRefresh pour éviter l'invalidation du token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession:   false,
        },
      }
    )

    const { data, error } = await supabase.auth.getUser(token)

    if (error) {
      return {
        ok:      false,
        user:    null,
        error:   'Session expirée. Reconnecte-toi.',
        code:    'SUPABASE_ERROR',
        details: error.message,
      }
    }

    if (!data?.user) {
      return { ok: false, user: null, error: 'Utilisateur non trouvé.', code: 'NO_USER' }
    }

    return { ok: true, user: data.user, error: null }
  } catch (err) {
    return {
      ok:      false,
      user:    null,
      error:   'Erreur serveur.',
      code:    'SERVER_ERROR',
      details: err.message,
    }
  }
}

// ── Vérification longueur message ────────────────────────────────
export function checkMessageLength(messages, max = 500) {
  const last = messages?.[messages.length - 1]
  return !last?.content || last.content.length <= max
}
