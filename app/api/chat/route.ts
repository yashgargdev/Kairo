import { NextRequest } from 'next/server'
import { getApiId } from '@/lib/api/model-config'

export const runtime = 'edge'

// Normalised SSE format we stream to the client:
//   data: {"delta":"text"}\n\n
//   data: [DONE]\n\n
//   data: {"error":"message"}\n\n

function encode(obj: unknown) {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`)
}

const DONE = new TextEncoder().encode('data: [DONE]\n\n')

function errorStream(message: string) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  writer.write(encode({ error: message }))
  writer.write(DONE)
  writer.close()
  return readable
}

// ── OpenAI-compatible stream → normalised ──────────────────────────────────────
// Covers: OpenAI, Groq, Mistral, OpenRouter, Sarvam
async function proxyOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  extraHeaders: Record<string, string> = {},
  maxTokens = 4096
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens }),
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = `${res.status} ${res.statusText}`
    try { msg = JSON.parse(text).error?.message ?? msg } catch { /* */ }
    return errorStream(msg)
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const decoder = new TextDecoder()

  ;(async () => {
    const reader = res.body!.getReader()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) await writer.write(encode({ delta }))
        } catch { /* malformed line */ }
      }
    }
    await writer.write(DONE)
    await writer.close()
  })()

  return readable
}

// ── Anthropic stream → normalised ─────────────────────────────────────────────
async function proxyAnthropic(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  maxTokens = 8096
): Promise<ReadableStream<Uint8Array>> {
  const system = messages.find(m => m.role === 'system')?.content
  const chat = messages.filter(m => m.role !== 'system')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: chat,
      ...(system ? { system } : {}),
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = `${res.status} ${res.statusText}`
    try { msg = JSON.parse(text).error?.message ?? msg } catch { /* */ }
    return errorStream(msg)
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const decoder = new TextDecoder()

  ;(async () => {
    const reader = res.body!.getReader()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
            await writer.write(encode({ delta: json.delta.text }))
          }
        } catch { /* */ }
      }
    }
    await writer.write(DONE)
    await writer.close()
  })()

  return readable
}

// ── Google Gemini stream → normalised ─────────────────────────────────────────
async function proxyGoogle(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const geminiModel = model.replace('gemini-', 'gemini-').replace('gemini-flash', 'gemini-1.5-flash')
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = `${res.status} ${res.statusText}`
    try { msg = JSON.parse(text).error?.message ?? msg } catch { /* */ }
    return errorStream(msg)
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const decoder = new TextDecoder()

  ;(async () => {
    const reader = res.body!.getReader()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) await writer.write(encode({ delta: text }))
        } catch { /* */ }
      }
    }
    await writer.write(DONE)
    await writer.close()
  })()

  return readable
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey, provider, maxTokens } = await req.json() as {
      messages: { role: string; content: string }[]
      model: string
      apiKey: string
      provider: string
      maxTokens?: number
    }

    if (!apiKey?.trim()) {
      return new Response(
        JSON.stringify({ error: 'No API key provided. Add your key in Settings.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Translate routing model ID → real API model ID
    const apiModel = getApiId(model)

    let stream: ReadableStream<Uint8Array>

    switch (provider) {
      case 'openai':
        stream = await proxyOpenAICompatible(
          'https://api.openai.com/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens
        )
        break
      case 'anthropic':
        stream = await proxyAnthropic(apiKey, apiModel, messages, maxTokens)
        break
      case 'google':
        stream = await proxyGoogle(apiKey, apiModel, messages)
        break
      case 'groq':
        stream = await proxyOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens
        )
        break
      case 'mistral':
        stream = await proxyOpenAICompatible(
          'https://api.mistral.ai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens
        )
        break
      case 'openrouter':
        stream = await proxyOpenAICompatible(
          'https://openrouter.ai/api/v1/chat/completions',
          apiKey, apiModel, messages,
          { 'HTTP-Referer': 'https://kairo.app', 'X-Title': 'Kairo' },
          maxTokens
        )
        break
      case 'sarvam':
        stream = await proxyOpenAICompatible(
          'https://api.sarvam.ai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens
        )
        break
      default:
        return new Response(
          JSON.stringify({ error: `Unknown provider: ${provider}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
