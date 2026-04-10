'use client'

import { useState, useEffect, useCallback } from 'react'

const SETTINGS_KEY = 'kairo-settings'

// Key presence status — the actual key values live in httpOnly cookies, never client-side
export interface ApiKeys {
  openai: boolean
  anthropic: boolean
  google: boolean
  groq: boolean
  mistral: boolean
  openrouter: boolean
  sarvam: boolean
  stability: boolean
}

export interface AppSettings {
  defaultModel: string
  defaultProvider: string
  streamingEnabled: boolean
  showThinking: boolean
  fontSize: 'sm' | 'base' | 'lg'
}

const DEFAULT_KEYS: ApiKeys = {
  openai: false,
  anthropic: false,
  google: false,
  groq: false,
  mistral: false,
  openrouter: false,
  sarvam: false,
  stability: false,
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'claude-4-6-sonnet',
  defaultProvider: 'anthropic',
  streamingEnabled: true,
  showThinking: true,
  fontSize: 'base',
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>(DEFAULT_KEYS)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Fetch which providers have a key set (boolean map, no actual key values)
    fetch('/api/keys')
      .then(r => r.json())
      .then((status: Partial<ApiKeys>) => setKeys({ ...DEFAULT_KEYS, ...status }))
      .catch(() => {})

    // Settings remain in localStorage (no secrets)
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY)
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) })
    } catch { /* ignore */ }

    setHydrated(true)
  }, [])

  const saveKey = useCallback(async (provider: keyof ApiKeys, value: string) => {
    await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key: value }),
    })
    setKeys(prev => ({ ...prev, [provider]: true }))
  }, [])

  const deleteKey = useCallback(async (provider: keyof ApiKeys) => {
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    })
    setKeys(prev => ({ ...prev, [provider]: false }))
  }, [])

  const saveSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(async () => {
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setKeys(DEFAULT_KEYS)
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(SETTINGS_KEY)
  }, [])

  return { keys, settings, hydrated, saveKey, deleteKey, saveSetting, clearAll }
}
