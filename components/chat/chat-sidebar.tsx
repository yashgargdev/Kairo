'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Trash2, Zap, ChevronLeft, ChevronRight, Settings, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/chat'

interface ChatSidebarProps {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Past 7 Days', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const c of conversations) {
    const d = new Date(c.updatedAt)
    if (d >= today) groups[0].items.push(c)
    else if (d >= yesterday) groups[1].items.push(c)
    else if (d >= weekAgo) groups[2].items.push(c)
    else groups[3].items.push(c)
  }

  return groups.filter(g => g.items.length > 0)
}

function SidebarContent({
  conversations, currentId, onSelect, onCreate, onDelete,
  collapsed, onToggleCollapse, onMobileClose, isMobile = false,
}: Omit<ChatSidebarProps, 'mobileOpen'> & { isMobile?: boolean }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const groups = groupByDate(conversations)
  const show = isMobile ? true : !collapsed

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-white/[0.05] shrink-0">
        <AnimatePresence mode="wait">
          {show ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45" />
                <Zap className="relative z-10 w-3.5 h-3.5 text-black" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-white text-sm truncate">Kairo</span>
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45" />
                <Zap className="relative z-10 w-3.5 h-3.5 text-black" strokeWidth={2.5} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile ? (
          <button onClick={onMobileClose}
            className="ml-1 w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        ) : show ? (
          <button onClick={onToggleCollapse}
            className="ml-1 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-colors shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* New chat */}
      <div className="px-2 py-2 shrink-0">
        <button
          onClick={() => { onCreate(); if (isMobile) onMobileClose() }}
          className={cn(
            "flex items-center gap-2 rounded-lg transition-all duration-150 text-sm font-medium",
            "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20",
            !show ? "w-full justify-center px-2 py-2" : "w-full px-3 py-2"
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {show && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4 scrollbar-hide">
        {conversations.length === 0 ? (
          show && (
            <div className="text-center py-8">
              <MessageSquare className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-700 font-mono">No conversations yet</p>
            </div>
          )
        ) : (
          groups.map(group => (
            <div key={group.label}>
              {show && (
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider px-1 mb-1">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map(conv => (
                  <div key={conv.id} className="relative group/item"
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => { onSelect(conv.id); if (isMobile) onMobileClose() }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-all duration-150",
                        currentId === conv.id ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
                        !show && "justify-center"
                      )}
                      title={!show ? conv.title : undefined}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      {show && <span className="text-xs truncate flex-1 pr-4">{conv.title}</span>}
                    </button>
                    {show && hoveredId === conv.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.05] px-2 py-2 shrink-0 space-y-0.5">
        <Link href="/" onClick={() => isMobile && onMobileClose()}
          className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors", !show && "justify-center")}
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          {show && <span className="text-xs">Home</span>}
        </Link>
        <Link href="/settings" onClick={() => isMobile && onMobileClose()}
          className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors", !show && "justify-center")}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          {show && <span className="text-xs">API Keys & Settings</span>}
        </Link>
      </div>

      {/* Expand handle (desktop collapsed) */}
      {!isMobile && collapsed && (
        <button onClick={onToggleCollapse}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-10 bg-[#111] border border-white/[0.08] rounded-r-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-[#1a1a1a] transition-colors z-10"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export function ChatSidebar(props: ChatSidebarProps) {
  const { mobileOpen, onMobileClose } = props

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: props.collapsed ? 56 : 256 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden lg:flex flex-col h-full bg-[#0a0a0a] border-r border-white/[0.05] shrink-0 overflow-hidden"
      >
        <SidebarContent {...props} isMobile={false} />
      </motion.aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#0a0a0a] border-r border-white/[0.05]"
      >
        <SidebarContent {...props} isMobile={true} />
      </motion.aside>
    </>
  )
}
