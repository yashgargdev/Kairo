/**
 * @file ragService.ts
 * @description Basic Retrieval-Augmented Generation (RAG) service using Supabase.
 *
 * This is a simplified RAG implementation that fetches the pre-extracted text
 * of a document from Supabase and returns the first 3 000 characters as context.
 *
 * **Production upgrade path**: Replace the full-text fetch with a pgvector
 * semantic similarity search — generate an embedding for the user query and
 * run `match_documents` against the `documents` table.
 *
 * @see https://supabase.com/docs/guides/ai/vector-columns
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Uses the anon key — ensure your Supabase RLS policies restrict access
// so users can only read their own documents.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/** Maximum character length of context returned to the AI to avoid token limits. */
const MAX_CONTEXT_CHARS = 3_000;

/**
 * Retrieves relevant document context for a given query.
 *
 * In this basic implementation, the `query` parameter is not yet used for
 * semantic search — the full extracted text of the specified document is
 * returned (up to `MAX_CONTEXT_CHARS` characters).
 *
 * @param query - The user's query (reserved for future semantic search).
 * @param documentId - The UUID of the document to retrieve context from.
 * @returns A string of extracted document text, or `null` if none found.
 */
export async function retrieveRelevantContext(
    query: string,
    documentId?: string,
): Promise<string | null> {
    if (!documentId) return null;

    const { data, error } = await supabase
        .from('documents')
        .select('extracted_text')
        .eq('id', documentId)
        .single();

    if (error || !data) {
        console.error('RAG Retrieval Error', error);
        return null;
    }

    return data.extracted_text.substring(0, MAX_CONTEXT_CHARS);
}
