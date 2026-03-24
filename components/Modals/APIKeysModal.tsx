'use client';

import { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';

const PROVIDERS = [
    { id: 'openai', name: 'OpenAI', icon: 'network_node', placeholder: 'sk-...' },
    { id: 'anthropic', name: 'Anthropic (Claude)', icon: 'psychology', placeholder: 'sk-ant-...' },
    { id: 'gemini', name: 'Google Gemini', icon: 'flare', placeholder: 'AIza...' },
    { id: 'sarvam', name: 'Sarvam AI', icon: 'language', placeholder: 'Enter Sarvam API Key' },
];

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

function maskKey(key: string): string {
    if (!key || key.length < 8) return key;
    return key.substring(0, 5) + '••••' + key.substring(key.length - 3);
}

export function APIKeysModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<Record<string, ConnectionStatus>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [modelCounts, setModelCounts] = useState<Record<string, number>>({});
    const [editingProvider, setEditingProvider] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});

    // Load keys and status from localStorage on open
    useEffect(() => {
        if (isOpen) {
            const loaded: Record<string, string> = {};
            const statusMap: Record<string, ConnectionStatus> = {};
            const counts: Record<string, number> = {};
            PROVIDERS.forEach(p => {
                const key = localStorage.getItem(`kairo_api_key_${p.id}`) || '';
                loaded[p.id] = key;
                // If key exists, mark as connected
                if (key) {
                    statusMap[p.id] = 'connected';
                    const models = JSON.parse(localStorage.getItem(`kairo_models_${p.id}`) || '[]');
                    counts[p.id] = models.length;
                } else {
                    statusMap[p.id] = 'idle';
                }
            });
            setKeys(loaded);
            setStatus(statusMap);
            setModelCounts(counts);
            setErrors({});
            setEditingProvider(null);
            setShowKey({});
        }
    }, [isOpen]);

    const handleConnect = async (providerId: string) => {
        const key = keys[providerId]?.trim();
        if (!key) return;

        setStatus(prev => ({ ...prev, [providerId]: 'connecting' }));
        setErrors(prev => ({ ...prev, [providerId]: '' }));

        try {
            // Step 1: Validate
            const validateRes = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: providerId, apiKey: key }),
            });
            const validateData = await validateRes.json();

            if (!validateData.valid) {
                setStatus(prev => ({ ...prev, [providerId]: 'error' }));
                setErrors(prev => ({ ...prev, [providerId]: validateData.error || 'Invalid API key.' }));
                return;
            }

            // Step 2: Fetch models
            const modelsRes = await fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: providerId, apiKey: key }),
            });
            const modelsData = await modelsRes.json();

            // Step 3: Save key + models to localStorage
            localStorage.setItem(`kairo_api_key_${providerId}`, key);
            localStorage.setItem(`kairo_models_${providerId}`, JSON.stringify(modelsData.models || []));

            setStatus(prev => ({ ...prev, [providerId]: 'connected' }));
            setModelCounts(prev => ({ ...prev, [providerId]: (modelsData.models || []).length }));
            setEditingProvider(null);

            // Dispatch event so Sidebar and Header can refresh
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('kairo-models-updated'));
        } catch (err: any) {
            setStatus(prev => ({ ...prev, [providerId]: 'error' }));
            setErrors(prev => ({ ...prev, [providerId]: 'Network error. Please try again.' }));
        }
    };

    const handleDisconnect = (providerId: string) => {
        localStorage.removeItem(`kairo_api_key_${providerId}`);
        localStorage.removeItem(`kairo_models_${providerId}`);
        setKeys(prev => ({ ...prev, [providerId]: '' }));
        setStatus(prev => ({ ...prev, [providerId]: 'idle' }));
        setModelCounts(prev => ({ ...prev, [providerId]: 0 }));
        setErrors(prev => ({ ...prev, [providerId]: '' }));

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('kairo-models-updated'));
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Connect Your API Keys">
            <div className="space-y-5">
                <div>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                        Kairo stores your keys <strong className="text-slate-300">locally in your browser</strong>. They are never sent to our database — only used to validate and fetch models from providers.
                    </p>

                    <div className="space-y-3">
                        {PROVIDERS.map((provider) => {
                            const currentStatus = status[provider.id] || 'idle';
                            const isConnected = currentStatus === 'connected';
                            const isConnecting = currentStatus === 'connecting';
                            const isError = currentStatus === 'error';
                            const isEditing = editingProvider === provider.id;
                            const hasKey = !!keys[provider.id];
                            const errorMsg = errors[provider.id];

                            return (
                                <div key={provider.id} className={`p-4 rounded-xl border transition-colors ${
                                    isConnected ? 'bg-emerald-500/[0.03] border-emerald-500/10' :
                                    isError ? 'bg-red-500/[0.03] border-red-500/10' :
                                    'bg-white/[0.02] border-white/5'
                                }`}>
                                    {/* Provider Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-purple-400 text-[18px]">{provider.icon}</span>
                                            <span className="text-sm font-medium text-white">{provider.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isConnected && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                    Connected
                                                </span>
                                            )}
                                            {isError && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined text-[12px]">error</span>
                                                    Error
                                                </span>
                                            )}
                                            {isConnecting && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                                                    Connecting...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Connected state: show masked key + actions */}
                                    {isConnected && !isEditing ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono">
                                                    {showKey[provider.id] ? keys[provider.id] : maskKey(keys[provider.id])}
                                                </div>
                                                <button
                                                    onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                                    className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                                                    title={showKey[provider.id] ? 'Hide key' : 'Show key'}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">{showKey[provider.id] ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-500">
                                                    {modelCounts[provider.id] || 0} models available
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingProvider(provider.id)}
                                                        className="text-[11px] text-slate-500 hover:text-purple-400 transition-colors font-medium"
                                                    >
                                                        Update key
                                                    </button>
                                                    <button
                                                        onClick={() => handleDisconnect(provider.id)}
                                                        className="text-[11px] text-red-500/70 hover:text-red-400 transition-colors font-medium"
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Input + Connect state */
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="password"
                                                    name={`apiKey-${provider.id}`}
                                                    autoComplete="new-password"
                                                    autoCorrect="off"
                                                    spellCheck="false"
                                                    value={keys[provider.id] || ''}
                                                    onChange={(e) => setKeys({ ...keys, [provider.id]: e.target.value })}
                                                    placeholder={provider.placeholder}
                                                    disabled={isConnecting}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono disabled:opacity-50"
                                                />
                                                <button
                                                    onClick={() => handleConnect(provider.id)}
                                                    disabled={isConnecting || !keys[provider.id]?.trim()}
                                                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all min-w-[90px] bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                                >
                                                    {isConnecting ? (
                                                        <>
                                                            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                                            Validating
                                                        </>
                                                    ) : (
                                                        'Connect'
                                                    )}
                                                </button>
                                            </div>
                                            {isEditing && (
                                                <button
                                                    onClick={() => setEditingProvider(null)}
                                                    className="text-[11px] text-slate-500 hover:text-white transition-colors"
                                                >
                                                    ← Cancel
                                                </button>
                                            )}
                                            {isError && errorMsg && (
                                                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-[13px]">warning</span>
                                                    {errorMsg}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}
