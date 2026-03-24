import { NextResponse } from 'next/server';

// Chat-capable model prefixes/patterns to filter by
const OPENAI_CHAT_PREFIXES = ['gpt-4', 'gpt-3.5', 'o1', 'o3', 'o4'];
const ANTHROPIC_CHAT_PREFIXES = ['claude'];
const GEMINI_CHAT_KEYWORDS = ['gemini'];

function isOpenAIChatModel(id: string): boolean {
    return OPENAI_CHAT_PREFIXES.some(p => id.startsWith(p)) && !id.includes('realtime') && !id.includes('audio') && !id.includes('tts') && !id.includes('whisper') && !id.includes('dall-e') && !id.includes('embedding');
}

function isGeminiChatModel(name: string): boolean {
    const lower = name.toLowerCase();
    return GEMINI_CHAT_KEYWORDS.some(k => lower.includes(k)) && !lower.includes('embedding') && !lower.includes('aqa') && !lower.includes('imagen');
}

function prettyModelName(id: string, provider: string): string {
    // Capitalize and clean up model IDs for display
    if (provider === 'gemini') {
        // e.g. "models/gemini-2.5-pro" → "Gemini 2.5 Pro"
        const name = id.replace('models/', '');
        return name
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }
    return id;
}

export async function POST(req: Request) {
    try {
        const { provider, apiKey } = await req.json();

        if (!provider || !apiKey) {
            return NextResponse.json({ models: [], error: 'Provider and API key are required.' }, { status: 400 });
        }

        let models: { id: string; name: string; provider: string }[] = [];

        switch (provider) {
            case 'openai': {
                const res = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                });
                if (!res.ok) {
                    return NextResponse.json({ models: [], error: 'Failed to fetch models. Check your API key.' });
                }
                const data = await res.json();
                models = (data.data || [])
                    .filter((m: any) => isOpenAIChatModel(m.id))
                    .map((m: any) => ({
                        id: m.id,
                        name: m.id,
                        provider: 'OpenAI',
                    }))
                    .sort((a: any, b: any) => a.id.localeCompare(b.id));
                break;
            }

            case 'anthropic': {
                const res = await fetch('https://api.anthropic.com/v1/models', {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                    },
                });
                if (!res.ok) {
                    return NextResponse.json({ models: [], error: 'Failed to fetch models. Check your API key.' });
                }
                const data = await res.json();
                models = (data.data || [])
                    .filter((m: any) => ANTHROPIC_CHAT_PREFIXES.some(p => m.id.startsWith(p)))
                    .map((m: any) => ({
                        id: m.id,
                        name: m.display_name || m.id,
                        provider: 'Anthropic',
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                break;
            }

            case 'gemini': {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                if (!res.ok) {
                    return NextResponse.json({ models: [], error: 'Failed to fetch models. Check your API key.' });
                }
                const data = await res.json();
                models = (data.models || [])
                    .filter((m: any) => isGeminiChatModel(m.name || '') && m.supportedGenerationMethods?.includes('generateContent'))
                    .map((m: any) => {
                        const id = (m.name || '').replace('models/', '');
                        return {
                            id,
                            name: m.displayName || prettyModelName(m.name || '', 'gemini'),
                            provider: 'Google',
                        };
                    })
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                break;
            }

            case 'sarvam': {
                models = [
                    { id: 'sarvam-30b', name: 'Sarvam-30B', provider: 'Sarvam AI' },
                    { id: 'sarvam-105b', name: 'Sarvam-105B', provider: 'Sarvam AI' },
                    { id: 'sarvam-m', name: 'Sarvam-M', provider: 'Sarvam AI' }
                ];
                break;
            }

            default:
                return NextResponse.json({ models: [], error: 'Unknown provider.' }, { status: 400 });
        }

        return NextResponse.json({ models });
    } catch (err: any) {
        return NextResponse.json({ models: [], error: err.message || 'Network error.' }, { status: 500 });
    }
}
