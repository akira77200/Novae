// __tests__/api-handlers.test.js — API route handler tests with mocked Supabase

// ── Mock Supabase before importing handlers ──────────────────────
const mockSingle = jest.fn()
const mockSelect = jest.fn(() => ({ single: mockSingle }))
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockOrder  = jest.fn()
const mockEq     = jest.fn(() => ({ order: mockOrder }))
const mockFrom   = jest.fn(() => ({
  select: jest.fn(() => ({ eq: mockEq, single: mockSingle })),
  insert: mockInsert,
  upsert: jest.fn(() => ({ select: mockSelect })),
}))
const mockGetUser = jest.fn()
const mockCreateClient = jest.fn(() => ({
  from: mockFrom,
  auth: { getUser: mockGetUser },
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => mockCreateClient(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────
function createMockRes() {
  const res = {}
  res.status = jest.fn(() => res)
  res.json   = jest.fn(() => res)
  res.end    = jest.fn(() => res)
  return res
}

function createMockReq(overrides = {}) {
  return {
    method: 'POST',
    headers: {},
    body: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  }
}

// ── bug-report handler ───────────────────────────────────────────
describe('pages/api/bug-report', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/bug-report')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects non-POST methods with 405', async () => {
    const req = createMockReq({ method: 'GET' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.end).toHaveBeenCalled()
  })

  it('rejects empty description with 400', async () => {
    const req = createMockReq({ body: { description: '' } })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Description requise' })
  })

  it('rejects missing description with 400', async () => {
    const req = createMockReq({ body: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 200 on successful insert', async () => {
    mockInsert.mockReturnValueOnce({ error: null })
    const req = createMockReq({
      body: { email: 'test@test.com', page: '/dashboard', description: 'Bug found' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('returns 500 on Supabase error', async () => {
    mockInsert.mockReturnValueOnce({ error: { message: 'DB error' } })
    const req = createMockReq({
      body: { description: 'Bug found' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})

// ── echeances handler ────────────────────────────────────────────
describe('pages/api/echeances/index', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/echeances/index')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects requests without auth token with 401', async () => {
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects invalid token with 401', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'bad' } })
    const req = createMockReq({ headers: { authorization: 'Bearer bad-token' } })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects unsupported methods with 405', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'DELETE',
      headers: { authorization: 'Bearer valid' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects POST missing titre with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'POST',
      headers: { authorization: 'Bearer valid' },
      body: { date_echeance: '2025-01-01' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects POST missing date_echeance with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'POST',
      headers: { authorization: 'Bearer valid' },
      body: { titre: 'Test' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

// ── documents handler ────────────────────────────────────────────
describe('pages/api/documents/index', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/documents/index')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects requests without auth token with 401', async () => {
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects unsupported methods with 405', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'PATCH',
      headers: { authorization: 'Bearer valid' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects POST missing nom with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'POST',
      headers: { authorization: 'Bearer valid' },
      body: { type: 'passport' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects POST missing type with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      method: 'POST',
      headers: { authorization: 'Bearer valid' },
      body: { nom: 'Passport' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

// ── quiz/sauvegarder handler ─────────────────────────────────────
describe('pages/api/quiz/sauvegarder', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/quiz/sauvegarder')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects non-POST methods with 405', async () => {
    const req = createMockReq({ method: 'GET' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects requests without auth token with 401', async () => {
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects missing categorie with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: { score: 5, total: 10 },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects missing total with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: { categorie: 'culture', score: 5 },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

// ── parrainages/demander handler ─────────────────────────────────
describe('pages/api/parrainages/demander', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/parrainages/demander')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects non-POST methods with 405', async () => {
    const req = createMockReq({ method: 'GET' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects requests without auth token with 401', async () => {
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects missing parrain_id with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: {},
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects self-sponsorship with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: { parrain_id: 'u1' },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('toi-même') })
    )
  })
})

// ── parrainages/devenir handler ──────────────────────────────────
describe('pages/api/parrainages/devenir', () => {
  let handler
  beforeAll(async () => {
    handler = (await import('../pages/api/parrainages/devenir')).default
  })

  beforeEach(() => jest.clearAllMocks())

  it('rejects non-POST methods with 405', async () => {
    const req = createMockReq({ method: 'GET' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects requests without auth token with 401', async () => {
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects empty sujets with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: { sujets: [] },
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects missing sujets with 400', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const req = createMockReq({
      headers: { authorization: 'Bearer valid' },
      body: {},
    })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
