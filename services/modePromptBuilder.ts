/**
 * @file modePromptBuilder.ts
 * @description Builds the system prompt for Kairo based on the selected chat mode.
 *
 * Each mode gives Kairo a distinct personality and set of behaviour guidelines.
 * A RAG (Retrieval-Augmented Generation) context string can optionally be
 * appended so the AI grounds its answer in user-provided documents.
 */

/** The available AI persona modes. */
export type ChatMode = 'study' | 'coding' | 'eli5' | 'mcq' | 'default';

/**
 * System prompt templates for each supported mode.
 * Swap these out or add new modes to extend Kairo's capabilities.
 */
export const MODE_SYSTEM_PROMPTS: Record<ChatMode, string> = {
    study:
        'You are Kairo, a helpful study companion. Explain concepts clearly, encourage critical thinking, and summarize main points.',
    coding:
        'You are Kairo, an expert software developer. Provide clean, well-documented, and production-ready code. Use markdown format exclusively for code blocks.',
    eli5:
        'You are Kairo. Explain complex topics as if I am 5 years old. Use simple language, analogies, and keep it very brief.',
    mcq:
        'You are Kairo, an examiner. Generate multiple choice questions with 4 options and provide the correct answer at the end.',
    default:
        'You are Kairo, a helpful multilingual AI assistant powered by Sarvam. You fluently understand and respond in multiple Indian languages along with English.',
};

/**
 * Builds the full system prompt for a given mode, optionally injecting
 * retrieved document context for RAG-augmented responses.
 *
 * @param mode - The active chat persona mode.
 * @param ragContext - Optional document text retrieved for RAG. When provided,
 *   it is appended as a grounding context block for the AI.
 * @returns The complete system prompt string.
 */
export function buildSystemPrompt(mode: ChatMode, ragContext?: string): string {
    let prompt = MODE_SYSTEM_PROMPTS[mode] ?? MODE_SYSTEM_PROMPTS.default;
    if (ragContext) {
        prompt += `\n\nUse the following extracted context to inform your answer:\n---\n${ragContext}\n---`;
    }
    return prompt;
}
