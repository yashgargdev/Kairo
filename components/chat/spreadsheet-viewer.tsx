'use client'

import { useState, useMemo } from 'react'
import { Download, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── CSV parser (handles quoted fields) ────────────────────────────────────────
function parseCSV(raw: string): string[][] {
  const lines = raw.trim().split(/\r?\n/)
  return lines.map(line => {
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    cells.push(current.trim())
    return cells
  })
}

function colLabel(i: number): string {
  if (i < 26) return String.fromCharCode(65 + i)
  return String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26))
}

// ── Component ─────────────────────────────────────────────────────────────────
interface SpreadsheetViewerProps {
  csv: string
  title?: string
}

export function SpreadsheetViewer({ csv, title = 'Table' }: SpreadsheetViewerProps) {
  const [expanded, setExpanded] = useState(false)

  const rows = useMemo(() => parseCSV(csv), [csv])
  const colCount = useMemo(() => Math.max(...rows.map(r => r.length), 0), [rows])

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (rows.length === 0) return null

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className={cn(
        "rounded-xl overflow-hidden border border-white/[0.08] my-3 transition-all",
        expanded
          ? "fixed inset-6 z-50 flex flex-col shadow-2xl"
          : "relative"
      )}>
        {/* ── Header ── */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#161616] border-b border-white/[0.07] shrink-0">
          {/* Excel-style icon */}
          <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-white">
              <rect x="2" y="2" width="16" height="16" rx="2" fillOpacity="0.25" />
              <path d="M5 6h10M5 9.5h10M5 13h10M8.5 6v10" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-sm text-white font-medium truncate flex-1 font-mono">{title}.csv</span>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={downloadCSV}
              title="Download CSV"
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              title={expanded ? 'Collapse' : 'Expand'}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className={cn(
          "overflow-auto bg-[#0d0d0d] flex-1",
          !expanded && "max-h-72"
        )}>
          <table className="border-collapse w-full text-xs">
            {/* Column letter headers */}
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 w-9 min-w-[36px] bg-[#161616] border-r border-b border-white/[0.07] text-zinc-600 text-center py-1.5" />
                {Array.from({ length: colCount }, (_, i) => (
                  <th
                    key={i}
                    className="sticky top-0 z-10 min-w-[110px] bg-[#161616] border-r border-b border-white/[0.07] text-zinc-500 font-medium text-center py-1.5 px-2 font-mono"
                  >
                    {colLabel(i)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={cn("group", ri % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#0f0f0f]")}>
                  {/* Row number */}
                  <td className="sticky left-0 z-10 bg-[#161616] border-r border-b border-white/[0.06] text-zinc-600 text-center px-1 py-1.5 text-[10px] font-mono select-none w-9 min-w-[36px]">
                    {ri + 1}
                  </td>
                  {Array.from({ length: colCount }, (_, ci) => (
                    <td
                      key={ci}
                      title={row[ci] ?? ''}
                      className={cn(
                        "border-r border-b border-white/[0.05] px-3 py-1.5 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis font-mono group-hover:bg-white/[0.02] transition-colors",
                        ri === 0
                          ? "text-white font-semibold bg-white/[0.03]"
                          : "text-zinc-300"
                      )}
                    >
                      {row[ci] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Sheet tab bar ── */}
        <div className="flex items-center px-3 pt-1 pb-0.5 bg-[#111] border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-t text-[10px] font-mono text-zinc-300 bg-[#1a1a1a] border border-b-0 border-white/[0.08]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Sheet1
          </div>
          <div className="text-[10px] text-zinc-700 ml-auto font-mono pr-1">
            {rows.length} rows · {colCount} cols
          </div>
        </div>
      </div>
    </>
  )
}
