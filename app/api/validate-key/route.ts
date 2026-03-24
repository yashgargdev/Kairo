import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { provider, apiKey } = await req.json();

        if (!provider || !apiKey) {
            return NextResponse.json({ valid: false, error: 'Provider and API key are required.' }, { status: 400 });
        }

        let valid = false;
        let error = '';

        switch (provider) {
            case 'openai': {
                const res = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                });
                if (res.ok) {
                    valid = true;
                } else {
                    const data = await res.json().catch(() => ({}));
                    error = data?.error?.message || `Invalid API key (HTTP ${res.status})`;
                }
                break;
            }

            case 'anthropic': {
                const res = await fetch('https://api.anthropic.com/v1/models', {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                    },
                });
                if (res.ok) {
                    valid = true;
                } else {
                    const data = await res.json().catch(() => ({}));
                    error = data?.error?.message || `Invalid API key (HTTP ${res.status})`;
                }
                break;
            }

            case 'gemini': {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                if (res.ok) {
                    valid = true;
                } else {
                    const data = await res.json().catch(() => ({}));
                    error = data?.error?.message || `Invalid API key (HTTP ${res.status})`;
                }
                break;
            }

            case 'sarvam': {
                const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
                    body: JSON.stringify({ model: 'sarvam-1', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
                });
                if (res.status === 401 || res.status === 403) {
                    error = `Invalid API key`;
                } else {
                    // It might return 400 Bad Request if model is wrong, but key is valid
                    valid = true;
                }
                break;
            }

            default:
                return NextResponse.json({ valid: false, error: 'Unknown provider.' }, { status: 400 });
        }

        return NextResponse.json({ valid, error: valid ? undefined : error });
    } catch (err: any) {
        return NextResponse.json({ valid: false, error: err.message || 'Network error. Please try again.' }, { status: 500 });
    }
}
