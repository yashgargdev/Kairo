'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'kairo-api-keys'
const SETTINGS_KEY = 'kairo-settings'

export interface ApiKeys {
  openai: string
  anthropic: string
  google: string
  groq: string
  mistral: string
  openrouter: string
  sarvam: string
  stability: string
}

export interface AppSettings {
  defaultModel: string
  defaultProvider: string
  streamingEnabled: boolean
  showThinking: boolean
  fontSize: 'sm' | 'base' | 'lg'
}

const DEFAULT_KEYS: ApiKeys = {
  openai: '',
  anthropic: '',
  google: '',
  groq: '',
  mistral: '',
  openrouter: '',
  sarvam: '',
  stability: '',
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
    try {
      const storedKeys = localStorage.getItem(STORAGE_KEY)
      if (storedKeys) setKeys({ ...DEFAULT_KEYS, ...JSON.parse(storedKeys) })
      const storedSettings = localStorage.getItem(SETTINGS_KEY)
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) })
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  const saveKey = useCallback((provider: keyof ApiKeys, value: string) => {
    setKeys(prev => {
      const updated = { ...prev, [provider]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteKey = useCallback((provider: keyof ApiKeys) => {
    setKeys(prev => {
      const updated = { ...prev, [provider]: '' }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const saveSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setKeys(DEFAULT_KEYS)
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  }, [])

  return { keys, settings, hydrated, saveKey, deleteKey, saveSetting, clearAll }
}
