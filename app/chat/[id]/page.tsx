'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageBubble } from '@/components/Chat/MessageBubble';
import InputBar from '@/components/Chat/InputBar';
import { useEffect, useRef, useState, use, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { getChatMessages } from '../actions';
import { useUI } from '@/components/Providers/UIProvider';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: chatId } = use(params);
    const router = useRouter();
    const isNewChat = chatId === 'new';
    const { selectedModel, availableModels } = useUI();
    
    // Resolve pretty name for current model
    const uiModelInfo = availableModels.find(m => m.id === selectedModel);
    const resolvedModelName = uiModelInfo ? uiModelInfo.name : selectedModel;

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
                    
                    // Inject latest chatId
                    parsedBody.chatId = activeChatIdRef.current;
                    
                    // Inject API keys from localStorage
                    parsedBody.keys = {
                        openai: localStorage.getItem('kairo_api_key_openai') || '',
                        anthropic: localStorage.getItem('kairo_api_key_anthropic') || '',
                        gemini: localStorage.getItem('kairo_api_key_gemini') || '',
                        sarvam: localStorage.getItem('kairo_api_key_sarvam') || '',
                    };
                    
                    // Inject selected model
                    parsedBody.model = parsedBody.overrideModel || localStorage.getItem('kairo_selected_model') || 'gpt-4o';

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
            setIsRegenerating(false);
            setTimeout(() => window.dispatchEvent(new Event('chat-updated')), 300);
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<{ name: string, content: string }[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [archivedVersions, setArchivedVersions] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const isLoading = status !== 'ready' && status !== 'error';

    // Snapshot model name per assistant message so the badge doesn't change
    // when the user switches model in the header.
    const messageModelMap = useRef<Record<string, string>>({});
    useEffect(() => {
        messages.forEach(m => {
            if (m.role === 'assistant' && m.id && !messageModelMap.current[m.id]) {
                messageModelMap.current[m.id] = resolvedModelName;
            }
        });
    }, [messages, resolvedModelName]);

    // 1. Fetch historical messages if not a new chat
    useEffect(() => {
        if (!isNewChat) {
            const fetchHistory = async () => {
                try {
                    const history = await getChatMessages(chatId);
                    const mappedMessages = history.map((m: any) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        createdAt: new Date(m.created_at)
                    }));

                    // Pre-populate the model map from DB-stored model_name
                    history.forEach((m: any) => {
                        if (m.role === 'assistant' && m.id && m.model_name) {
                            // Resolve pretty name from available models, fallback to raw model_name
                            const info = availableModels.find(am => am.id === m.model_name);
                            messageModelMap.current[m.id] = info ? info.name : m.model_name;
                        }
                    });

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
    }, [chatId, isNewChat, setMessages, availableModels]);

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
            setAttachments([]);
        }

        let messageAttachments = undefined;
        if (images.length > 0) {
            messageAttachments = images.map((imgBase64, index) => {
                let contentType = 'image/jpeg';
                const match = imgBase64.match(/^data:([^;]+);base64,/);
                if (match) contentType = match[1];

                return {
                    url: imgBase64,
                    contentType,
                    name: `uploaded_image_${index + 1}`
                };
            });
            setImages([]);
        }

        sendMessage({
            role: 'user',
            content: finalInput || 'Attached images.',
            experimental_attachments: messageAttachments
        } as any, { body: { mode, chatId: activeChatId } });
        setInput('');
    };

    const handleRegenerate = useCallback((newModelId?: string) => {
        setIsRegenerating(true);
        const lastAssistantMsg = messages.slice().reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg) {
            setArchivedVersions(prev => [...prev, lastAssistantMsg]);
        }
        
        let overrideModel = newModelId;
        if (newModelId) {
            localStorage.setItem('kairo_selected_model', newModelId);
            // Optionally dispatch event to trigger UIProvider update if needed, but not strictly needed 
            // since fetch interceptor reads from localStorage directly.
        }

        regenerate({
            // @ts-ignore
            body: { mode, chatId: activeChatId, isRegenerate: true, overrideModel }
        });
    }, [messages, mode, activeChatId, regenerate]);

    // Auto-scroll
    const isStreamingRef = useRef(false);
    useEffect(() => {
        isStreamingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isStreamingRef.current ? 'instant' : 'smooth',
        });
    }, [messages]);

    const groupedMessageElements = useMemo(() => {
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
                prev.content = m.content;
                prev.parts = m.parts;
            } else {
                groupedMessages.push({ ...m });
            }
        });

        return groupedMessages.map((m: any, index: number) => {
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
                    modelName={m.role === 'assistant' ? (messageModelMap.current[m.id] || resolvedModelName) : undefined}
                    isStreaming={isLastAssistant && isLoading}
                />
            );
        });
    }, [messages, archivedVersions, handleRegenerate, resolvedModelName, messageModelMap, isLoading]);

    const promptSuggestions = [
        { icon: 'code', label: 'Write code', prompt: 'Help me write clean, efficient code for...' },
        { icon: 'school', label: 'Explain concept', prompt: 'Explain the concept of...' },
        { icon: 'analytics', label: 'Analyze data', prompt: 'Analyze this data and find patterns...' },
        { icon: 'translate', label: 'Translate text', prompt: 'Translate the following text to...' },
    ];

    if (isLoadingHistory) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span className="text-xs font-medium uppercase tracking-widest">Loading conversation...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-4 md:px-0 pt-20 pb-48 scroll-smooth chat-glow-bg">
                <div className="max-w-3xl mx-auto flex flex-col gap-8 py-4 px-4 w-full relative z-10">

                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-16 md:mt-28 text-center animate-fade-in px-4 w-full">
                            <div className="mb-6">
                                <span className="material-symbols-outlined text-[48px] text-purple-400/60">auto_awesome</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3 tracking-tight">Chat with your AI</h1>
                            <p className="text-slate-400 text-base md:text-lg mb-2 max-w-md">Use your own API keys. No subscriptions. No markup.</p>
                            <p className="text-slate-600 text-xs mb-10">Powered by your API keys</p>
                            
                            <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-lg mx-auto">
                                {promptSuggestions.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => setInput(s.prompt)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 text-slate-400 hover:text-slate-200 text-[13px] font-medium transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-purple-400/70">{s.icon}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-4">
                            <span className="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-surface-dark/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                                {isNewChat ? 'New Session' : 'Session Active'}
                            </span>
                        </div>
                    )}

                    {groupedMessageElements}

                    {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user' || isRegenerating) && (
                        <div className="flex justify-start w-full animate-fade-in">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="size-7 md:size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-purple-400 text-[16px] md:text-[18px] animate-pulse">smart_toy</span>
                                </div>
                                <div className="p-3 md:p-4 rounded-2xl rounded-tl-sm ai-response-card backdrop-blur-sm shadow-sm flex items-center gap-2 h-10 md:h-12">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                                    <span className="text-[11px] text-slate-500 ml-2 font-medium">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isRegenerating && (
                        <div className="flex justify-start w-full pl-11 md:pl-12 animate-fade-in">
                            <div className="flex items-center gap-2 py-1">
                                <span className="w-1 h-1 rounded-full bg-purple-400/60 animate-pulse"></span>
                                <span className="text-[10px] text-purple-400/60 font-medium tracking-wide uppercase">Generating...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            <div className="absolute bottom-0 w-full z-30 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-48 md:h-64 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent"></div>
                <div className="relative w-full px-4 md:px-6 pb-6 md:pb-8 max-w-3xl mx-auto pointer-events-auto">

                    <InputBar input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={isLoading} isAuthenticated={isAuthenticated} mode={mode} setMode={setMode} attachments={attachments} setAttachments={setAttachments} images={images} setImages={setImages} />

                    <div className="flex justify-center items-center gap-2 text-center text-[9px] text-slate-600 mt-4 font-medium">
                        <span>No subscription — pay only for API usage</span>
                    </div>
                </div>
            </div>
        </>
    );
}
