import { NextRequest } from 'next/server'
import { getApiId, getProvider } from '@/lib/api/model-config'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { prompt, modelId, apiKey } = await req.json()

  if (!prompt || !modelId || !apiKey) {
    return Response.json({ error: 'Missing required fields (prompt, modelId, apiKey).' }, { status: 400 })
  }

  const provider = getProvider(modelId)
  const apiId    = getApiId(modelId)

  // ── OpenAI (DALL-E 3 / GPT Image) ──────────────────────────────────────────
  if (provider === 'openai') {
    // Newer gpt-image-* models are not yet GA on the standard images API — fall back to dall-e-3
    const model = (apiId === 'dall-e-3') ? 'dall-e-3' : 'dall-e-3'
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, n: 1, size: '1024x1024' }),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
      return Response.json({ error: data.error?.message ?? 'OpenAI image generation failed.' }, { status: res.status })
    }
    return Response.json({ url: data.data[0].url, revisedPrompt: data.data[0].revised_prompt })
  }

  // ── Stability AI ───────────────────────────────────────────────────────────
  if (provider === 'stability') {
    let endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core'
    const formBody = new FormData()
    formBody.append('prompt', prompt)
    formBody.append('output_format', 'jpeg')

    if (apiId.startsWith('sd3')) {
      endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/sd3'
      formBody.append('model', apiId) // sd3.5-large, sd3.5-large-turbo
    } else if (apiId === 'stable-image-ultra') {
      endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
    }
    // stable-image-core uses the default endpoint

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      body: formBody,
    })
    const data = await res.json()
    if (!res.ok || !data.image) {
      return Response.json({ error: data.errors?.[0] ?? data.message ?? 'Stability AI generation failed.' }, { status: res.status })
    }
    return Response.json({ base64: data.image, mimeType: 'image/jpeg' })
  }

  // ── Google (Gemini image / Imagen) ─────────────────────────────────────────
  if (provider === 'google') {
    if (apiId.startsWith('imagen')) {
      // Imagen 4 via Vertex-style REST
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${apiId}:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1 },
          }),
        }
      )
      const data = await res.json()
      const b64 = data.predictions?.[0]?.bytesBase64Encoded
      if (!b64) return Response.json({ error: data.error?.message ?? 'Imagen generation failed.' }, { status: res.status })
      return Response.json({ base64: b64, mimeType: 'image/png' })
    }

    // Gemini image-preview models (native image output)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${apiId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    )
    const data = await res.json()
    const parts: Array<{ inlineData?: { mimeType: string; data: string } }> =
      data.candidates?.[0]?.content?.parts ?? []
    const imgPart = parts.find(p => p.inlineData)
    if (!imgPart?.inlineData) {
      return Response.json({ error: data.error?.message ?? 'No image returned by Gemini.' }, { status: 400 })
    }
    return Response.json({ base64: imgPart.inlineData.data, mimeType: imgPart.inlineData.mimeType })
  }

  return Response.json({ error: `Image generation is not supported for provider: ${provider}` }, { status: 400 })
}
