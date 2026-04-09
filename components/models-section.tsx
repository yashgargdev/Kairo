'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const models = [
  // Anthropic
  { name: 'Claude Sonnet 4.6',    provider: 'Anthropic',  color: '#d97706', description: 'Balanced speed and high-level reasoning',          tag: 'Recommended' },
  { name: 'Claude Opus 4.6',      provider: 'Anthropic',  color: '#d97706', description: 'Maximum intelligence, complex coding & writing' },
  { name: 'Claude Haiku 4.5',     provider: 'Anthropic',  color: '#d97706', description: 'Near-frontier intelligence at high speed',          tag: 'Fast' },
  // OpenAI
  { name: 'GPT-5.4',              provider: 'OpenAI',     color: '#10a37f', description: 'Broad professional capabilities',                   tag: 'Latest' },
  { name: 'OpenAI o3',            provider: 'OpenAI',     color: '#10a37f', description: 'Ultimate reasoning, advanced math & STEM',          tag: 'Reasoning' },
  { name: 'GPT-5.4 mini',         provider: 'OpenAI',     color: '#10a37f', description: 'Coding, sub-agents, computer use' },
  // Google
  { name: 'Gemini 3.1 Pro',       provider: 'Google',     color: '#4285f4', description: 'Complex reasoning, heavy agentic workflows' },
  { name: 'Gemini 3 Flash',       provider: 'Google',     color: '#4285f4', description: 'High-speed multimodal tasks',                      tag: 'Fast' },
  // Meta / Groq
  { name: 'Llama 4 Maverick 400B',provider: 'Meta',       color: '#1877F2', description: 'Open-weight deep reasoning, enterprise',           tag: 'Open Source' },
  { name: 'DeepSeek R1',          provider: 'Groq',       color: '#f55036', description: 'Open-source reasoning at LPU speeds' },
  { name: 'Mixtral 8x7B',         provider: 'Groq',       color: '#f55036', description: 'Fast, reliable mixture-of-experts' },
  // Sarvam AI
  { name: 'Sarvam-M',             provider: 'Sarvam AI',  color: '#2dd4bf', description: 'Multilingual model for Indian languages',          tag: 'Indian AI' },
]

export function ModelsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="models" className="relative py-28 bg-[#080808] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/3 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono text-amber-400 tracking-[0.25em] uppercase mb-4 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
            Supported Models
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight tracking-tight mt-4">
            One interface,
            <br />
            <span className="text-zinc-500">every frontier model.</span>
          </h2>
          <p className="text-zinc-500 text-base mt-4 max-w-lg mx-auto">
            Add your API keys in settings and switch between any supported model in seconds.
          </p>
        </motion.div>

        {/* Models grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {models.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 cursor-default"
            >
              {/* Provider color dot */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <span className="text-xs font-mono text-zinc-600">{model.provider}</span>
                </div>
                {model.tag && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {model.tag}
                  </span>
                )}
              </div>

              <h3 className="text-white font-bold text-sm mb-1 font-display">{model.name}</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">{model.description}</p>

              {/* hover left border */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: model.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* More coming soon */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-zinc-600 text-sm mt-8 font-mono"
        >
          22 models across 7 providers · More being added regularly · Open a PR to add yours.
        </motion.p>
      </div>
    </section>
  )
}
