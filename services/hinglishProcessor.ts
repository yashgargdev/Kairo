// Detects and normalizes Hinglish to standard prompt components
export function normalizeHinglish(input: string): string {
    // Basic heuristic: append instruction for the model to handle Hinglish natively.
    // In a real-world mature app this might use a lightweight embedding classifier.
    const isHinglish = /[a-zA-Z]+\b.*(hai|kya|kyun|kaise|matlab|hi|nahi|karo)\b/i.test(input);

    if (isHinglish) {
        return `(Note: The user is speaking Hinglish. Understand the context and respond clearly in English or Hinglish code-switching depending on the query.)\nUser Query: ${input}`;
    }
    return input;
}
