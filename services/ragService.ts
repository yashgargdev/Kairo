// Basic RAG implementation using Supabase for storage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We use ANON KEY here assuming RLS allows the user to read their own docs
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function retrieveRelevantContext(query: string, documentId?: string): Promise<string | null> {
    // For this open-source basic implementation, fetch the entire extracted_text
    // Real-world would use pgvector, generating embeddings for 'query' and doing semantic search
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

    // Return a safe chunk
    return data.extracted_text.substring(0, 3000);
}
