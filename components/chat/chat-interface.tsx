'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Zap, Settings, KeyRound, Menu } from 'lucide-react'
import Link from 'next/link'
import { useChatStore } from '@/hooks/use-chat-store'
import { useApiKeys } from '@/hooks/use-api-keys'
import { getProvider, PROVIDER_NAMES } from '@/lib/api/model-config'
import { streamChat } from '@/lib/api/chat-client'
import { parseThinking } from '@/lib/api/parse-thinking'
import { ChatSidebar } from './chat-sidebar'
import { MessageBubble } from './message-bubble'
import { AIInput } from '@/components/ui/animated-ai-input'
import type { ChatMessage } from '@/lib/api/chat-client'

// ── No-key banner ──────────────────────────────────────────────────────────────
function NoKeyBanner({ provider, modelId }: { provider: string; modelId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 max-w-lg"
    >
      <KeyRound className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-300 font-medium mb-1">
          No {PROVIDER_NAMES[provider as keyof typeof PROVIDER_NAMES] ?? provider} API key found
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          To use <span className="text-zinc-300 font-mono">{modelId}</span> you need to add a{' '}
          {PROVIDER_NAMES[provider as keyof typeof PROVIDER_NAMES] ?? provider} API key in Settings.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Open Settings
        </Link>
      </div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ChatInterface() {
  const store = useChatStore()
  const { keys, settings } = useApiKeys()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [store.currentConversation?.messages, scrollToBottom])

  const handleNewChat = useCallback(() => {
    store.createConversation('claude-3-5-sonnet')
  }, [store])

  // ── Image generation ─────────────────────────────────────────────────────────
  const handleImageGen = useCallback(async (prompt: string, modelId: string, convId: string) => {
    const provider = getProvider(modelId)
    const apiKey = keys[provider]

    if (!apiKey) {
      store.addMessage(convId, { role: 'assistant', content: '', model: modelId, timestamp: new Date(), noKey: true, noKeyProvider: provider })
      return
    }

    setIsResponding(true)

    // Placeholder with generating spinner
    const aiMsgId = store.addMessage(convId, {
      role: 'assistant', content: '', model: modelId,
      timestamp: new Date(), isStreaming: true,
      toolResults: [{ id: 'img-gen', type: 'image', title: 'Generating image…', imagePrompt: prompt }],
    })

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelId, apiKey }),
      })
      const data = await res.json()

      if (data.error) {
        store.updateMessage(convId, aiMsgId, {
          isStreaming: false, errorMessage: `Image generation failed: ${data.error}`,
          toolResults: [],
        })
      } else {
        // Resolve URL — either direct URL or convert base64 to data URI
        const imageUrl = data.url ?? (data.base64 ? `data:${data.mimeType};base64,${data.base64}` : '')
        store.updateMessage(convId, aiMsgId, {
          isStreaming: false,
          toolResults: [{
            id: 'img-gen', type: 'image',
            title: 'Generated Image',
            imageUrl,
            imagePrompt: data.revisedPrompt ?? prompt,
          }],
        })
      }
    } catch {
      store.updateMessage(convId, aiMsgId, { isStreaming: false, errorMessage: 'Network error during image generation.', toolResults: [] })
    }
    setIsResponding(false)
  }, [store, keys])

  const handleRetry = useCallback(async (assistantMsgId: string, modelId: string) => {
    if (isResponding) return
    const convId = store.currentId
    if (!convId) return

    const messages = store.currentConversation?.messages ?? []
    const assistantIdx = messages.findIndex(m => m.id === assistantMsgId)
    if (assistantIdx === -1) return

    // Find the user message immediately before this assistant message
    const userMsg = [...messages].slice(0, assistantIdx).reverse().find(m => m.role === 'user')
    if (!userMsg) return

    // Remove the assistant message (and anything after it) from store
    store.truncateFrom(convId, assistantMsgId)

    // Re-run the API call with the existing history
    const provider = getProvider(modelId)
    const apiKey = keys[provider]

    if (!apiKey) {
      store.addMessage(convId, {
        role: 'assistant', content: '', model: modelId,
        timestamp: new Date(), noKey: true, noKeyProvider: provider,
      })
      return
    }

    setIsResponding(true)

    const history: ChatMessage[] = messages
      .slice(0, assistantIdx)
      .filter(m => !m.noKey && !m.errorMessage && m.content.trim() !== '')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const aiMsgId = store.addMessage(convId, {
      role: 'assistant', content: '', model: modelId,
      timestamp: new Date(), isStreaming: true,
    })

    let accumulated = ''
    const thinkStepId = Math.random().toString(36).slice(2)
    const streamingEnabled = settings.streamingEnabled

    await streamChat(history, modelId, provider, apiKey, {
      onDelta(chunk) {
        accumulated += chunk
        if (!streamingEnabled) return
        const parsed = parseThinking(accumulated)
        const thinkingSteps = parsed.hasThink ? [{
          id: thinkStepId, type: 'thinking' as const, label: 'Thinking',
          content: parsed.thinkContent,
          status: parsed.thinkingDone ? 'done' as const : 'active' as const,
        }] : undefined
        store.updateMessage(convId!, aiMsgId, {
          content: parsed.mainContent, thinking: thinkingSteps,
          isThinking: parsed.hasThink && !parsed.thinkingDone, isStreaming: true,
        })
      },
      onDone() {
        const parsed = parseThinking(accumulated)
        const thinkingSteps = parsed.hasThink ? [{
          id: thinkStepId, type: 'thinking' as const, label: 'Thinking',
          content: parsed.thinkContent, status: 'done' as const,
        }] : undefined
        store.updateMessage(convId!, aiMsgId, {
          content: parsed.mainContent, thinking: thinkingSteps,
          isThinking: false, isStreaming: false,
        })
        setIsResponding(false)
      },
      onError(err) {
        store.updateMessage(convId!, aiMsgId, { content: '', isStreaming: false, errorMessage: err })
        setIsResponding(false)
      },
    })
  }, [store, keys, settings, isResponding])

  const handleSend = useCallback(async (text: string, modelId: string, tools: string[] = []) => {
    if (isResponding) return

    let convId = store.currentId
    if (!convId) convId = store.createConversation(modelId)

    // Add user message
    store.addMessage(convId, { role: 'user', content: text, timestamp: new Date() })

    // ── Image generation path ──────────────────────────────────────────────────
    if (tools.includes('image')) {
      await handleImageGen(text, modelId, convId)
      return
    }

    const provider = getProvider(modelId)
    const apiKey = keys[provider]

    // No key? Show error message bubble instead of calling API
    if (!apiKey) {
      store.addMessage(convId, {
        role: 'assistant',
        content: '',
        model: modelId,
        timestamp: new Date(),
        noKey: true,
        noKeyProvider: provider,
      })
      return
    }

    setIsResponding(true)

    // Build message history for context — skip error/noKey/empty placeholder messages
    const history: ChatMessage[] = (store.currentConversation?.messages ?? [])
      .filter(m => !m.noKey && !m.errorMessage && m.content.trim() !== '')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    history.push({ role: 'user', content: text })

    // Add streaming assistant placeholder
    const aiMsgId = store.addMessage(convId, {
      role: 'assistant',
      content: '',
      model: modelId,
      timestamp: new Date(),
      isStreaming: true,
    })

    let accumulated = ''
    const thinkStepId = Math.random().toString(36).slice(2)
    const streamingEnabled = settings.streamingEnabled

    await streamChat(history, modelId, provider, apiKey, {
      onDelta(chunk) {
        accumulated += chunk
        if (!streamingEnabled) return  // buffer — update only on done

        const parsed = parseThinking(accumulated)
        const thinkingSteps = parsed.hasThink ? [{
          id: thinkStepId,
          type: 'thinking' as const,
          label: 'Thinking',
          content: parsed.thinkContent,
          status: parsed.thinkingDone ? 'done' as const : 'active' as const,
        }] : undefined

        store.updateMessage(convId!, aiMsgId, {
          content: parsed.mainContent,
          thinking: thinkingSteps,
          isThinking: parsed.hasThink && !parsed.thinkingDone,
          isStreaming: true,
        })
      },
      onDone() {
        const parsed = parseThinking(accumulated)
        const thinkingSteps = parsed.hasThink ? [{
          id: thinkStepId,
          type: 'thinking' as const,
          label: 'Thinking',
          content: parsed.thinkContent,
          status: 'done' as const,
        }] : undefined

        store.updateMessage(convId!, aiMsgId, {
          content: parsed.mainContent,
          thinking: thinkingSteps,
          isThinking: false,
          isStreaming: false,
        })
        setIsResponding(false)
      },
      onError(err) {
        store.updateMessage(convId!, aiMsgId, {
          content: '',
          isStreaming: false,
          errorMessage: err,
        })
        setIsResponding(false)
      },
    })
  }, [store, keys, settings, isResponding, handleImageGen])

  const messages = store.currentConversation?.messages ?? []

  // Use the model from the last assistant message in the conversation (if any)
  const lastUsedModel = [...messages].reverse().find(m => m.role === 'assistant' && m.model)?.model
  const activeModel = lastUsedModel ?? settings.defaultModel

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      <ChatSidebar
        conversations={store.conversations}
        currentId={store.currentId}
        onSelect={store.setCurrentId}
        onCreate={handleNewChat}
        onDelete={store.deleteConversation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-white/[0.05] shrink-0 bg-[#080808]">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors mr-3"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45" />
              <Zap className="relative z-10 w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-sm">Kairo</span>
          </div>
          <Link href="/settings" className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {messages.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="relative w-14 h-14 mx-auto mb-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500 rounded-2xl rotate-45" />
                <Zap className="relative z-10 w-7 h-7 text-black" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-display font-black text-white mb-2">What can I help with?</h1>
              <p className="text-zinc-500 text-sm">
                Select a model, add your API key in{' '}
                <Link href="/settings" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                  Settings
                </Link>
                , then start chatting.
              </p>
            </motion.div>

            <div className="w-full max-w-2xl">
              <AIInput onSend={handleSend} disabled={isResponding} defaultModelId={settings.defaultModel} />
            </div>
          </div>
        ) : (
          /* ── Chat view ── */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-2xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map(msg => {
                    // No-key error message
                    const m = msg
                    if (m.noKey && m.noKeyProvider) {
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-6">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
                          </div>
                          <NoKeyBanner provider={m.noKeyProvider} modelId={msg.model ?? ''} />
                        </motion.div>
                      )
                    }
                    if (m.errorMessage) {
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-6">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
                          </div>
                          <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 max-w-lg">
                            <p className="text-xs text-red-400 font-mono leading-relaxed">{m.errorMessage}</p>
                          </div>
                        </motion.div>
                      )
                    }
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        showThinking={settings.showThinking}
                        fontSize={settings.fontSize}
                        onRetry={msg.role === 'assistant' && msg.model
                          ? () => handleRetry(msg.id, msg.model!)
                          : undefined}
                      />
                    )
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
              <div className="max-w-2xl mx-auto">
                <AIInput onSend={handleSend} disabled={isResponding} defaultModelId={activeModel} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
