'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toggleChatShare } from '@/app/chat/actions';
import { useUI, ModelInfo } from './Providers/UIProvider';
import { motion, AnimatePresence } from 'framer-motion';

const PROVIDER_ICONS: Record<string, string> = {
    'OpenAI': 'network_node',
    'Anthropic': 'psychology',
    'Google': 'flare',
    'Sarvam AI': 'language',
};

// Fallback models shown when no keys are connected (so the UI isn't empty)
const FALLBACK_MODELS: ModelInfo[] = [
    { id: 'gpt-4o', name: 'gpt-4o', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'OpenAI' },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
    { id: 'sarvam-30b', name: 'Sarvam-30B', provider: 'Sarvam AI' },
    { id: 'sarvam-105b', name: 'Sarvam-105B', provider: 'Sarvam AI' },
    { id: 'sarvam-m', name: 'Sarvam-M', provider: 'Sarvam AI' },
];

export default function Header() {
    const [shareCopied, setShareCopied] = useState(false);
    const [shareError, setShareError] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const params = useParams();
    const chatId = params?.id as string;
    const { toggleMobileMenu, selectedModel, setSelectedModel, availableModels, connectedProviders } = useUI();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!chatId || chatId === 'new') {
            setShareError(true);
            setTimeout(() => setShareError(false), 3000);
            return;
        }

        try {
            const result = await toggleChatShare(chatId, true);
            if (!result.success) {
                console.error('Failed to update share status:', result.error);
            }

            await navigator.clipboard.writeText(window.location.href);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Use dynamic models if available, otherwise fallback
    const modelsToShow = availableModels.length > 0 ? availableModels : FALLBACK_MODELS;

    // Group models by provider
    const groupedModels: Record<string, ModelInfo[]> = {};
    modelsToShow.forEach(m => {
        if (!groupedModels[m.provider]) groupedModels[m.provider] = [];
        groupedModels[m.provider].push(m);
    });

    const activeModel = modelsToShow.find(m => m.id === selectedModel) || modelsToShow[0];

    // Check if a provider is connected
    const providerIdMap: Record<string, string> = {
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Google': 'google',
        'Sarvam AI': 'sarvam',
    };

    const isProviderConnected = (providerName: string): boolean => {
        const pid = providerIdMap[providerName];
        if (!pid) return false;
        // Check if we have a key (via connectedProviders from UIProvider or fallback to localStorage)
        return connectedProviders.includes(pid) || !!localStorage.getItem(`kairo_api_key_${pid}`);
    };

    return (
        <header className="h-14 px-4 md:px-8 flex items-center justify-between absolute top-0 w-full z-30 bg-transparent">
            {/* Center Share Error Warning */}
            <AnimatePresence>
                {shareError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full z-50 shadow-[0_0_15px_rgba(239,68,68,0.1)] backdrop-blur-md pointer-events-none"
                    >
                        <span className="material-symbols-outlined text-[14px] text-red-500">warning</span>
                        <span className="text-red-500 text-[11px] font-medium tracking-wide">Please send a message first to share this chat.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Side: Mobile Menu & Model Selector */}
            <div className="flex items-center gap-3 flex-1">
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-slate-400 hover:text-white transition-colors flex items-center"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                
                {/* Model Selector Dropdown */}
                <div className="relative flex items-center gap-2" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:bg-white/5 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-[16px] text-purple-400 group-hover:text-purple-300">
                            {PROVIDER_ICONS[activeModel?.provider] || 'smart_toy'}
                        </span>
                        <div className="flex flex-col items-start">
                            <span className="text-[13px] font-medium text-slate-300 group-hover:text-white tracking-wide">{activeModel?.name || selectedModel}</span>
                            <span className="text-[9px] text-slate-600 font-medium">Your Key</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400 transition-colors">
                            {isDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full mt-2 left-0 w-72 bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50 backdrop-blur-3xl max-h-[70vh] overflow-y-auto">
                            {Object.entries(groupedModels).map(([providerName, models]) => {
                                const connected = isProviderConnected(providerName);
                                return (
                                    <div key={providerName}>
                                        {/* Provider Section Header */}
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-[14px] ${connected ? 'text-purple-400' : 'text-slate-600'}`}>
                                                    {PROVIDER_ICONS[providerName] || 'smart_toy'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{providerName}</span>
                                            </div>
                                            {connected ? (
                                                <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Your Key
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-medium text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded-full">
                                                    Connect API key
                                                </span>
                                            )}
                                        </div>
                                        {/* Model List */}
                                        {models.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    if (connected || availableModels.length === 0) {
                                                        setSelectedModel(model.id);
                                                        setIsDropdownOpen(false);
                                                    }
                                                }}
                                                disabled={!connected && availableModels.length > 0}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                                                    selectedModel === model.id
                                                        ? 'bg-purple-500/10 text-purple-400'
                                                        : (!connected && availableModels.length > 0)
                                                            ? 'text-slate-600 cursor-not-allowed'
                                                            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                <span className="font-medium truncate">{model.name}</span>
                                                {selectedModel === model.id && (
                                                    <span className="material-symbols-outlined text-[16px] shrink-0">check</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Share */}
            <div className="flex items-center justify-end gap-4 flex-1">
                <button
                    onClick={handleShare}
                    className="text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                    title={shareCopied ? "Link copied!" : "Share chat"}
                >
                    <span className="material-symbols-outlined text-[18px]">{shareCopied ? 'check' : 'share'}</span>
                </button>
            </div>
        </header>
    );
}
