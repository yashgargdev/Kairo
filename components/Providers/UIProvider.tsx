'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
}

interface UIContextType {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    availableModels: ModelInfo[];
    connectedProviders: string[];
    refreshModels: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const PROVIDER_IDS = ['openai', 'anthropic', 'gemini', 'sarvam'];

export function UIProvider({ children }: { children: ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
    const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

    const loadModelsFromStorage = useCallback(() => {
        const allModels: ModelInfo[] = [];
        const connected: string[] = [];

        PROVIDER_IDS.forEach(pid => {
            const key = localStorage.getItem(`kairo_api_key_${pid}`);
            if (key) {
                connected.push(pid);
                try {
                    const models: ModelInfo[] = JSON.parse(localStorage.getItem(`kairo_models_${pid}`) || '[]');
                    allModels.push(...models);
                } catch {
                    // Silently skip corrupt data
                }
            }
        });

        setAvailableModels(allModels);
        setConnectedProviders(connected);
    }, []);

    // Load on mount
    useEffect(() => {
        const storedModel = localStorage.getItem('kairo_selected_model');
        if (storedModel) setSelectedModel(storedModel);

        loadModelsFromStorage();
    }, [loadModelsFromStorage]);

    // Listen for model updates (from APIKeysModal or other tabs)
    useEffect(() => {
        const handler = () => loadModelsFromStorage();
        window.addEventListener('storage', handler);
        window.addEventListener('kairo-models-updated', handler);
        return () => {
            window.removeEventListener('storage', handler);
            window.removeEventListener('kairo-models-updated', handler);
        };
    }, [loadModelsFromStorage]);

    const handleSetSelectedModel = (model: string) => {
        setSelectedModel(model);
        localStorage.setItem('kairo_selected_model', model);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    return (
        <UIContext.Provider value={{
            isMobileMenuOpen,
            setIsMobileMenuOpen,
            toggleMobileMenu,
            selectedModel,
            setSelectedModel: handleSetSelectedModel,
            availableModels,
            connectedProviders,
            refreshModels: loadModelsFromStorage,
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
