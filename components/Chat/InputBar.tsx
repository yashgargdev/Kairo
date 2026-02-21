'use client';

import { Send, Paperclip, Mic, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { UploadModal } from '../Modals/UploadModal';
import { useRouter } from 'next/navigation';

export default function InputBar({
    input = '',
    handleInputChange,
    handleSubmit,
    isLoading,
    isAuthenticated,
    mode = 'General Chat',
    setMode,
    attachments = [],
    setAttachments,
    images = [],
    setImages
}: {
    input?: string,
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
    isLoading?: boolean,
    isAuthenticated?: boolean | null,
    mode?: string,
    setMode?: (mode: string) => void,
    attachments?: { name: string, content: string }[],
    setAttachments?: React.Dispatch<React.SetStateAction<{ name: string, content: string }[]>>,
    images?: string[],
    setImages?: React.Dispatch<React.SetStateAction<string[]>>
}) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isModeOpen, setIsModeOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const router = useRouter();
    const modeSelectorRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = async (file: File) => {
        setIsUploadingFile(true);
        try {
            if (file.type.startsWith('image/')) {
                // Convert image natively to base64 Data URL for AI vision ingestion
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    if (setImages && typeof reader.result === 'string') {
                        setImages(prev => [...prev, reader.result as string]);
                    }
                };
                reader.onerror = (error) => {
                    console.error('Error reading image file:', error);
                    alert('Failed to read image. Please try again.');
                };
            } else {
                // Parse standard documents into text structure
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/parse-document', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to parse document');
                }

                const data = await response.json();
                if (data.text && setAttachments) {
                    setAttachments(prev => [...prev, { name: file.name, content: data.text }]);
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to parse document. Please try again.');
        } finally {
            setIsUploadingFile(false);
            setIsUploadOpen(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
                setIsModeOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const newText = input ? `${input} ${transcript}` : transcript;

            const syntheticEvent = {
                target: { value: newText }
            } as React.ChangeEvent<HTMLTextAreaElement>;

            handleInputChange(syntheticEvent);
        };

        recognition.onerror = (event: any) => {
            // 'aborted' = user stopped mic, 'no-speech' = timeout with no input — both are expected
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                console.error('Speech recognition error', event.error);
            }
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (((input || '').trim() || attachments.length > 0) && !isLoading) {
                // @ts-ignore - simulating form submission
                handleSubmit(e);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="group/trap w-full relative z-20">

            <div
                className="floating-input-container rounded-[16px] flex flex-col relative z-20 corner-glow transition-all duration-300 group/input"
            >
                {/* Advanced Pro top accent strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-t-2xl opacity-60 group-focus-within/input:opacity-100 transition-opacity shadow-[0_0_10px_rgba(251,191,36,0.2)] group-focus-within/input:shadow-[0_0_15px_rgba(251,191,36,0.4)]"></div>

                {isAuthenticated === false ? (
                    <div className="flex flex-col items-center justify-center p-5 bg-surface-dark/95 rounded-xl space-y-3 z-30 min-h-[100px]">
                        <p className="text-slate-400 text-[13px] font-medium tracking-wide">Join Kairo to start evolving your intelligence.</p>
                        <button type="button" onClick={() => router.push('/login')} className="px-6 py-2 bg-gradient-gold text-black rounded-full text-sm font-semibold shadow-glow-gold-subtle hover:brightness-110 active:scale-95 transition-all">
                            Sign in to chat
                        </button>
                    </div>
                ) : (
                    <>
                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-white/10 px-2 py-1 flex-shrink-0 rounded-md border border-white/5 text-xs text-slate-300">
                                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setAttachments?.(prev => prev.filter((_, i) => i !== idx))}
                                            className="ml-1 text-slate-400 hover:text-red-400 focus:outline-none transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1">
                                {images.map((imgBase64, idx) => (
                                    <div key={`img-${idx}`} className="relative group w-12 h-12 rounded-md border border-white/10 overflow-hidden shrink-0">
                                        <img src={imgBase64} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImages?.(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 p-0.5 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-md"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`flex items-center px-2 ${attachments.length > 0 ? 'pt-1' : 'pt-3'} pb-1`}>
                            <textarea
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={onKeyDown}
                                className="w-full bg-transparent text-white placeholder-slate-500 px-3 py-3 rounded-lg focus:outline-none focus:ring-0 resize-none overflow-hidden max-h-48 text-[15px] leading-relaxed font-light"
                                placeholder="Ask anything..."
                                rows={1}
                                style={{ minHeight: '52px' }}
                            />
                        </div>
                        <div className="flex items-center justify-between px-3 pb-2 pt-1">
                            <div className="flex items-center gap-0.5 md:gap-1 relative" ref={modeSelectorRef}>
                                {/* Mode Selector Dropdown */}
                                {isModeOpen && (
                                    <div className="absolute bottom-full mb-4 left-0 w-48 bg-surface-dark border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50 p-2 flex flex-col gap-1 backdrop-blur-xl">
                                        <button type="button" onClick={() => { setMode?.('General Chat'); setIsModeOpen(false); }} className={`flex items-center gap-3 p-2.5 px-3 text-sm font-medium rounded-xl transition-colors text-left border ${mode === 'General Chat' ? 'text-white bg-white/10 border-white/10 shadow-sm' : 'text-slate-400 bg-transparent border-transparent hover:bg-white/5 hover:text-white'}`}>
                                            <span className={`material-symbols-outlined text-[18px] ${mode === 'General Chat' ? 'text-primary' : ''}`}>chat</span>
                                            General Chat
                                        </button>
                                        <button type="button" onClick={() => { setMode?.('Code Assistant'); setIsModeOpen(false); }} className={`flex items-center gap-3 p-2.5 px-3 text-sm font-medium rounded-xl transition-colors text-left border ${mode === 'Code Assistant' ? 'text-white bg-white/10 border-white/10 shadow-sm' : 'text-slate-400 bg-transparent border-transparent hover:bg-white/5 hover:text-white'}`}>
                                            <span className={`material-symbols-outlined text-[18px] ${mode === 'Code Assistant' ? 'text-primary' : ''}`}>code</span>
                                            Code Assistant
                                        </button>
                                        <button type="button" onClick={() => { setMode?.('Writer'); setIsModeOpen(false); }} className={`flex items-center gap-3 p-2.5 px-3 text-sm font-medium rounded-xl transition-colors text-left border ${mode === 'Writer' ? 'text-white bg-white/10 border-white/10 shadow-sm' : 'text-slate-400 bg-transparent border-transparent hover:bg-white/5 hover:text-white'}`}>
                                            <span className={`material-symbols-outlined text-[18px] ${mode === 'Writer' ? 'text-primary' : ''}`}>edit_document</span>
                                            Writer
                                        </button>
                                        <button type="button" onClick={() => { setMode?.('Web Search'); setIsModeOpen(false); }} className={`flex items-center gap-3 p-2.5 px-3 text-sm font-medium rounded-xl transition-colors text-left border ${mode === 'Web Search' ? 'text-white bg-white/10 border-white/10 shadow-sm' : 'text-slate-400 bg-transparent border-transparent hover:bg-white/5 hover:text-white'}`}>
                                            <span className={`material-symbols-outlined text-[18px] ${mode === 'Web Search' ? 'text-primary' : ''}`}>travel_explore</span>
                                            Web Search
                                        </button>
                                    </div>
                                )}

                                <button type="button" onClick={() => setIsModeOpen(!isModeOpen)} className={`relative flex items-center justify-center size-8 md:size-9 rounded-full transition-all ${isModeOpen ? 'text-primary bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Mode Selector">
                                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">tune</span>
                                    {mode !== 'General Chat' && (
                                        <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-surface-dark bg-primary"></span>
                                    )}
                                </button>
                                <button type="button" onClick={() => setIsUploadOpen(true)} disabled={isUploadingFile} className={`flex items-center justify-center size-8 md:size-9 rounded-full transition-all ${isUploadingFile ? 'text-primary animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Attach file">
                                    {isUploadingFile ? (
                                        <span className="material-symbols-outlined text-[18px] md:text-[20px] animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">add_link</span>
                                    )}
                                </button>
                                <button type="button" onClick={toggleListening} className={`flex items-center justify-center size-8 md:size-9 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Voice Input">
                                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">mic</span>
                                </button>
                            </div>
                            {isLoading ? (
                                <button
                                    type="button"
                                    className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/20 text-white hover:bg-white/10 transition-all shadow-lg group"
                                    title="Stop generating"
                                    onClick={() => window.stop()} // Temporary stop behavior until vercel 'stop' function is extracted
                                >
                                    <Square className="w-4 h-4 fill-white" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!((input || '').trim() || attachments.length > 0)}
                                    className="flex items-center justify-center size-10 rounded-full bg-white text-black hover:bg-gradient-gold transition-all shadow-lg send-btn-glow group disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Send message"
                                >
                                    <span className="material-symbols-outlined text-[20px] font-semibold group-hover:text-black">arrow_upward</span>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleFileUpload} />
        </form>
    );
}
