import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

// Create a custom OpenAI provider for Sarvam AI
const sarvam = createOpenAI({
    apiKey: process.env.SARVAM_API_KEY,
    baseURL: 'https://api.sarvam.ai/v1',
    headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY || '',
    }
});

// Next.js App Router Route Handler for Streaming AI Responses
export const maxDuration = 60;

/**
 * Uses Sarvam Vision (Document Intelligence) to extract a text description from an image.
 * Falls back gracefully to a placeholder if the API fails.
 */
async function describeImageWithSarvamVision(base64DataUrl: string): Promise<string> {
    try {
        // Extract mime type and base64 data
        const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return '[Image could not be processed]';
        const [, mimeType, base64Data] = match;

        // Convert to Blob for multipart upload
        const binaryData = Buffer.from(base64Data, 'base64');
        const blob = new Blob([binaryData], { type: mimeType });

        const formData = new FormData();
        const ext = mimeType.split('/')[1] || 'png';
        formData.append('file', blob, `image.${ext}`);
        formData.append('output_format', 'markdown');  // Request markdown output
        formData.append('description_settings', JSON.stringify({ language: 'en' }));

        const res = await fetch('https://api.sarvam.ai/v1/vision/describe', {
            method: 'POST',
            headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY || '',
            },
            body: formData,
        });

        if (!res.ok) {
            // Fallback: try the document-intelligence endpoint
            const formData2 = new FormData();
            formData2.append('file', blob, `image.${ext}`);
            formData2.append('output_format', 'markdown');

            const res2 = await fetch('https://api.sarvam.ai/document-intelligence/v1/jobs', {
                method: 'POST',
                headers: {
                    'api-subscription-key': process.env.SARVAM_API_KEY || '',
                },
                body: formData2,
            });

            if (!res2.ok) {
                console.error('Sarvam Vision error:', await res2.text());
                return '[Image uploaded — visual analysis not available for this image type]';
            }

            const data2 = await res2.json();
            return data2.markdown || data2.text || data2.description || '[Image processed]';
        }

        const data = await res.json();
        return data.markdown || data.text || data.description || '[Image processed]';
    } catch (err) {
        console.error('Sarvam Vision exception:', err);
        return '[Image uploaded — could not process visual content at this time]';
    }
}


export async function POST(req: Request) {
    const reqBody = await req.json();
    const { messages, mode, isRegenerate } = reqBody;
    const chatId = reqBody.chatId || reqBody.id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        let currentChatId = chatId === 'new' ? undefined : chatId;

        // 1. If no chatId, create a new chat record
        if (!currentChatId) {
            const lastMsg = messages[messages.length - 1];
            // content can be a string or an array of parts (e.g. text + image)
            const titleText = Array.isArray(lastMsg.content)
                ? (lastMsg.content.find((p: any) => p.type === 'text')?.text || 'New Chat')
                : (lastMsg.content || 'New Chat');
            const { data: newChat, error: chatError } = await supabase
                .from('chats')
                .insert({
                    user_id: user.id,
                    title: titleText.substring(0, 100)
                })
                .select()
                .single();

            if (chatError) throw chatError;
            currentChatId = newChat.id;
        }

        // 2. Load full conversation history from DB to guarantee memory continuity
        //    This ensures the AI always has the complete context even if the client
        //    sent a partial message list (e.g. after a page reload)
        let conversationHistory: { role: string; content: string }[] = [];
        if (currentChatId) {
            const { data: dbMessages } = await supabase
                .from('messages')
                .select('role, content')
                .eq('chat_id', currentChatId)
                .order('created_at', { ascending: true });

            if (dbMessages && dbMessages.length > 0) {
                conversationHistory = dbMessages.map((m: any) => ({
                    role: m.role,
                    content: m.content || ''
                }));
            }
        }

        // 3. Save the user's latest message (skip if regenerating)
        const lastUserMessage = messages[messages.length - 1];
        // Extract text content from the latest user message (may be string or parts array)
        const lastUserText = Array.isArray(lastUserMessage.content)
            ? (lastUserMessage.content.find((p: any) => p.type === 'text')?.text || '')
            : (lastUserMessage.content || '');

        const lastStoredMsg = conversationHistory[conversationHistory.length - 1];
        // Only save if this message isn't already the last one in history (prevents duplicates)
        const isAlreadySaved = lastStoredMsg?.role === 'user' && lastStoredMsg?.content === lastUserText;

        if (lastUserMessage.role === 'user' && !isRegenerate && !isAlreadySaved) {
            await supabase.from('messages').insert({
                chat_id: currentChatId,
                role: 'user',
                content: lastUserText
            });
        }

        let systemPrompt = "You are Kairo, an evolving intelligence AI. You are a highly capable text assistant.";

        if (user?.user_metadata) {
            const { about_you, custom_instructions, full_name } = user.user_metadata;
            if (full_name) systemPrompt += `\n\nThe user's name is ${full_name}.`;
            if (about_you) systemPrompt += `\n\nAbout the User:\n${about_you}`;
            if (custom_instructions) systemPrompt += `\n\nCustom Instructions on how to respond:\n${custom_instructions}`;
        }

        // Add mode specific logic
        if (mode === 'Code Assistant') {
            systemPrompt += "\n\nYou are an expert programmer. Provide clean, efficient code. Always explain your technical decisions.";
        } else if (mode === 'Writer') {
            systemPrompt += "\n\nYou are an expert writer and editor. Focus on prose, tone, and grammar. Do not use markdown code blocks unless explicitly requested.";
        } else if (mode === 'Web Search') {
            systemPrompt += "\n\nYou are a research assistant. Provide factual summaries.";
        }

        // Sanitize messages: use DB history as base + latest incoming message (may have images)
        // This gives the AI the full conversation context from Supabase on every request.
        let sanitizedMessages: any[] = conversationHistory.map((m) => ({
            role: m.role,
            content: m.content
        }));

        // If the latest message has image attachments, call Sarvam Vision to get a text description
        // then inject it as plain text so sarvam-m (which doesn't support image arrays) can process it
        const latestMsg = messages[messages.length - 1];
        if (latestMsg && latestMsg.role === 'user') {
            const hasAttachments = latestMsg.experimental_attachments && latestMsg.experimental_attachments.length > 0;

            if (hasAttachments) {
                const imageDescriptions: string[] = [];
                for (const att of latestMsg.experimental_attachments) {
                    if (att.contentType?.startsWith('image/') && att.url) {
                        const description = await describeImageWithSarvamVision(att.url);
                        imageDescriptions.push(description);
                    }
                }

                if (imageDescriptions.length > 0) {
                    const imageContext = `\n\n[The user has shared ${imageDescriptions.length} image(s). Here is the visual analysis from Sarvam Vision:]\n${imageDescriptions.map((d, i) => `Image ${i + 1}:\n${d}`).join('\n\n')}`;

                    // Replace or append the latest user message with the vision-augmented text
                    const lastHistMsg = sanitizedMessages[sanitizedMessages.length - 1];
                    const augmentedContent = (lastUserText || '') + imageContext;

                    if (lastHistMsg?.role === 'user' && lastHistMsg?.content === lastUserText) {
                        sanitizedMessages[sanitizedMessages.length - 1] = { role: 'user', content: augmentedContent };
                    } else {
                        sanitizedMessages.push({ role: 'user', content: augmentedContent });
                    }
                }
            } else if (lastUserText) {
                // No images — always append the current user message (DB history loads BEFORE saving it,
                // so the latest message is never in conversationHistory and must be added explicitly)
                const lastHistMsg = sanitizedMessages[sanitizedMessages.length - 1];
                if (lastHistMsg?.content !== lastUserText) {
                    sanitizedMessages.push({ role: 'user', content: lastUserText });
                }
            }
        }

        sanitizedMessages = sanitizedMessages.filter((m: any) => ['user', 'assistant'].includes(m.role));


        // Enforce alternating sequence
        const normalizedSequence: any[] = [];
        for (const msg of sanitizedMessages) {
            if (normalizedSequence.length === 0) {
                // Must start with user
                if (msg.role === 'user') normalizedSequence.push(msg);
            } else {
                const lastMsg = normalizedSequence[normalizedSequence.length - 1];
                if (lastMsg.role === msg.role) {
                    // Combine consecutive messages of the same role
                    if (typeof lastMsg.content === 'string' && typeof msg.content === 'string') {
                        lastMsg.content += `\n\n${msg.content}`;
                    } else {
                        // Convert both to arrays and merge them to avoid stringifying image objects
                        const lastContent = typeof lastMsg.content === 'string' ? [{ type: 'text', text: lastMsg.content }] : lastMsg.content;
                        const currContent = typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : msg.content;
                        lastMsg.content = [...lastContent, { type: 'text', text: '\n\n' }, ...currContent];
                    }
                } else {
                    normalizedSequence.push(msg);
                }
            }
        }

        sanitizedMessages = normalizedSequence;

        // Guard: if there are no messages to send, return an error immediately
        if (sanitizedMessages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No messages to process' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'x-chat-id': currentChatId || '' } }
            );
        }

        const result = streamText({
            model: sarvam.chat('sarvam-m'),
            system: systemPrompt,
            messages: sanitizedMessages,
            temperature: 0.7,
            onFinish: async ({ text }) => {
                // 3. Save assistant response when finished
                await supabase.from('messages').insert({
                    chat_id: currentChatId,
                    role: 'assistant',
                    content: text
                });
                // 4. Update the chat's updated_at so it bubbles to the top of the unread list
                await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', currentChatId);
            }
        });

        // Add the custom chatId header so the client can update its state
        return result.toUIMessageStreamResponse({
            headers: {
                'x-chat-id': currentChatId,
                'Access-Control-Expose-Headers': 'x-chat-id'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
