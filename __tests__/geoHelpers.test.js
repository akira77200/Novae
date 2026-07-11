// __tests__/geoHelpers.test.js
import { getProvince, getCity, selectResources } from '../lib/geoHelpers'

// ── getProvince ───────────────────────────────────────────────────
describe('getProvince', () => {
  it('returns null for null/undefined/empty input', () => {
    expect(getProvince(null)).toBeNull()
    expect(getProvince(undefined)).toBeNull()
    expect(getProvince('')).toBeNull()
  })

  it('detects Quebec cities', () => {
    expect(getProvince('Montréal')).toBe('QC')
    expect(getProvince('montreal')).toBe('QC')
    expect(getProvince('Québec City')).toBe('QC')
    expect(getProvince('Gatineau')).toBe('QC')
    expect(getProvince('Sherbrooke')).toBe('QC')
    expect(getProvince('Laval')).toBe('QC')
    expect(getProvince('Longueuil')).toBe('QC')
    expect(getProvince('Saguenay')).toBe('QC')
    expect(getProvince('Trois-Rivières')).toBe('QC')
    expect(getProvince('Brossard')).toBe('QC')
    expect(getProvince('Rimouski')).toBe('QC')
  })

  it('detects Ontario cities', () => {
    expect(getProvince('Ottawa')).toBe('ON')
    expect(getProvince('Toronto')).toBe('ON')
    expect(getProvince('Hamilton')).toBe('ON')
    expect(getProvince('London, ON')).toBe('ON')
    expect(getProvince('Windsor')).toBe('ON')
    expect(getProvince('Kingston')).toBe('ON')
    expect(getProvince('Waterloo')).toBe('ON')
    expect(getProvince('Mississauga')).toBe('ON')
    expect(getProvince('Brampton')).toBe('ON')
    expect(getProvince('Markham')).toBe('ON')
    expect(getProvince('Vaughan')).toBe('ON')
    expect(getProvince('Barrie')).toBe('ON')
    expect(getProvince('Sudbury')).toBe('ON')
  })

  it('detects British Columbia cities', () => {
    expect(getProvince('Vancouver')).toBe('BC')
    expect(getProvince('Victoria')).toBe('BC')
    expect(getProvince('Burnaby')).toBe('BC')
    expect(getProvince('Surrey')).toBe('BC')
    expect(getProvince('Richmond')).toBe('BC')
    expect(getProvince('Kelowna')).toBe('BC')
    expect(getProvince('Abbotsford')).toBe('BC')
    expect(getProvince('Nanaimo')).toBe('BC')
  })

  it('detects Alberta cities', () => {
    expect(getProvince('Calgary')).toBe('AB')
    expect(getProvince('Edmonton')).toBe('AB')
  })

  it('detects Manitoba cities', () => {
    expect(getProvince('Winnipeg')).toBe('MB')
  })

  it('detects Saskatchewan cities', () => {
    expect(getProvince('Saskatoon')).toBe('SK')
    expect(getProvince('Regina')).toBe('SK')
  })

  it('detects Nova Scotia cities', () => {
    expect(getProvince('Halifax')).toBe('NS')
  })

  it('detects New Brunswick cities', () => {
    expect(getProvince('Moncton')).toBe('NB')
    expect(getProvince('Fredericton')).toBe('NB')
    expect(getProvince('Saint John')).toBe('NB')
  })

  it('is case-insensitive', () => {
    expect(getProvince('VANCOUVER')).toBe('BC')
    expect(getProvince('TORONTO')).toBe('ON')
  })

  it('returns null for unknown cities', () => {
    expect(getProvince('Mars')).toBeNull()
    expect(getProvince('Paris')).toBeNull()
  })
})

// ── getCity ───────────────────────────────────────────────────────
describe('getCity', () => {
  it('returns null for null/undefined/empty input', () => {
    expect(getCity(null)).toBeNull()
    expect(getCity(undefined)).toBeNull()
    expect(getCity('')).toBeNull()
  })

  it('normalizes Montreal variants', () => {
    expect(getCity('Montréal')).toBe('montreal')
    expect(getCity('Montreal')).toBe('montreal')
    expect(getCity('montreal, QC')).toBe('montreal')
  })

  it('normalizes Quebec variants', () => {
    expect(getCity('Québec')).toBe('quebec')
    expect(getCity('Quebec City')).toBe('quebec')
  })

  it('normalizes other known cities', () => {
    expect(getCity('Ottawa')).toBe('ottawa')
    expect(getCity('Toronto')).toBe('toronto')
    expect(getCity('Vancouver')).toBe('vancouver')
    expect(getCity('Calgary')).toBe('calgary')
    expect(getCity('Edmonton')).toBe('edmonton')
    expect(getCity('Winnipeg')).toBe('winnipeg')
  })

  it('is case-insensitive', () => {
    expect(getCity('TORONTO')).toBe('toronto')
    expect(getCity('MONTRÉAL')).toBe('montreal')
  })

  it('returns null for unknown cities', () => {
    expect(getCity('Halifax')).toBeNull()
    expect(getCity('Saskatoon')).toBeNull()
    expect(getCity('Berlin')).toBeNull()
  })
})

// ── selectResources ──────────────────────────────────────────────
describe('selectResources', () => {
  it('returns an array of at most 5 resources', () => {
    const result = selectResources({ ville_accueil: 'Montréal', universite: 'McGill' })
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('returns resources with required fields (name, url, emoji)', () => {
    const result = selectResources({ ville_accueil: 'Toronto' })
    result.forEach(r => {
      expect(r).toHaveProperty('name')
      expect(r).toHaveProperty('url')
      expect(r).toHaveProperty('emoji')
    })
  })

  it('returns Desjardins for QC profiles', () => {
    const result = selectResources({ ville_accueil: 'Montréal' })
    const banque = result.find(r => r.url && r.url.includes('desjardins'))
    expect(banque).toBeDefined()
  })

  it('returns TD for non-QC profiles', () => {
    const result = selectResources({ ville_accueil: 'Toronto' })
    const banque = result.find(r => r.url && r.url.includes('td.com'))
    expect(banque).toBeDefined()
  })

  it('includes health resource matching province', () => {
    const result = selectResources({ ville_accueil: 'Montréal' })
    const sante = result.find(r => r.url && r.url.includes('ramq'))
    expect(sante).toBeDefined()
  })

  it('includes NAS resource (universal)', () => {
    const result = selectResources({ ville_accueil: 'Vancouver' })
    const nas = result.find(r => r.url && r.url.includes('numero-assurance-sociale'))
    expect(nas).toBeDefined()
  })

  it('matches university by keyword', () => {
    const result = selectResources({ ville_accueil: 'Montréal', universite: 'McGill University' })
    const univ = result.find(r => r.name === 'McGill')
    expect(univ).toBeDefined()
    expect(univ.url).toContain('mcgill.ca')
  })

  it('falls back to province university when no keyword match', () => {
    const result = selectResources({ ville_accueil: 'Calgary', universite: '' })
    const univ = result.find(r => r.emoji === '🎓')
    expect(univ).toBeDefined()
    expect(univ.name).toBe('University of Calgary')
  })

  it('includes city-specific Indeed link when city is known', () => {
    const result = selectResources({ ville_accueil: 'Toronto' })
    const indeed = result.find(r => r.url && r.url.includes('indeed') && r.url.includes('Toronto'))
    expect(indeed).toBeDefined()
  })

  it('falls back to national Indeed when city is unknown', () => {
    const result = selectResources({ ville_accueil: 'Some Unknown Place' })
    const indeed = result.find(r => r.url && r.url.includes('indeed'))
    // Should get national indeed (ca.indeed.com without city filter)
    expect(indeed).toBeDefined()
  })

  it('handles empty profile gracefully', () => {
    const result = selectResources({})
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0) // NAS + national indeed + guichet + logement
  })

  it('includes housing resource for unknown city (fewer priority items)', () => {
    // Unknown city => no province-specific health/univ/bank, so housing fits in the 5-item cap
    const result = selectResources({})
    const housing = result.find(r => r.emoji === '🏠')
    expect(housing).toBeDefined()
  })

  it('caps results at 5 even when more resources are available', () => {
    const result = selectResources({ ville_accueil: 'Vancouver', universite: 'UBC' })
    expect(result.length).toBe(5)
  })
})
