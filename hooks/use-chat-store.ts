'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Conversation, Message } from '@/types/chat'

const STORAGE_KEY = 'kairo-conversations'

function genId() {
  return Math.random().toString(36).substring(2, 11)
}

function parseConversations(raw: string): Conversation[] {
  return JSON.parse(raw).map((c: Conversation) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    messages: c.messages.map((m: Message) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  }))
}

function persist(conversations: Conversation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch { /* storage full */ }
}

export function useChatStore() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const loaded = parseConversations(stored)
        setConversations(loaded)
        if (loaded.length > 0) setCurrentId(loaded[0].id)
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  const currentConversation = conversations.find(c => c.id === currentId) ?? null

  const createConversation = useCallback((model: string): string => {
    const id = genId()
    const newConv: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
    }
    setConversations(prev => {
      const updated = [newConv, ...prev]
      persist(updated)
      return updated
    })
    setCurrentId(id)
    return id
  }, [])

  const addMessage = useCallback((conversationId: string, message: Omit<Message, 'id'>): string => {
    const id = genId()
    const newMsg: Message = { ...message, id }
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== conversationId) return c
        const msgs = [...c.messages, newMsg]
        return {
          ...c,
          messages: msgs,
          title: c.messages.length === 0
            ? message.content.slice(0, 60) + (message.content.length > 60 ? '…' : '')
            : c.title,
          updatedAt: new Date(),
        }
      })
      persist(updated)
      return updated
    })
    return id
  }, [])

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== conversationId) return c
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, ...updates } : m),
          updatedAt: new Date(),
        }
      })
      persist(updated)
      return updated
    })
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id)
      persist(updated)
      return updated
    })
    setCurrentId(prev => {
      if (prev !== id) return prev
      const remaining = conversations.filter(c => c.id !== id)
      return remaining[0]?.id ?? null
    })
  }, [conversations])

  // Remove a message and everything after it in the conversation
  const truncateFrom = useCallback((conversationId: string, messageId: string) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== conversationId) return c
        const idx = c.messages.findIndex(m => m.id === messageId)
        if (idx === -1) return c
        return { ...c, messages: c.messages.slice(0, idx), updatedAt: new Date() }
      })
      persist(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setConversations([])
    setCurrentId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    conversations,
    currentConversation,
    currentId,
    hydrated,
    setCurrentId,
    createConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    truncateFrom,
    clearAll,
  }
}
