import { NextRequest, NextResponse } from 'next/server'

const COOKIE_PREFIX = 'kairo_key_'
const PROVIDERS = ['openai', 'anthropic', 'google', 'groq', 'mistral', 'openrouter', 'sarvam', 'stability'] as const

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
}

// GET /api/keys — returns which providers have a key set (never returns the actual key)
export async function GET(req: NextRequest) {
  const status = Object.fromEntries(
    PROVIDERS.map(p => [p, !!req.cookies.get(`${COOKIE_PREFIX}${p}`)?.value])
  )
  return NextResponse.json(status)
}

// POST /api/keys — save key for a provider in an httpOnly cookie
export async function POST(req: NextRequest) {
  const { provider, key } = await req.json() as { provider: string; key: string }
  if (!provider || !key?.trim()) {
    return NextResponse.json({ error: 'Missing provider or key' }, { status: 400 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(`${COOKIE_PREFIX}${provider}`, key.trim(), COOKIE_OPTS)
  return res
}

// DELETE /api/keys — remove a provider's key, or all keys if { all: true }
export async function DELETE(req: NextRequest) {
  const { provider, all } = await req.json() as { provider?: string; all?: boolean }
  const res = NextResponse.json({ ok: true })
  const clear = { ...COOKIE_OPTS, maxAge: 0 }
  if (all) {
    for (const p of PROVIDERS) res.cookies.set(`${COOKIE_PREFIX}${p}`, '', clear)
  } else if (provider) {
    res.cookies.set(`${COOKIE_PREFIX}${provider}`, '', clear)
  }
  return res
}
