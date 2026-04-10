'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, RotateCcw, Zap, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/chat'
import { ThinkingBlock } from './thinking-block'
import { ToolOutput } from './tool-output'
import { SpreadsheetViewer } from './spreadsheet-viewer'
import { MermaidDiagram } from './mermaid-diagram'

interface MessageBubbleProps {
  message: Message
  showThinking?: boolean
  fontSize?: 'sm' | 'base' | 'lg'
  onRetry?: () => void
}

export function MessageBubble({ message, showThinking = true, fontSize = 'sm', onRetry }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[75%] group">
          {/* Attached images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={`data:${img.mimeType};base64,${img.data}`}
                  alt={img.name}
                  className="max-w-[200px] max-h-[200px] rounded-xl border border-white/[0.08] object-cover"
                />
              ))}
            </div>
          )}
          {/* Attached text/doc files — show pill only, content is hidden */}
          {message.fileAttachments && message.fileAttachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end mb-2">
              {message.fileAttachments.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] text-zinc-300"
                >
                  <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[180px]">{f.name}</span>
                </span>
              ))}
            </div>
          )}
          {message.content && (
            <div className={cn(
              "bg-white/[0.07] border border-white/[0.08] rounded-2xl rounded-br-md px-4 py-3 text-zinc-200 leading-relaxed whitespace-pre-wrap",
              fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
            )}>
              {message.content}
            </div>
          )}
          <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono text-zinc-700">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 mb-6 group"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
        <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Model label */}
        {message.model && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              {message.model}
            </span>
            <span className="text-[10px] font-mono text-zinc-700">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* Thinking block */}
        {showThinking && message.thinking && message.thinking.length > 0 && (
          <ThinkingBlock
            steps={message.thinking}
            isActive={!!message.isThinking}
            durationSeconds={message.thinkingDuration}
          />
        )}

        {/* Loading dots — shown while waiting for first token */}
        {(message.isStreaming || message.isThinking) && !message.content && (
          <div className="flex items-center gap-1.5 py-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-zinc-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
        )}

        {/* Message content */}
        {message.content && (
          <div className={cn(
            "prose prose-invert max-w-none",
            fontSize === 'sm' ? 'prose-sm' : fontSize === 'lg' ? 'prose-lg' : ''
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const isInline = !className
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 bg-white/[0.08] rounded text-amber-300 text-[0.85em] font-mono" {...props}>
                        {children}
                      </code>
                    )
                  }
                  const lang = className?.replace('language-', '') ?? ''

                  // CSV → spreadsheet viewer
                  if (lang === 'csv') {
                    return <SpreadsheetViewer csv={String(children).trim()} />
                  }

                  // Mermaid → diagram renderer
                  if (lang === 'mermaid') {
                    return <MermaidDiagram code={String(children).trim()} />
                  }

                  return (
                    <div className="relative group/code rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d1117] my-3">
                      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06]">
                        <span className="text-[11px] font-mono text-zinc-500">{lang || 'code'}</span>
                        <CopyCodeButton code={String(children)} />
                      </div>
                      <pre className="p-4 overflow-x-auto">
                        <code className="text-sm font-mono text-zinc-300 leading-relaxed">{children}</code>
                      </pre>
                    </div>
                  )
                },
                p({ children }) {
                  return <p className="text-zinc-300 text-sm leading-7 mb-3 last:mb-0">{children}</p>
                },
                h1({ children }) {
                  return <h1 className="text-white font-display font-bold text-xl mt-5 mb-3">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="text-white font-display font-bold text-lg mt-4 mb-2">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="text-zinc-200 font-semibold mt-3 mb-1.5">{children}</h3>
                },
                ul({ children }) {
                  return <ul className="text-zinc-300 text-sm space-y-1 mb-3 pl-4">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="text-zinc-300 text-sm space-y-1 mb-3 pl-4 list-decimal">{children}</ol>
                },
                li({ children }) {
                  return <li className="leading-6 marker:text-amber-500">{children}</li>
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-amber-500/50 pl-4 text-zinc-400 italic my-3">
                      {children}
                    </blockquote>
                  )
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3 rounded-xl border border-white/[0.08]">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  )
                },
                th({ children }) {
                  return <th className="px-4 py-2 text-left text-xs font-mono text-zinc-400 border-b border-white/[0.08] bg-white/[0.03]">{children}</th>
                },
                td({ children }) {
                  return <td className="px-4 py-2 text-zinc-300 border-b border-white/[0.04]">{children}</td>
                },
                strong({ children }) {
                  return <strong className="text-white font-semibold">{children}</strong>
                },
                a({ children, href }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">{children}</a>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Streaming cursor */}
        {message.isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 align-middle"
          />
        )}

        {/* Tool results */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mt-2 space-y-3">
            {message.toolResults.map(result => (
              <ToolOutput key={result.id} result={result} />
            ))}
          </div>
        )}

        {/* Action bar */}
        {!message.isStreaming && !message.isThinking && message.content && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
