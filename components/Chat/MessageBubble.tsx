'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useState, useEffect, memo } from 'react';
import { useUI } from '@/components/Providers/UIProvider';

export const MessageBubble = memo(function MessageBubble({ role, content, parts, versions, onRegenerate, modelName, isStreaming }: {
    role: 'user' | 'assistant',
    content?: string,
    parts?: Array<{ type: string, text?: string }>,
    versions?: Array<any>,
    onRegenerate?: (modelId?: string) => void,
    modelName?: string,
    isStreaming?: boolean
}) {
    const isUser = role === 'user';
    const [versionIndex, setVersionIndex] = useState(0);
    const [showModels, setShowModels] = useState(false);
    
    // Import useUI inside the component dynamically or via props... wait, I need to pass uiContext 
    // Let's just import useUI at the top and call it
    const { availableModels } = useUI();

    // Auto-scroll to the newest version when a new one is added
    useEffect(() => {
        if (versions && versions.length > 0) {
            setVersionIndex(versions.length - 1);
        }
    }, [versions?.length]);

    const activeVersion = versions && versions.length > 0 ? versions[versionIndex] : null;
    const activeContent = activeVersion ? activeVersion.content : content;
    const activeParts = activeVersion ? activeVersion.parts : parts;

    let rawMessageText = activeContent || activeParts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || '';

    // Extract reasoning from AI SDK reasoning parts (Claude, Gemini, etc.)
    let sdkReasoning = '';
    if (activeParts) {
        sdkReasoning = activeParts
            .filter((p: any) => p.type === 'reasoning')
            .map((p: any) => p.text || p.reasoning || '')
            .join('\n')
            .trim();
    }

    // Parse <think> tags (Sarvam models)
    let thinkText = '';
    let isThinking = false;
    let messageText = rawMessageText;
    
    const thinkStart = rawMessageText.indexOf('<think>');
    if (thinkStart !== -1) {
        const thinkEnd = rawMessageText.indexOf('</think>');
        if (thinkEnd !== -1) {
            thinkText = rawMessageText.substring(thinkStart + 7, thinkEnd).trim();
            messageText = (rawMessageText.substring(0, thinkStart) + rawMessageText.substring(thinkEnd + 8)).trim();
        } else {
            // Unclosed think tag (streaming)
            thinkText = rawMessageText.substring(thinkStart + 7).trim();
            messageText = rawMessageText.substring(0, thinkStart).trim();
            isThinking = true;
        }
    }

    // Merge: prefer <think> tag content, fallback to SDK reasoning parts
    if (!thinkText && sdkReasoning) {
        thinkText = sdkReasoning;
    }

    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
    const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);

    // Thought process stays collapsed by default

    const handleCopy = () => {
        navigator.clipboard.writeText(messageText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <div className="flex justify-end w-full animate-fade-in">
                <div className="flex items-end gap-3 max-w-[85%] md:max-w-[80%] flex-row-reverse">
                    <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0 overflow-hidden flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-5 py-3.5 rounded-2xl rounded-br-sm bg-white/[0.08] border border-white/[0.06] text-white shadow-lg">
                            <p className="text-[15px] leading-relaxed font-light whitespace-pre-wrap">{messageText}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Assistant Bubble
    return (
        <div className="flex justify-start w-full animate-fade-in">
            <div className="flex items-start gap-4 max-w-full md:max-w-[90%]">
                <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-purple-400 text-[18px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    {thinkText && (
                        <div className="mb-1 w-full animate-fade-in pl-1">
                            <button 
                                onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                                className="flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-300 transition-colors py-1 group/think"
                            >
                                <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isThoughtExpanded ? 'rotate-90' : ''}`}>
                                    chevron_right
                                </span>
                                {isThinking ? (
                                    <span className="flex items-center gap-1.5 text-purple-400 group-hover/think:text-purple-300">
                                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                        Thinking...
                                    </span>
                                ) : (
                                    <span>Thought Process</span>
                                )}
                            </button>
                            {isThoughtExpanded && (
                                <div className="mt-2 pl-6 border-l-[1.5px] border-white/10 ml-2 py-0.5 animate-fade-in">
                                    <div className="text-[13px] font-light text-slate-400 leading-relaxed whitespace-pre-wrap italic opacity-80">
                                        {thinkText}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {(messageText || isStreaming) && (
                        <div className={`p-6 md:p-8 rounded-2xl rounded-tl-sm ai-response-card backdrop-blur-sm w-full relative group ${!messageText ? 'bg-transparent shadow-none border-transparent p-0 md:p-0' : ''}`}>
                            {messageText && <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover:border-purple-500/5 transition-colors pointer-events-none"></div>}
                        <div className="prose prose-invert prose-base max-w-none text-slate-300 leading-8">
                            {messageText && (
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-5 text-[15px] font-light text-slate-200" {...props} />,
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                        ) : (
                                            <code className="bg-white/5 border border-purple-500/20 px-1.5 py-0.5 rounded text-purple-300/90 font-mono text-xs" {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {messageText}
                            </ReactMarkdown>
                            )}
                            {isStreaming && (
                                <span className={`inline-block w-1.5 h-4 ml-1 bg-purple-400/80 animate-pulse align-middle ${!messageText ? 'mt-3 lg:mt-5 bg-purple-400/60' : ''}`} style={{ animationDuration: '0.8s' }}></span>
                            )}
                        </div>
                    </div>
                    )}

                    {!isStreaming && (
                        <div className="flex items-center gap-3 pl-1">
                            <button onClick={handleCopy} className={`p-1.5 rounded-full transition-colors ${copied ? 'text-emerald-500 bg-white/5' : 'text-slate-600 hover:text-purple-400 hover:bg-white/5'}`} title={copied ? "Copied" : "Copy response"}>
                                <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                            </button>
                            <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')} className={`p-1.5 rounded-full transition-colors ${feedback === 'like' ? 'text-purple-400 bg-white/5' : 'text-slate-600 hover:text-purple-400 hover:bg-white/5'}`} title="Good response">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: feedback === 'like' ? '"FILL" 1' : '"FILL" 0' }}>thumb_up</span>
                            </button>
                            <button onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')} className={`p-1.5 rounded-full transition-colors ${feedback === 'dislike' ? 'text-rose-500 bg-white/5' : 'text-slate-600 hover:text-rose-500 hover:bg-white/5'}`} title="Bad response">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: feedback === 'dislike' ? '"FILL" 1' : '"FILL" 0' }}>thumb_down</span>
                            </button>

                            {versions && versions.length > 1 && (
                                <div className="flex items-center gap-1.5 text-slate-500 bg-white/5 rounded-full px-2 py-0.5 ml-2">
                                    <button
                                        onClick={() => setVersionIndex(Math.max(0, versionIndex - 1))}
                                        disabled={versionIndex === 0}
                                        className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[13px]">chevron_left</span>
                                    </button>
                                    <span className="text-[10px] font-medium font-mono min-w-[24px] text-center select-none">
                                        {versionIndex + 1}/{versions.length}
                                    </span>
                                    <button
                                        onClick={() => setVersionIndex(Math.min(versions.length - 1, versionIndex + 1))}
                                        disabled={versionIndex === versions.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex-1"></div>
                            
                            {!isUser && modelName && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400 font-medium tracking-wide mr-2 select-none">
                                    <span className="material-symbols-outlined text-[12px] text-purple-400/70">auto_awesome</span>
                                    {modelName}
                                </div>
                            )}

                            {onRegenerate && (
                                <div className="relative flex items-center bg-white/5 hover:bg-white/10 border border-white/5 rounded transition-all ml-1">
                                    <button onClick={() => onRegenerate()} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-white transition-colors px-2 py-1 uppercase tracking-wide">
                                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        Regenerate
                                    </button>
                                    <div className="w-[1px] h-3 bg-white/10"></div>
                                    <button 
                                        onClick={() => setShowModels(!showModels)}
                                        className="px-1 py-1 text-slate-400 hover:text-white transition-colors rounded-r flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                                    </button>

                                    {showModels && (
                                        <>
                                            <div className="fixed inset-0 z-[60]" onClick={() => setShowModels(false)}></div>
                                            <div className="absolute bottom-full right-0 mb-1 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[70] py-1 backdrop-blur-xl">
                                                <div className="px-3 py-1.5 border-b border-white/5">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Regenerate with...</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar overscroll-contain">
                                                    {availableModels.map(m => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => {
                                                                setShowModels(false);
                                                                onRegenerate(m.id);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-[12px] text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex flex-col gap-0.5"
                                                        >
                                                            <span className="font-medium">{m.name}</span>
                                                            <span className="text-[10px] text-slate-500">{m.provider}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

/** Memoized syntax-highlighted code block — only re-renders when language/value change */
const CodeBlock = memo(function CodeBlock({ language, value }: { language: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg overflow-hidden code-block my-8 shadow-2xl">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#121212]">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/70 animate-pulse-slow"></span>
                    {language}
                </span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-purple-400 transition-colors uppercase tracking-wider font-medium"
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className="p-5 overflow-x-auto bg-[#0a0a0a]">
                <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                    codeTagProps={{ className: "font-mono text-[13px] leading-6" }}
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    );
});
