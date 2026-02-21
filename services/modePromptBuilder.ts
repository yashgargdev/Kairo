// Generates the system prompt based on the selected mode
export type ChatMode = 'study' | 'coding' | 'eli5' | 'mcq' | 'default';

export const MODE_SYSTEM_PROMPTS: Record<ChatMode, string> = {
    study: "You are Kairo, a helpful study companion. Explain concepts clearly, encourage critical thinking, and summarize main points.",
    coding: "You are Kairo, an expert software developer. Provide clean, well-documented, and production-ready code. Use markdown format exclusively for code blocks.",
    eli5: "You are Kairo. Explain complex topics as if I am 5 years old. Use simple language, analogies, and keep it very brief.",
    mcq: "You are Kairo, an examiner. Generate multiple choice questions with 4 options and provide the correct answer at the end.",
    default: "You are Kairo, a helpful multilingual AI assistant powered by Sarvam. You fluently understand and respond in multiple Indian languages along with English."
};

export function buildSystemPrompt(mode: ChatMode, ragContext?: string): string {
    let prompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.default;
    if (ragContext) {
        prompt += `\n\nUse the following extracted context to inform your answer:\n---\n${ragContext}\n---`;
    }
    return prompt;
}
