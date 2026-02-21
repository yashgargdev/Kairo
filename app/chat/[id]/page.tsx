'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageBubble } from '@/components/Chat/MessageBubble';
import InputBar from '@/components/Chat/InputBar';
import { useEffect, useRef, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { getChatMessages } from '../actions';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: chatId } = use(params);
    const router = useRouter();
    const isNewChat = chatId === 'new';

    // Track the active chat ID, starting with URL param if it's not new
    const [activeChatId, setActiveChatId] = useState<string | undefined>(isNewChat ? undefined : chatId);
    const activeChatIdRef = useRef(activeChatId);

    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    const [mode, setMode] = useState('General Chat');
    const [initialMessages, setInitialMessages] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(!isNewChat);

    const { messages, status, stop, sendMessage, setMessages, regenerate } = useChat({
        id: chatId,
        // @ts-ignore - body is supported but may have type conflicts in some SDK versions
        body: { mode, chatId: activeChatId },
        initialMessages,
        transport: new DefaultChatTransport({
            api: '/api/chat',
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
                if (init?.body) {
                    const parsedBody = JSON.parse(init.body as string);
                    // Inject latest chatId to prevent stale closure issues
                    parsedBody.chatId = activeChatIdRef.current;
                    init.body = JSON.stringify(parsedBody);
                }

                const response = await fetch(input, init);

                // Read the x-chat-id header from the streaming response
                const newChatId = response.headers.get('x-chat-id');
                if (newChatId && !activeChatIdRef.current) {
                    setActiveChatId(newChatId);
                    activeChatIdRef.current = newChatId;
                    window.history.replaceState(null, '', `/chat/${newChatId}`);
                    setTimeout(() => window.dispatchEvent(new Event('chat-updated')), 500);
                }

                return response;
            }
        }),
        onFinish: () => {
            setTimeout(() => window.dispatchEvent(new Event('chat-updated')), 300);
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<{ name: string, content: string }[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [archivedVersions, setArchivedVersions] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const isLoading = status !== 'ready' && status !== 'error';

    // 1. Fetch historical messages if not a new chat
    useEffect(() => {
        if (!isNewChat) {
            const fetchHistory = async () => {
                try {
                    const history = await getChatMessages(chatId);
                    // Map Supabase history to AI SDK Message format
                    const mappedMessages = history.map((m: any) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        createdAt: new Date(m.created_at)
                    }));
                    // @ts-ignore - Strict message types in some versions
                    setMessages(mappedMessages);
                } catch (err) {
                    console.error('Failed to load history:', err);
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [chatId, isNewChat, setMessages]);

    // 2. Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkAuth();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if ((!input.trim() && attachments.length === 0) || isLoading) return;

        let finalInput = input;

        if (attachments.length > 0) {
            const attachmentText = attachments.map(att => `\n\n--- Document: ${att.name} ---\n${att.content}`).join('');
            finalInput += attachmentText;
            setAttachments([]); // Clear attachments after sending
        }

        // Attach images by converting them to Data URLs inside the standard attachments format
        let messageAttachments = undefined;
        if (images.length > 0) {
            messageAttachments = images.map((imgBase64, index) => {
                // Infer content type from base64 prefix
                let contentType = 'image/jpeg';
                const match = imgBase64.match(/^data:([^;]+);base64,/);
                if (match) contentType = match[1];

                return {
                    url: imgBase64,
                    contentType,
                    name: `uploaded_image_${index + 1}`
                };
            });
            setImages([]); // Clear images after sending
        }

        // Explicitly send the latest activeChatId to prevent creating separate
        // chat logs when staying on the /chat/new route after the first message
        sendMessage({
            role: 'user',
            content: finalInput || 'Attached images.',
            experimental_attachments: messageAttachments
        } as any, { body: { mode, chatId: activeChatId } });
        setInput('');
    };

    const handleRegenerate = () => {
        const lastAssistantMsg = messages.slice().reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg) {
            setArchivedVersions(prev => [...prev, lastAssistantMsg]);
        }
        regenerate({
            // @ts-ignore
            body: { mode, chatId: activeChatId, isRegenerate: true }
        });
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoadingHistory) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span className="text-xs font-medium uppercase tracking-widest">Retrieving History...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-4 md:px-0 pt-24 pb-48 scroll-smooth">
                <div className="max-w-3xl mx-auto flex flex-col gap-8 py-4 px-4 w-full">

                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 md:mt-32 text-center animate-fade-in px-4">
                            <div className="size-16 md:size-20 flex items-center justify-center mb-6">
                                <img src="/Kairo-Logo-White.png" alt="Kairo Logo" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-serif text-white mb-2 tracking-wide">Hi, I'm Kairo</h1>
                            <p className="text-slate-500 font-light text-sm md:text-base px-8 md:px-0">How can I help you evolve today?</p>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-4">
                            <span className="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-surface-dark/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                                {isNewChat ? 'New Session Started' : 'Session Active'}
                            </span>
                        </div>
                    )}

                    {(() => {
                        const allMessages = [...messages, ...archivedVersions].sort((a, b) => {
                            const dateA = new Date(a.createdAt || 0).getTime();
                            const dateB = new Date(b.createdAt || 0).getTime();
                            return dateA - dateB;
                        });

                        const groupedMessages: any[] = [];
                        allMessages.forEach((m) => {
                            const prev = groupedMessages[groupedMessages.length - 1];
                            if (prev && prev.role === 'assistant' && m.role === 'assistant') {
                                if (!prev.versions) prev.versions = [{ ...prev }];
                                prev.versions.push({ ...m });
                                // Keep the top level content updated to the latest version for convenience
                                prev.content = m.content;
                                prev.parts = m.parts;
                            } else {
                                groupedMessages.push({ ...m });
                            }
                        });

                        return groupedMessages.map((m: any, index: number) => {
                            // Find if this is the last assistant message
                            const isLastAssistant = m.role === 'assistant' &&
                                index === groupedMessages.map((msg: any) => msg.role).lastIndexOf('assistant');

                            return (
                                <MessageBubble
                                    key={m.id}
                                    role={m.role as 'user' | 'assistant'}
                                    content={m.content}
                                    parts={m.parts}
                                    versions={m.versions}
                                    onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                                />
                            );
                        });
                    })()}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex justify-start w-full animate-fade-in">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="size-7 md:size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-primary text-[16px] md:text-[18px]">smart_toy</span>
                                </div>
                                <div className="p-3 md:p-4 rounded-2xl rounded-tl-sm ai-response-card backdrop-blur-sm shadow-sm flex items-center gap-1.5 h-10 md:h-12">
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            <div className="absolute bottom-0 w-full z-30 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-48 md:h-64 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent"></div>
                <div className="relative w-full px-4 md:px-6 pb-6 md:pb-8 max-w-3xl mx-auto pointer-events-auto">

                    {messages.length === 0 && (
                        <div className="flex flex-wrap justify-center mb-6 gap-2 md:gap-3 animate-fade-in px-4">
                            <button
                                onClick={() => setInput("Can you write a python script to calculate the Fibonacci sequence?")}
                                className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-surface-dark/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] md:text-[11px] font-medium text-slate-400 hover:text-white hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5 group"
                            >
                                <span className="material-symbols-outlined text-[14px] text-primary/70 group-hover:text-primary transition-colors">code</span>
                                Write code
                            </button>
                            <button
                                onClick={() => setInput("Explain React Server Components like I'm 5")}
                                className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-surface-dark/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] md:text-[11px] font-medium text-slate-400 hover:text-white hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5 group"
                            >
                                <span className="material-symbols-outlined text-[14px] text-primary/70 group-hover:text-primary transition-colors">school</span>
                                Explain concept
                            </button>
                        </div>
                    )}

                    <InputBar input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={isLoading} isAuthenticated={isAuthenticated} mode={mode} setMode={setMode} attachments={attachments} setAttachments={setAttachments} images={images} setImages={setImages} />

                    <p className="text-center text-[9px] md:text-[10px] text-slate-600 mt-4 font-medium tracking-wider uppercase">
                        KAIRO AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFORMATION.
                    </p>
                </div>
            </div >
        </>
    );
}
