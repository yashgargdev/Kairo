/**
 * @file hinglishProcessor.ts
 * @description Detects and normalizes Hinglish (Hindi + English code-switching)
 * input before it is sent to the AI model.
 *
 * The current implementation uses a lightweight regex heuristic to detect
 * common Hinglish discourse markers. When detected, a brief instruction is
 * prepended to the prompt so the model handles the mixed-language input gracefully.
 *
 * **Upgrade path**: Replace the regex with a lightweight embedding classifier
 * (e.g. a fine-tuned sentence-transformer) for higher accuracy on edge cases.
 */

/**
 * Detects whether the input contains Hinglish patterns and, if so, wraps it
 * in a model-readable instruction to handle mixed-language context.
 *
 * @param input - The raw user message string.
 * @returns The original string unchanged, or a prefixed version with a
 *   Hinglish handling instruction for the AI model.
 */
export function normalizeHinglish(input: string): string {
    // Heuristic: look for Latin-script words followed by common Hindi particles.
    const isHinglish =
        /[a-zA-Z]+\b.*(hai|kya|kyun|kaise|matlab|hi|nahi|karo)\b/i.test(input);

    if (isHinglish) {
        return (
            `(Note: The user is speaking Hinglish. Understand the context and respond ` +
            `clearly in English or Hinglish code-switching depending on the query.)\n` +
            `User Query: ${input}`
        );
    }

    return input;
}
