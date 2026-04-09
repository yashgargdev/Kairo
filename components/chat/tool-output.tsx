'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, StickyNote, Copy, Check, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToolResult } from '@/types/chat'
import { MermaidDiagram } from './mermaid-diagram'

interface ToolOutputProps {
  result: ToolResult
}

export function ToolOutput({ result }: ToolOutputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3"
    >
      {result.type === 'diagram' && result.mermaidCode && (
        <MermaidDiagram code={result.mermaidCode} title={result.title} />
      )}
      {result.type === 'image' && (
        <ImageOutput result={result} />
      )}
      {result.type === 'note' && result.noteContent && (
        <NoteOutput result={result} />
      )}
      {result.type === 'code' && result.code && (
        <CodeOutput result={result} />
      )}
    </motion.div>
  )
}

function ImageOutput({ result }: ToolOutputProps) {
  return (
    <div className="rounded-xl border border-pink-500/15 bg-[#0d0d0d] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-pink-500/10 flex items-center justify-center">
            <ImageIcon className="w-3 h-3 text-pink-400" />
          </div>
          <span className="text-xs font-mono text-zinc-300 font-medium">{result.title}</span>
        </div>
        {result.imageUrl && (
          <a
            href={result.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/[0.05]"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        )}
      </div>
      <div className="p-3">
        {result.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={result.imageUrl}
            alt={result.imagePrompt ?? result.title}
            className="w-full rounded-lg object-cover max-h-[400px]"
          />
        ) : (
          /* Placeholder while generating */
          <div className="w-full h-48 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/10 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
            <span className="text-xs font-mono text-pink-400/70">Generating image…</span>
          </div>
        )}
        {result.imagePrompt && (
          <p className="mt-2 text-[11px] text-zinc-600 font-mono leading-relaxed">
            <span className="text-zinc-500">Prompt: </span>{result.imagePrompt}
          </p>
        )}
      </div>
    </div>
  )
}

function NoteOutput({ result }: ToolOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.noteContent ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center">
            <StickyNote className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs font-mono text-zinc-300 font-medium">{result.title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="px-4 py-3">
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-light">
          {result.noteContent}
        </div>
      </div>
    </div>
  )
}

function CodeOutput({ result }: ToolOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06]">
        <span className="text-[11px] font-mono text-zinc-500">{result.language ?? 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
        <code>{result.code}</code>
      </pre>
    </div>
  )
}
