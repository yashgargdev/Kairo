'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Key, Shield, Cpu, Layers, MessageSquare, Zap } from 'lucide-react'

const features = [
  {
    icon: Key,
    title: 'Bring Your Own Keys',
    description: 'Connect your OpenAI, Anthropic, Google, or any other API key. Kairo never touches your credentials — they stay in your browser.',
    accent: 'from-amber-500/20 to-orange-500/0',
    iconColor: 'text-amber-400',
    border: 'border-amber-500/10 hover:border-amber-500/30',
  },
  {
    icon: Shield,
    title: 'Zero Data Storage',
    description: 'Your conversations are stored only in your browser\'s local storage. No accounts, no servers, no tracking. Complete privacy by design.',
    accent: 'from-emerald-500/20 to-emerald-500/0',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/10 hover:border-emerald-500/30',
  },
  {
    icon: Cpu,
    title: 'Multiple Models',
    description: 'Switch between GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, and more within the same interface. Compare responses in real time.',
    accent: 'from-blue-500/20 to-blue-500/0',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/10 hover:border-blue-500/30',
  },
  {
    icon: Layers,
    title: 'Conversation Memory',
    description: 'Persistent chat history via browser cache. Pick up exactly where you left off, even after closing the tab.',
    accent: 'from-violet-500/20 to-violet-500/0',
    iconColor: 'text-violet-400',
    border: 'border-violet-500/10 hover:border-violet-500/30',
  },
  {
    icon: MessageSquare,
    title: 'Clean Chat Interface',
    description: 'A distraction-free, markdown-aware chat UI with code highlighting, file attachments, and message editing.',
    accent: 'from-pink-500/20 to-pink-500/0',
    iconColor: 'text-pink-400',
    border: 'border-pink-500/10 hover:border-pink-500/30',
  },
  {
    icon: Zap,
    title: 'Open Source',
    description: 'Fork it, self-host it, or contribute. Kairo is fully transparent. No black boxes, no surprises.',
    accent: 'from-amber-500/20 to-amber-500/0',
    iconColor: 'text-amber-400',
    border: 'border-amber-500/10 hover:border-amber-500/30',
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="relative py-28 bg-[#080808] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs font-mono text-amber-400 tracking-[0.25em] uppercase mb-4 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
            Why Kairo
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white leading-tight tracking-tight mt-4">
            Everything you need,
            <br />
            <span className="text-zinc-500">nothing you don't.</span>
          </h2>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative group p-6 rounded-2xl bg-white/[0.02] border ${feature.border} transition-all duration-300 hover:bg-white/[0.04] overflow-hidden`}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 ${feature.iconColor}`}>
                <feature.icon className="w-5 h-5" />
              </div>

              <h3 className="text-white font-bold text-base mb-2 font-display tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
