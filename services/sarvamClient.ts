/**
 * @file sarvamClient.ts
 * @description Low-level HTTP client for streaming chat completions from the Sarvam AI API.
 *
 * The Sarvam API is OpenAI-compatible. Authentication is via a Bearer token
 * read from the `SARVAM_API_KEY` environment variable.
 *
 * The base URL defaults to `https://api.sarvam.ai` but can be overridden
 * via the `SARVAM_BASE_URL` environment variable (useful for self-hosted or
 * proxy setups).
 *
 * @example
 * const stream = await createSarvamStream([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 */

/** A single message in a Sarvam chat conversation. */
export interface SarvamMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const SARVAM_BASE_URL =
    process.env.SARVAM_BASE_URL?.replace(/\/$/, '') ?? 'https://api.sarvam.ai';

/**
 * Opens a streaming chat completion request to the Sarvam AI API.
 *
 * @param messages - The conversation messages to send (system + history + user).
 * @returns A `ReadableStream` of Server-Sent Events (SSE) bytes.
 * @throws {Error} If the API responds with a non-2xx status code.
 */
export async function createSarvamStream(messages: SarvamMessage[]) {
    const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'sarvam-2b-v0.5',
            messages,
            stream: true,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        throw new Error(`Sarvam API error: ${response.statusText}`);
    }

    return response.body;
}
