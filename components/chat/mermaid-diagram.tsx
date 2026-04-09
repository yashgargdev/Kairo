'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { GitBranch, Copy, Check } from 'lucide-react'

interface MermaidDiagramProps {
  code: string
  title?: string
  className?: string
}

let idCounter = 0
let mermaidInitialized = false

async function getMermaid() {
  const mermaid = (await import('mermaid')).default
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrors: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#f59e0b',
        primaryTextColor: '#e4e4e7',
        primaryBorderColor: '#d97706',
        lineColor: '#52525b',
        background: '#0d0d0d',
        mainBkg: '#18181b',
        nodeBorder: '#3f3f46',
        clusterBkg: '#18181b',
        titleColor: '#e4e4e7',
        edgeLabelBackground: '#18181b',
        attributeBackgroundColorOdd: '#18181b',
        attributeBackgroundColorEven: '#27272a',
        fontFamily: 'IBM Plex Mono, monospace',
      },
    })
    mermaidInitialized = true
  }
  return mermaid
}

// Valid diagram type prefixes
const VALID_TYPES = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'erDiagram', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline', 'quadrantChart', 'xychart']

function isValidMermaid(code: string): boolean {
  const trimmed = code.trim().toLowerCase()
  return VALID_TYPES.some(t => trimmed.startsWith(t.toLowerCase()))
}

export function MermaidDiagram({ code, title, className }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const idRef = useRef(`mermaid-${++idCounter}`)

  useEffect(() => {
    let cancelled = false
    setSvg('')
    setError('')
    setLoading(true)

    const trimmed = code.trim()

    if (!trimmed || !isValidMermaid(trimmed)) {
      setError('Invalid or incomplete diagram syntax.')
      setLoading(false)
      return
    }

    const cleanupStrayElements = (uid: string) => {
      // Mermaid appends temp containers to document.body — remove them after render
      try {
        document.getElementById(uid)?.remove()
        document.getElementById(`d${uid}`)?.remove()
        // Also clean up any orphaned mermaid error nodes in body
        document.querySelectorAll('[id^="mermaid-"]').forEach(el => {
          if (el.parentElement === document.body) el.remove()
        })
      } catch { /* ignore cleanup errors */ }
    }

    const render = async () => {
      const uid = `mermaid-${idRef.current}-${Date.now()}`
      try {
        const mermaid = await getMermaid()

        // parse() throws on invalid syntax — catch before render() touches the DOM
        await mermaid.parse(trimmed)

        const { svg: rendered } = await mermaid.render(uid, trimmed)

        // Sanity-check: mermaid sometimes returns an error SVG silently
        if (rendered.includes('Syntax error') || rendered.includes('mermaid-error')) {
          if (!cancelled) setError('Diagram syntax error — check the generated code.')
        } else {
          if (!cancelled) setSvg(rendered)
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to render diagram'
          setError(msg.split('\n')[0])
        }
      } finally {
        cleanupStrayElements(uid)
        if (!cancelled) setLoading(false)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("rounded-xl border border-cyan-500/15 bg-[#0d1117] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center">
            <GitBranch className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="text-xs font-mono text-zinc-300 font-medium">
            {title ?? 'Diagram'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Diagram */}
      <div className="p-4 min-h-[120px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-xs text-zinc-600 font-mono">Rendering diagram…</span>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-xs text-red-400 font-mono mb-2">Failed to render</p>
            <pre className="text-[10px] text-zinc-600 bg-red-500/5 rounded-lg p-3 text-left overflow-x-auto max-w-full">
              {error}
            </pre>
          </div>
        ) : (
          <div
            className="mermaid-output w-full overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
            style={{ filter: 'brightness(1.1)' }}
          />
        )}
      </div>

      {/* Collapsible code */}
      <details className="group">
        <summary className="flex items-center gap-2 px-3.5 py-2 border-t border-white/[0.04] cursor-pointer text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors list-none">
          <span className="group-open:hidden">▶ View source</span>
          <span className="hidden group-open:block">▼ Hide source</span>
        </summary>
        <pre className="px-3.5 pb-3 text-[11px] font-mono text-zinc-500 overflow-x-auto leading-relaxed">
          {code}
        </pre>
      </details>
    </div>
  )
}
