// __tests__/resources-db.test.js
import RESOURCES_DB from '../data/resources-db'

describe('RESOURCES_DB structure', () => {
  const EXPECTED_CATEGORIES = ['banques', 'sante', 'immigration', 'credit', 'impots', 'emploi', 'logement', 'universites']

  it('exports an object with all expected categories', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      expect(RESOURCES_DB).toHaveProperty(cat)
      expect(Array.isArray(RESOURCES_DB[cat])).toBe(true)
    })
  })

  it('has no empty categories', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      expect(RESOURCES_DB[cat].length).toBeGreaterThan(0)
    })
  })

  describe.each(EXPECTED_CATEGORIES.filter(c => c !== 'universites'))('%s entries', (category) => {
    it('each entry has name, url, and description', () => {
      RESOURCES_DB[category].forEach((entry, i) => {
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('url')
        expect(entry).toHaveProperty('description')
        expect(typeof entry.name).toBe('string')
        expect(typeof entry.url).toBe('string')
        expect(entry.url).toMatch(/^https?:\/\//)
      })
    })

    it('each entry has a valid province field', () => {
      RESOURCES_DB[category].forEach((entry) => {
        expect(entry).toHaveProperty('province')
        expect(typeof entry.province).toBe('string')
      })
    })
  })

  describe('universites entries', () => {
    it('each entry has name, url, province, and keywords', () => {
      RESOURCES_DB.universites.forEach((entry) => {
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('url')
        expect(entry).toHaveProperty('province')
        expect(entry).toHaveProperty('keywords')
        expect(entry.url).toMatch(/^https?:\/\//)
        expect(Array.isArray(entry.keywords)).toBe(true)
        expect(entry.keywords.length).toBeGreaterThan(0)
      })
    })
  })

  describe('banques', () => {
    it('contains at least one entry for all provinces', () => {
      const allEntries = RESOURCES_DB.banques.filter(b => b.province === 'all')
      expect(allEntries.length).toBeGreaterThan(0)
    })

    it('contains Desjardins for QC', () => {
      const desj = RESOURCES_DB.banques.find(b => b.url.includes('desjardins'))
      expect(desj).toBeDefined()
      expect(desj.province).toBe('QC')
    })
  })

  describe('sante', () => {
    it('has RAMQ for QC', () => {
      const ramq = RESOURCES_DB.sante.find(r => r.url.includes('ramq'))
      expect(ramq).toBeDefined()
      expect(ramq.province).toBe('QC')
    })

    it('has OHIP for ON', () => {
      const ohip = RESOURCES_DB.sante.find(r => r.url.includes('ontario'))
      expect(ohip).toBeDefined()
      expect(ohip.province).toBe('ON')
    })
  })

  describe('immigration', () => {
    it('includes a NAS link', () => {
      const nas = RESOURCES_DB.immigration.find(r => r.url.includes('numero-assurance-sociale'))
      expect(nas).toBeDefined()
    })

    it('includes study permit link', () => {
      const permit = RESOURCES_DB.immigration.find(r => r.url.includes('permis-etudes'))
      expect(permit).toBeDefined()
    })
  })

  describe('emploi', () => {
    it('has national Indeed and Guichet Emplois entries', () => {
      const indeed = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('indeed'))
      const guichet = RESOURCES_DB.emploi.find(e => e.city === 'all' && e.url.includes('guichetemplois'))
      expect(indeed).toBeDefined()
      expect(guichet).toBeDefined()
    })

    it('has city-specific entries for major cities', () => {
      const cities = ['montreal', 'toronto', 'vancouver', 'ottawa', 'calgary']
      cities.forEach(city => {
        const entry = RESOURCES_DB.emploi.find(e => e.city === city)
        expect(entry).toBeDefined()
      })
    })
  })

  describe('logement', () => {
    it('has national entries', () => {
      const national = RESOURCES_DB.logement.filter(l => l.province === 'all')
      expect(national.length).toBeGreaterThan(0)
    })

    it('has city-specific entries', () => {
      const cityEntries = RESOURCES_DB.logement.filter(l => l.city !== null && l.city !== undefined)
      expect(cityEntries.length).toBeGreaterThan(0)
    })
  })

  describe('all URLs are unique within their category', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      it(`${cat} has no duplicate URLs`, () => {
        const urls = RESOURCES_DB[cat].map(e => e.url)
        const uniqueUrls = new Set(urls)
        expect(uniqueUrls.size).toBe(urls.length)
      })
    })
  })
})
