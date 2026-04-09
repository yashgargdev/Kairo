'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Brain, Lightbulb, Search, BarChart2, Image, GitBranch, StickyNote, Paintbrush, FlaskConical, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThinkingStep, ThinkingStepType } from '@/types/chat'

const STEP_CONFIG: Record<ThinkingStepType, { icon: React.ElementType; color: string; bg: string }> = {
  thinking:         { icon: Brain,       color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  planning:         { icon: Lightbulb,   color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  searching:        { icon: Search,      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  analyzing:        { icon: BarChart2,   color: 'text-purple-400', bg: 'bg-purple-500/10' },
  generating_image: { icon: Image,       color: 'text-pink-400',   bg: 'bg-pink-500/10' },
  creating_diagram: { icon: GitBranch,   color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  writing_notes:    { icon: StickyNote,  color: 'text-lime-400',   bg: 'bg-lime-500/10' },
  designing:        { icon: Paintbrush,  color: 'text-rose-400',   bg: 'bg-rose-500/10' },
  researching:      { icon: FlaskConical,color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  reasoning:        { icon: Cpu,         color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

interface ThinkingBlockProps {
  steps: ThinkingStep[]
  isActive: boolean
  durationSeconds?: number
}

export function ThinkingBlock({ steps, isActive, durationSeconds }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const activeStep = steps.find(s => s.status === 'active')
  const doneSteps = steps.filter(s => s.status === 'done')

  if (steps.length === 0) return null

  return (
    <div className="mb-3">
      {isActive ? (
        /* ---- ACTIVE: always expanded, animated ---- */
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            {/* Pulsing brain */}
            <div className="relative flex items-center justify-center w-5 h-5">
              <div className="absolute w-4 h-4 bg-amber-500/30 rounded-full animate-ping" />
              <Brain className="relative w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-mono text-amber-400 font-medium">Thinking…</span>
            <div className="flex gap-0.5 ml-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-amber-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>

          <div className="px-3.5 pb-3 space-y-1.5">
            {steps.map((step) => {
              const cfg = STEP_CONFIG[step.type]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                    {step.status === 'active' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Icon className={cn("w-3 h-3", cfg.color)} />
                      </motion.div>
                    ) : (
                      <Icon className={cn("w-3 h-3", cfg.color)} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={cn("text-xs font-medium", step.status === 'active' ? cfg.color : 'text-zinc-400')}>
                      {step.label}
                    </span>
                    {step.detail && (
                      <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{step.detail}</p>
                    )}
                  </div>
                  {step.status === 'done' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2 h-2 text-emerald-400" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ---- DONE: collapsible pill ---- */
        <div className="rounded-xl border border-white/[0.07] overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-white/[0.03] transition-colors group"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
              Thought for {durationSeconds ?? doneSteps.length}s
            </span>
            <div className="flex gap-1 ml-1">
              {doneSteps.slice(0, 3).map(step => {
                const cfg = STEP_CONFIG[step.type]
                const Icon = cfg.icon
                return <Icon key={step.id} className={cn("w-3 h-3", cfg.color)} />
              })}
              {doneSteps.length > 3 && (
                <span className="text-[10px] text-zinc-600">+{doneSteps.length - 3}</span>
              )}
            </div>
            <div className="ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/[0.05]">
                  {steps.map(step => {
                    const cfg = STEP_CONFIG[step.type]
                    const Icon = cfg.icon
                    // If this step has full <think> content, render it as a scrollable block
                    if (step.content) {
                      return (
                        <div key={step.id} className="px-3.5 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", cfg.bg)}>
                              <Icon className={cn("w-3 h-3", cfg.color)} />
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">{step.label}</span>
                          </div>
                          <div className="max-h-64 overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.05] px-3 py-2.5">
                            <p className="text-[11.5px] text-zinc-500 leading-relaxed whitespace-pre-wrap font-mono">
                              {step.content.trim()}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div key={step.id} className="flex items-start gap-2 px-3.5 py-2">
                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                          <Icon className={cn("w-3 h-3", cfg.color)} />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-zinc-400 font-medium">{step.label}</span>
                          {step.detail && (
                            <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{step.detail}</p>
                          )}
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-2 h-2 text-emerald-400" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
