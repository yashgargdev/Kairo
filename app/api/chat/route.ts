import { NextRequest } from 'next/server'
import { getApiId } from '@/lib/api/model-config'

export const runtime = 'nodejs'
export const maxDuration = 60

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

type MsgImage = { mimeType: string; data: string }
type ApiMsg = { role: string; content: string; images?: MsgImage[] }

// Convert to OpenAI multimodal format (vision-capable providers: openai, openrouter)
function toOpenAIVisionMessages(messages: ApiMsg[]) {
  return messages.map(m => {
    if (!m.images?.length) return { role: m.role, content: m.content || ' ' }
    const content: unknown[] = []
    if (m.content) content.push({ type: 'text', text: m.content })
    for (const img of m.images) {
      content.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.data}` } })
    }
    return { role: m.role, content }
  })
}

// Convert to text-only format (non-vision providers: groq, mistral, sarvam)
// Images are stripped; a note is appended to the text instead
function toTextOnlyMessages(messages: ApiMsg[]) {
  return messages.map(m => {
    let content = m.content || ''
    if (m.images?.length) {
      const note = `[${m.images.length} image${m.images.length > 1 ? 's' : ''} attached]`
      content = content ? `${content}\n${note}` : note
    }
    return { role: m.role, content: content || ' ' }
  })
}

// ── OpenAI-compatible stream → normalised ──────────────────────────────────────
async function proxyOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: ApiMsg[],
  extraHeaders: Record<string, string> = {},
  maxTokens = 4096,
  supportsVision = false
): Promise<ReadableStream<Uint8Array>> {
  const formatted = supportsVision
    ? toOpenAIVisionMessages(messages)
    : toTextOnlyMessages(messages)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({ model, messages: formatted, stream: true, max_tokens: maxTokens }),
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
  messages: ApiMsg[],
  maxTokens = 8096
): Promise<ReadableStream<Uint8Array>> {
  const system = messages.find(m => m.role === 'system')?.content
  const chat = messages.filter(m => m.role !== 'system').map(m => {
    if (!m.images?.length) return { role: m.role, content: m.content }
    const content: unknown[] = []
    for (const img of m.images) {
      content.push({ type: 'image', source: { type: 'base64', media_type: img.mimeType, data: img.data } })
    }
    if (m.content) content.push({ type: 'text', text: m.content })
    return { role: m.role, content }
  })

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
  messages: ApiMsg[]
): Promise<ReadableStream<Uint8Array>> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const parts: unknown[] = []
      if (m.content?.trim()) parts.push({ text: m.content })
      for (const img of m.images ?? []) {
        parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
      }
      // Google rejects empty parts — ensure at least one part
      if (parts.length === 0) parts.push({ text: ' ' })
      return { role: m.role === 'assistant' ? 'model' : 'user', parts }
    })
    .filter((_, i, arr) => {
      // Google doesn't allow consecutive same-role turns — deduplicate
      if (i === 0) return true
      return arr[i].role !== arr[i - 1].role
    })

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
    const { messages, model, provider, maxTokens } = await req.json() as {
      messages: ApiMsg[]
      model: string
      provider: string
      maxTokens?: number
    }

    // Read API key from httpOnly cookie — never exposed in request bodies
    const apiKey = req.cookies.get(`kairo_key_${provider}`)?.value ?? ''

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No API key found. Add your key in Settings.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Translate routing model ID → real API model ID
    const apiModel = getApiId(model)

    let stream: ReadableStream<Uint8Array>

    switch (provider) {
      case 'openai':
        // OpenAI supports vision (image_url array content)
        stream = await proxyOpenAICompatible(
          'https://api.openai.com/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens, true
        )
        break
      case 'anthropic':
        stream = await proxyAnthropic(apiKey, apiModel, messages, maxTokens)
        break
      case 'google':
        stream = await proxyGoogle(apiKey, apiModel, messages)
        break
      case 'groq':
        // Groq requires content as a plain string — strip images
        stream = await proxyOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens, false
        )
        break
      case 'mistral':
        // Mistral requires content as a plain string — strip images
        stream = await proxyOpenAICompatible(
          'https://api.mistral.ai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens, false
        )
        break
      case 'openrouter':
        // OpenRouter passes vision through to underlying models
        stream = await proxyOpenAICompatible(
          'https://openrouter.ai/api/v1/chat/completions',
          apiKey, apiModel, messages,
          { 'HTTP-Referer': 'https://kairo.app', 'X-Title': 'Kairo' },
          maxTokens, true
        )
        break
      case 'sarvam':
        // Sarvam requires content as a plain string — strip images
        stream = await proxyOpenAICompatible(
          'https://api.sarvam.ai/v1/chat/completions',
          apiKey, apiModel, messages, {}, maxTokens, false
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
