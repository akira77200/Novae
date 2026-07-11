// __tests__/apiGuards.test.js
import { checkRateLimit, getIP, checkMessageLength } from '../lib/apiGuards'

// ── checkRateLimit ────────────────────────────────────────────────
describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset the internal Map between tests by using unique IPs
  })

  it('allows the first request from a new IP', () => {
    expect(checkRateLimit('10.0.0.1')).toBe(true)
  })

  it('allows up to maxRequests from the same IP', () => {
    const ip = '10.0.0.2'
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(ip)).toBe(true)
    }
  })

  it('blocks once maxRequests is exceeded', () => {
    const ip = '10.0.0.3'
    for (let i = 0; i < 20; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip)).toBe(false)
  })

  it('respects a custom maxRequests', () => {
    const ip = '10.0.0.4'
    for (let i = 0; i < 3; i++) checkRateLimit(ip, 3)
    expect(checkRateLimit(ip, 3)).toBe(false)
  })

  it('treats different IPs independently', () => {
    const ipA = '10.0.0.5'
    const ipB = '10.0.0.6'
    for (let i = 0; i < 20; i++) checkRateLimit(ipA)
    expect(checkRateLimit(ipA)).toBe(false)
    expect(checkRateLimit(ipB)).toBe(true)
  })

  it('resets after the time window expires', () => {
    const ip = '10.0.0.7'
    for (let i = 0; i < 20; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip)).toBe(false)

    // Simulate time passing by manipulating Date.now
    const realNow = Date.now
    Date.now = () => realNow() + 60 * 60 * 1000 + 1
    expect(checkRateLimit(ip)).toBe(true)
    Date.now = realNow
  })
})

// ── getIP ─────────────────────────────────────────────────────────
describe('getIP', () => {
  it('returns x-forwarded-for header (first value)', () => {
    const req = {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      socket: { remoteAddress: '127.0.0.1' },
    }
    expect(getIP(req)).toBe('1.2.3.4')
  })

  it('trims whitespace from forwarded IP', () => {
    const req = {
      headers: { 'x-forwarded-for': '  9.8.7.6 , 1.1.1.1' },
      socket: { remoteAddress: '127.0.0.1' },
    }
    expect(getIP(req)).toBe('9.8.7.6')
  })

  it('falls back to socket.remoteAddress when no x-forwarded-for', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '192.168.1.1' },
    }
    expect(getIP(req)).toBe('192.168.1.1')
  })

  it('returns "unknown" when no IP info is available', () => {
    const req = { headers: {}, socket: {} }
    expect(getIP(req)).toBe('unknown')
  })

  it('handles missing socket gracefully', () => {
    const req = { headers: {} }
    expect(getIP(req)).toBe('unknown')
  })
})

// ── checkMessageLength ────────────────────────────────────────────
describe('checkMessageLength', () => {
  it('returns true for empty messages array', () => {
    expect(checkMessageLength([])).toBe(true)
  })

  it('returns true when last message content is within limit', () => {
    const msgs = [{ content: 'Hello' }]
    expect(checkMessageLength(msgs)).toBe(true)
  })

  it('returns true when last message content equals limit exactly', () => {
    const msgs = [{ content: 'a'.repeat(500) }]
    expect(checkMessageLength(msgs)).toBe(true)
  })

  it('returns false when last message content exceeds limit', () => {
    const msgs = [{ content: 'a'.repeat(501) }]
    expect(checkMessageLength(msgs)).toBe(false)
  })

  it('respects a custom max length', () => {
    const msgs = [{ content: 'a'.repeat(11) }]
    expect(checkMessageLength(msgs, 10)).toBe(false)
    expect(checkMessageLength(msgs, 11)).toBe(true)
  })

  it('returns true when last message has no content', () => {
    const msgs = [{ role: 'user' }]
    expect(checkMessageLength(msgs)).toBe(true)
  })

  it('returns true for null/undefined input', () => {
    expect(checkMessageLength(null)).toBe(true)
    expect(checkMessageLength(undefined)).toBe(true)
  })

  it('only checks the last message', () => {
    const msgs = [
      { content: 'a'.repeat(1000) },
      { content: 'short' },
    ]
    expect(checkMessageLength(msgs)).toBe(true)
  })
})
