export interface ChatMessageImage {
  mimeType: string
  data: string  // base64 without prefix
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: ChatMessageImage[]
}

export interface StreamCallbacks {
  onDelta: (text: string) => void
  onDone: () => void
  onError: (err: string) => void
}

export async function streamChat(
  messages: ChatMessage[],
  model: string,
  provider: string,
  callbacks: StreamCallbacks
): Promise<void> {
  let res: Response
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 280_000) // 280s — just under Vercel's 300s limit
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, provider }),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeout)
    if (e instanceof DOMException && e.name === 'AbortError') {
      callbacks.onError('Request timed out — the model took too long to respond. Try a shorter message or a faster model.')
    } else {
      callbacks.onError('Network error — could not reach the server.')
    }
    return
  }

  clearTimeout(timeout)

  // Non-streaming error (401, 400, 500 etc.)
  if (!res.ok || res.headers.get('Content-Type')?.includes('application/json')) {
    try {
      const json = await res.json()
      callbacks.onError(json.error ?? `HTTP ${res.status}`)
    } catch {
      callbacks.onError(`HTTP ${res.status} ${res.statusText}`)
    }
    return
  }

  const reader = res.body?.getReader()
  if (!reader) { callbacks.onError('No response body'); return }

  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const payload = trimmed.slice(6)
      if (payload === '[DONE]') { callbacks.onDone(); return }
      try {
        const json = JSON.parse(payload)
        if (json.error) { callbacks.onError(json.error); return }
        if (json.delta) callbacks.onDelta(json.delta)
      } catch { /* skip bad line */ }
    }
  }

  callbacks.onDone()
}
