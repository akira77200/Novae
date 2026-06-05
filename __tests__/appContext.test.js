// __tests__/appContext.test.js — Tests for PALETTE and T (translations)

// Mock Supabase before importing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })) },
    from: jest.fn(),
  })),
}))

import { PALETTE, T } from '../context/AppContext'

// ── PALETTE ──────────────────────────────────────────────────────
describe('PALETTE', () => {
  it('has dark and light themes', () => {
    expect(PALETTE).toHaveProperty('dark')
    expect(PALETTE).toHaveProperty('light')
  })

  const EXPECTED_KEYS = [
    'bg', 'bg2', 'surface', 'surface2',
    'accent', 'accent2', 'rose',
    'text', 'text2', 'muted', 'muted2',
    'border', 'border2',
    'error', 'warning', 'success',
  ]

  it.each(['dark', 'light'])('%s theme has all expected color keys', (theme) => {
    EXPECTED_KEYS.forEach(key => {
      expect(PALETTE[theme]).toHaveProperty(key)
      expect(typeof PALETTE[theme][key]).toBe('string')
    })
  })

  it('dark and light themes have the same keys', () => {
    const darkKeys  = Object.keys(PALETTE.dark).sort()
    const lightKeys = Object.keys(PALETTE.light).sort()
    expect(darkKeys).toEqual(lightKeys)
  })

  it('accent colors are consistent across themes', () => {
    expect(PALETTE.dark.accent).toBe(PALETTE.light.accent)
    expect(PALETTE.dark.accent2).toBe(PALETTE.light.accent2)
  })
})

// ── Translations T ────────────────────────────────────────────────
describe('T (translations)', () => {
  it('has fr and en locales', () => {
    expect(T).toHaveProperty('fr')
    expect(T).toHaveProperty('en')
  })

  it('fr and en have exactly the same keys', () => {
    const frKeys = Object.keys(T.fr).sort()
    const enKeys = Object.keys(T.en).sort()
    expect(frKeys).toEqual(enKeys)
  })

  it('no translation value is empty', () => {
    Object.entries(T.fr).forEach(([key, val]) => {
      expect(val).toBeTruthy()
      expect(typeof val).toBe('string')
    })
    Object.entries(T.en).forEach(([key, val]) => {
      expect(val).toBeTruthy()
      expect(typeof val).toBe('string')
    })
  })

  it('app_name is the same in both locales', () => {
    expect(T.fr.app_name).toBe('Novae')
    expect(T.en.app_name).toBe('Novae')
  })

  const CORE_KEYS = [
    'nav_home', 'nav_login', 'nav_register', 'nav_logout',
    'loading', 'save', 'cancel', 'close', 'back', 'continue',
    'error_generic', 'login_title', 'login_btn',
    'register_title', 'register_btn',
    'dash_welcome', 'dash_progress',
  ]

  it('contains all core navigation and UI keys', () => {
    CORE_KEYS.forEach(key => {
      expect(T.fr).toHaveProperty(key)
      expect(T.en).toHaveProperty(key)
    })
  })

  it('fr locale uses French text for login_btn', () => {
    expect(T.fr.login_btn).toBe('Se connecter')
  })

  it('en locale uses English text for login_btn', () => {
    expect(T.en.login_btn).toBe('Sign in')
  })
})
