// Handles the streaming API call to Sarvam-M model
export interface SarvamMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function createSarvamStream(messages: SarvamMessage[]) {
    // Sarvam API uses OpenAI-compatible API interface.
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`
        },
        body: JSON.stringify({
            model: 'sarvam-2b-v0.5', // Open-source model proxy
            messages,
            stream: true,
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`Sarvam API error: ${response.statusText}`);
    }

    return response.body;
}
