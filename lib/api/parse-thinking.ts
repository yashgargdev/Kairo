export interface ParsedResponse {
  thinkContent: string       // raw text inside <think>…</think>
  thinkingDone: boolean      // false = </think> not yet arrived
  mainContent: string        // everything after </think>
  hasThink: boolean
}

/**
 * Parses a (possibly partial) streamed response that may contain
 * a leading <think>…</think> block.
 */
export function parseThinking(raw: string): ParsedResponse {
  const startTag = '<think>'
  const endTag   = '</think>'

  const start = raw.indexOf(startTag)

  if (start === -1) {
    // No think block at all
    return { hasThink: false, thinkContent: '', thinkingDone: true, mainContent: raw }
  }

  const end = raw.indexOf(endTag, start)

  if (end === -1) {
    // <think> opened but </think> hasn't arrived yet — still streaming
    const thinkContent = raw.slice(start + startTag.length)
    return { hasThink: true, thinkContent, thinkingDone: false, mainContent: '' }
  }

  // Both tags present — thinking is complete
  const thinkContent = raw.slice(start + startTag.length, end)
  const mainContent  = raw.slice(end + endTag.length).replace(/^\n+/, '') // strip leading newlines
  return { hasThink: true, thinkContent, thinkingDone: true, mainContent }
}
