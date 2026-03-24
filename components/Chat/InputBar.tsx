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
    const [isListening, setIsListening] = useState(false);
    const router = useRouter();

    const handleFileUpload = async (file: File) => {
        setIsUploadingFile(true);
        try {
            if (file.type.startsWith('image/')) {
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
                className="rounded-2xl flex flex-col relative z-20 transition-all duration-300 group/input bg-[#1A1A1A] border border-white/[0.06] shadow-[0_8px_40px_rgb(0,0,0,0.8)] backdrop-blur-xl focus-within:border-purple-500/20 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.08)]"
            >
                {isAuthenticated === false ? (
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl space-y-3 z-30 min-h-[100px]">
                        <p className="text-slate-400 text-[13px] font-medium tracking-wide">Sign in to start chatting with AI.</p>
                        <button type="button" onClick={() => router.push('/login')} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
                            Sign in to chat
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Attachments & Images Area */}
                        {(attachments.length > 0 || images.length > 0) && (
                            <div className="flex flex-wrap gap-2 px-4 pt-4 pb-0">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 flex-shrink-0 rounded-lg border border-white/5 text-[13px] text-slate-200">
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
                                {images.map((imgBase64, idx) => (
                                    <div key={`img-${idx}`} className="relative group w-14 h-14 rounded-lg border border-white/10 overflow-hidden shrink-0">
                                        <img src={imgBase64} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImages?.(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 p-0.5 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end px-2 py-2 gap-2">
                            {/* Left Actions */}
                            <div className="flex items-center gap-1 pb-1 pl-1">
                                <button type="button" onClick={() => setIsUploadOpen(true)} disabled={isUploadingFile} className={`flex items-center justify-center size-9 rounded-full transition-all ${isUploadingFile ? 'text-purple-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Attach file">
                                    {isUploadingFile ? (
                                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[22px]">add</span>
                                    )}
                                </button>
                            </div>

                            {/* Text Input */}
                            <div className={`flex-1 flex items-center ${attachments.length > 0 || images.length > 0 ? 'py-1' : 'py-2'}`}>
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={onKeyDown}
                                    className="w-full bg-transparent text-white placeholder-slate-500 px-2 py-1.5 focus:outline-none focus:ring-0 resize-none overflow-hidden max-h-48 text-[15px] leading-relaxed font-light"
                                    placeholder="Ask anything..."
                                    rows={1}
                                    style={{ minHeight: '32px' }}
                                />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-1 pb-1 pr-1">
                                <button type="button" onClick={toggleListening} className={`flex items-center justify-center size-9 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Voice Input">
                                    <span className="material-symbols-outlined text-[20px]">mic</span>
                                </button>
                                
                                {isLoading ? (
                                    <button
                                        type="button"
                                        className="flex items-center justify-center size-9 rounded-full bg-surface-dark border border-white/20 text-white hover:bg-white/10 transition-all shadow-lg group ml-1"
                                        title="Stop generating"
                                        onClick={() => window.stop()}
                                    >
                                        <Square className="w-3.5 h-3.5 fill-white" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!((input || '').trim() || attachments.length > 0)}
                                        className="flex items-center justify-center size-[38px] rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 transition-all shadow-md group disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                                        title="Send message"
                                    >
                                        <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleFileUpload} />
        </form>
    );
}
