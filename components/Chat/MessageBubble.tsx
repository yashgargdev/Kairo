'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useState, useEffect, memo } from 'react';

export const MessageBubble = memo(function MessageBubble({ role, content, parts, versions, onRegenerate }: {
    role: 'user' | 'assistant',
    content?: string,
    parts?: Array<{ type: string, text?: string }>,
    versions?: Array<any>,
    onRegenerate?: () => void
}) {
    const isUser = role === 'user';
    const [versionIndex, setVersionIndex] = useState(0);

    // Auto-scroll to the newest version when a new one is added
    useEffect(() => {
        if (versions && versions.length > 0) {
            setVersionIndex(versions.length - 1);
        }
    }, [versions?.length]);

    const activeVersion = versions && versions.length > 0 ? versions[versionIndex] : null;
    const activeContent = activeVersion ? activeVersion.content : content;
    const activeParts = activeVersion ? activeVersion.parts : parts;

    const messageText = activeContent || activeParts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || '';

    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(messageText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <div className="flex justify-end w-full animate-fade-in">
                <div className="flex items-end gap-4 max-w-[85%] md:max-w-[80%] flex-row-reverse">
                    <div className="size-8 rounded-full bg-surface-dark shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-6 py-4 rounded-2xl rounded-br-sm bg-gradient-gold text-black shadow-lg shadow-yellow-900/10">
                            <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{messageText}</p>
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
                    <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-3 w-full">
                    <div className="p-6 md:p-8 rounded-2xl rounded-tl-sm ai-response-card backdrop-blur-sm w-full relative group">
                        <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/5 transition-colors pointer-events-none"></div>
                        <div className="prose prose-invert prose-base max-w-none text-slate-300 leading-8">
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-5 text-[15px] font-light text-slate-200" {...props} />,
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                        ) : (
                                            <code className="bg-white/5 border border-primary/20 px-1.5 py-0.5 rounded text-primary/90 font-mono text-xs" {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {messageText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-1">
                        <button onClick={handleCopy} className={`p-1.5 rounded-full transition-colors ${copied ? 'text-emerald-500 bg-white/5' : 'text-slate-600 hover:text-primary hover:bg-white/5'}`} title={copied ? "Copied" : "Copy response"}>
                            <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                        </button>
                        <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')} className={`p-1.5 rounded-full transition-colors ${feedback === 'like' ? 'text-primary bg-white/5' : 'text-slate-600 hover:text-primary hover:bg-white/5'}`} title="Good response">
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
                        {onRegenerate && (
                            <button onClick={onRegenerate} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-primary transition-colors px-2 py-1 rounded border border-transparent hover:border-primary/20 hover:bg-primary/5 uppercase tracking-wide">
                                <span className="material-symbols-outlined text-[14px]">refresh</span>
                                Regenerate
                            </button>
                        )}
                    </div>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse-slow"></span>
                    {language}
                </span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-primary transition-colors uppercase tracking-wider font-medium"
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
