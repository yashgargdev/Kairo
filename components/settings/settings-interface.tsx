'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Key, Check, Trash2, ExternalLink, ChevronLeft,
  Shield, Zap, Settings, Cpu, Loader2, AlertCircle, CheckCircle2,
  ToggleLeft, ToggleRight, Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApiKeys, type ApiKeys } from '@/hooks/use-api-keys'
import { CHAT_MODELS, type ReasoningLevel, type SpeedLevel } from '@/lib/api/model-config'

// ─── Provider config ───────────────────────────────────────────────────────────
const PROVIDERS: {
  id: keyof ApiKeys
  name: string
  color: string
  border: string
  bg: string
  docsUrl: string
  keysUrl: string
  prefix: string
  models: string[]
  description: string
  testModelId: string   // routing ID used for live key test
}[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    docsUrl: 'https://docs.anthropic.com',
    keysUrl: 'https://console.anthropic.com/settings/keys',
    prefix: 'sk-ant-',
    models: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
    description: 'Powers Claude models — best for reasoning, coding, and analysis.',
    testModelId: 'claude-4-6-sonnet',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    docsUrl: 'https://platform.openai.com/docs',
    keysUrl: 'https://platform.openai.com/api-keys',
    prefix: 'sk-',
    models: ['GPT-4o', 'GPT-4o Mini', 'o3-mini', 'GPT-4-1'],
    description: 'Access GPT-4o, o3, and the latest OpenAI models.',
    testModelId: 'gpt-5.4-mini',
  },
  {
    id: 'google',
    name: 'Google AI',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    docsUrl: 'https://ai.google.dev/docs',
    keysUrl: 'https://aistudio.google.com/app/apikey',
    prefix: 'AIza',
    models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini 2.0 Flash'],
    description: 'Use Gemini models with 1M token context windows.',
    testModelId: 'gemini-2.5-pro',
  },
  {
    id: 'groq',
    name: 'Groq',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    docsUrl: 'https://console.groq.com/docs',
    keysUrl: 'https://console.groq.com/keys',
    prefix: 'gsk_',
    models: ['Llama 3.1 70B', 'Llama 3.1 8B', 'Mixtral 8x7B'],
    description: 'Blazing-fast inference for open-weight models.',
    testModelId: 'mixtral-8x7b-32768',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    docsUrl: 'https://docs.mistral.ai',
    keysUrl: 'https://console.mistral.ai/api-keys',
    prefix: '',
    models: ['Mistral Large', 'Mistral Small', 'Codestral'],
    description: 'European frontier models with strong coding capabilities.',
    testModelId: 'mistral-small',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
    docsUrl: 'https://openrouter.ai/docs',
    keysUrl: 'https://openrouter.ai/settings/keys',
    prefix: 'sk-or-',
    models: ['200+ models via one key', 'Auto-routing', 'Fallback support'],
    description: 'One key to access 200+ models from every provider.',
    testModelId: 'llama-3.1-70b',
  },
  {
    id: 'sarvam',
    name: 'Sarvam AI',
    color: 'text-teal-400',
    border: 'border-teal-500/20',
    bg: 'bg-teal-500/5',
    docsUrl: 'https://docs.sarvam.ai',
    keysUrl: 'https://dashboard.sarvam.ai',
    prefix: '',
    models: ['Sarvam-2B', 'Sarvam-1', 'Saaras v2', 'Bulbul v2'],
    description: 'Indian AI models with native support for 10+ Indian languages.',
    testModelId: 'sarvam-m',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
    docsUrl: 'https://platform.stability.ai/docs/api-reference',
    keysUrl: 'https://platform.stability.ai/account/keys',
    prefix: 'sk-',
    models: ['Stable Diffusion 3.5 Large', 'Stable Image Ultra', 'Stable Image Core'],
    description: 'Industry-leading image generation models from Stability AI.',
    testModelId: 'stable-image-core',
  },
]

// ─── Key row ───────────────────────────────────────────────────────────────────
type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

function ProviderKeyRow({ provider }: { provider: typeof PROVIDERS[number] }) {
  const { keys, saveKey, deleteKey } = useApiKeys()
  const [draft, setDraft] = useState(keys[provider.id] || '')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')

  const currentKey = keys[provider.id]
  const hasKey = !!currentKey
  const isDirty = draft !== currentKey

  const handleSave = useCallback(() => {
    saveKey(provider.id, draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [draft, provider.id, saveKey])

  const handleDelete = useCallback(() => {
    deleteKey(provider.id)
    setDraft('')
    setTestStatus('idle')
  }, [provider.id, deleteKey])

  const handleTest = useCallback(async () => {
    const key = draft.trim() || currentKey
    if (!key) return
    setTestStatus('testing')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          model: provider.testModelId,
          provider: provider.id,
          apiKey: key,
          maxTokens: 10,
        }),
      })
      if (!res.ok) {
        setTestStatus('error')
      } else {
        // Read one SSE chunk to confirm streaming started (not an error frame)
        const reader = res.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          let gotDelta = false
          outer: while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value)
            for (const line of text.split('\n')) {
              const t = line.trim()
              if (t.startsWith('data: ') && t !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(t.slice(6))
                  if (json.error) { setTestStatus('error'); reader.cancel(); return }
                  if (json.delta !== undefined) { gotDelta = true; break outer }
                } catch { /* */ }
              }
            }
          }
          reader.cancel()
          setTestStatus(gotDelta ? 'ok' : 'error')
        } else {
          setTestStatus('error')
        }
      }
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 4000)
  }, [draft, currentKey, provider])

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-200",
      provider.border,
      provider.bg
    )}>
      {/* Provider header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", provider.border, "bg-black/30")}>
            <Key className={cn("w-4 h-4", provider.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-display">{provider.name}</span>
              {hasKey && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{provider.description}</p>
          </div>
        </div>
        <a
          href={provider.keysUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex items-center gap-1 text-[11px] font-mono transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]", provider.color, "opacity-70 hover:opacity-100")}
        >
          Get key
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Models */}
      <div className="flex flex-wrap gap-1 mb-3">
        {provider.models.map(m => (
          <span key={m} className="text-[10px] font-mono text-zinc-600 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full">
            {m}
          </span>
        ))}
      </div>

      {/* Key input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={`${provider.prefix}••••••••••••••••••••`}
            className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 pr-10 text-sm font-mono text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!draft.trim() || !isDirty}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
            draft.trim() && isDirty
              ? "bg-amber-500 hover:bg-amber-400 text-black"
              : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
          )}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </button>

        {/* Test */}
        {(hasKey || draft.trim()) && (
          <button
            onClick={handleTest}
            disabled={testStatus === 'testing'}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border",
              testStatus === 'ok' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
              testStatus === 'error' ? "border-red-500/30 text-red-400 bg-red-500/10" :
              "border-white/[0.08] text-zinc-400 hover:bg-white/[0.05]"
            )}
          >
            {testStatus === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
             testStatus === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
             testStatus === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> :
             <Zap className="w-3.5 h-3.5" />}
            {testStatus === 'testing' ? 'Testing…' :
             testStatus === 'ok' ? 'Connected' :
             testStatus === 'error' ? 'Failed' : 'Test'}
          </button>
        )}

        {/* Delete */}
        {hasKey && (
          <button
            onClick={handleDelete}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.06] text-zinc-600 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
            title="Remove key"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({
  label, description, value, onChange
}: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
      </div>
      <button onClick={() => onChange(!value)} className="ml-4 shrink-0">
        {value
          ? <ToggleRight className="w-9 h-9 text-amber-400" />
          : <ToggleLeft className="w-9 h-9 text-zinc-600" />}
      </button>
    </div>
  )
}

// ─── Model stat helpers ────────────────────────────────────────────────────────
const REASONING_DOTS = 4
const SPEED_BOLTS    = 3

const REASONING_FILL: Record<ReasoningLevel, number> = {
  low: 1, medium: 2, high: 3, highest: 4,
}
const SPEED_FILL: Record<SpeedLevel, number> = {
  slow: 1, medium: 2, fast: 3, fastest: 3,
}
const REASONING_LABEL: Record<ReasoningLevel, string> = {
  low: 'Low', medium: 'Medium', high: 'High', highest: 'Highest',
}
const SPEED_LABEL: Record<SpeedLevel, string> = {
  slow: 'Slow', medium: 'Medium', fast: 'Fast', fastest: 'Fastest',
}

function ReasoningIndicator({ level }: { level: ReasoningLevel }) {
  const filled = REASONING_FILL[level]
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: REASONING_DOTS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i < filled ? "bg-amber-400" : "bg-white/10"
            )}
          />
        ))}
      </div>
      <span className="text-[9px] text-zinc-500 ml-0.5">{REASONING_LABEL[level]}</span>
    </div>
  )
}

function SpeedIndicator({ level }: { level: SpeedLevel }) {
  const filled = SPEED_FILL[level]
  const isFastest = level === 'fastest'
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: SPEED_BOLTS }).map((_, i) => (
          <Zap
            key={i}
            className={cn(
              "w-2.5 h-2.5 transition-colors",
              i < filled
                ? isFastest ? "text-amber-300 fill-amber-300" : "text-amber-500 fill-amber-500"
                : "text-white/10 fill-white/10"
            )}
            strokeWidth={0}
          />
        ))}
      </div>
      <span className="text-[9px] text-zinc-500 ml-0.5">{SPEED_LABEL[level]}</span>
    </div>
  )
}

function IOTag({ label }: { label: string }) {
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
      {label}
    </span>
  )
}

// ─── Main settings page ────────────────────────────────────────────────────────
export function SettingsInterface() {
  const { keys, settings, saveSetting, clearAll } = useApiKeys()
  const [activeTab, setActiveTab] = useState<'keys' | 'general' | 'privacy'>('keys')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const configuredCount = Object.values(keys).filter(Boolean).length

  const tabs = [
    { id: 'keys' as const, label: 'API Keys', icon: Key },
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.05] h-14 flex items-center px-4 sm:px-6">
        <Link
          href="/chat"
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mr-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to Chat</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45" />
            <Zap className="relative z-10 w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white text-sm">Kairo</span>
          <span className="text-zinc-700 text-sm mx-1">/</span>
          <span className="text-zinc-400 text-sm">Settings</span>
        </div>

        {configuredCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            {configuredCount} provider{configuredCount !== 1 ? 's' : ''} configured
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex gap-10 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 pt-10 pb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-2xl font-display font-black text-white mb-1">Settings</h1>
              <p className="text-xs text-zinc-600 leading-relaxed">
                API keys are stored only in your browser and never leave your device.
              </p>
            </motion.div>

            <nav className="flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
                    activeTab === tab.id
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Scrollable content ── */}
          <div className="flex-1 min-w-0 overflow-y-auto py-6 lg:py-10 lg:pr-2">
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-display font-black text-white mb-1">Settings</h1>
              <p className="text-sm text-zinc-500 mb-4">
                API keys are stored only in your browser. They never leave your device.
              </p>
              <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      activeTab === tab.id
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

        <AnimatePresence mode="wait">
          {/* ── API Keys tab ── */}
          {activeTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Security notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-blue-300 font-medium">End-to-end private</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    Keys are saved to <code className="text-zinc-400 font-mono">localStorage</code> in your browser only.
                    They are never sent to Kairo's servers (there are none). Clearing browser data removes all keys.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {PROVIDERS.map((provider, i) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProviderKeyRow provider={provider} />
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}

          {/* ── General tab ── */}
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Default model */}
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white font-display">Default Model</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {CHAT_MODELS.map(m => {
                    const isActive = settings.defaultModel === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => saveSetting('defaultModel', m.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-lg border text-left transition-all gap-2",
                          isActive
                            ? "border-amber-500/40 bg-amber-500/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                        )}
                      >
                        {/* Row 1: name + check */}
                        <div className="flex items-start justify-between w-full gap-2">
                          <div>
                            <span className={cn("text-xs font-semibold leading-tight", isActive ? "text-white" : "text-zinc-200")}>
                              {m.label}
                            </span>
                            <div className="text-[10px] text-zinc-600 mt-0.5">{m.group}</div>
                          </div>
                          {isActive && <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />}
                        </div>

                        {/* Row 2: reasoning + speed */}
                        {(m.reasoning || m.speed) && (
                          <div className="flex items-center gap-3 flex-wrap">
                            {m.reasoning && <ReasoningIndicator level={m.reasoning} />}
                            {m.speed     && <SpeedIndicator     level={m.speed} />}
                          </div>
                        )}

                        {/* Row 3: input → output */}
                        {(m.input || m.output) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.input?.map(t => <IOTag key={t} label={t} />)}
                            {m.input && m.output && (
                              <span className="text-[9px] text-zinc-700">→</span>
                            )}
                            {m.output?.map(t => <IOTag key={t} label={t} />)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* ── Privacy tab ── */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {[
                {
                  icon: Key,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/5 border-amber-500/15',
                  title: 'API Keys',
                  body: 'Your API keys are stored exclusively in your browser\'s localStorage. They are never transmitted to any server operated by Kairo. Each AI provider receives your key only when you make a direct request from your browser to their API.',
                },
                {
                  icon: Brain,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/5 border-purple-500/15',
                  title: 'Conversations',
                  body: 'All chat history is saved to localStorage in your browser. No conversation data is sent to Kairo. Your messages do go to the AI provider you selected (OpenAI, Anthropic, etc.) — governed by their respective privacy policies.',
                },
                {
                  icon: Shield,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/5 border-emerald-500/15',
                  title: 'No Analytics',
                  body: 'Kairo contains zero analytics, tracking pixels, or telemetry. There is no Kairo server receiving requests. The app is entirely client-side — open the network tab in DevTools to verify.',
                },
                {
                  icon: Zap,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/5 border-blue-500/15',
                  title: 'Open Source',
                  body: 'Every line of code is public. You can inspect exactly what the app does, run it locally, or self-host it. No black boxes.',
                },
              ].map(item => (
                <div key={item.title} className={cn("rounded-xl border p-4", item.bg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
                </div>
              ))}

              {/* Danger zone */}
              <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 mt-6">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Danger Zone</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Permanently delete all API keys, conversations, and settings stored in this browser.
                </p>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All Data
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-red-300">Are you sure? This cannot be undone.</span>
                    <button
                      onClick={() => { clearAll(); setShowClearConfirm(false) }}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold transition-all"
                    >
                      Yes, clear everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-400 text-xs hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>{/* scrollable main */}
      </div>
    </div>
  )
}
