'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Github } from 'lucide-react'

export function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-28 bg-[#080808] overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 sm:p-10 md:p-16 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] overflow-hidden"
        >
          {/* Decorative top line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-block text-xs font-mono text-amber-400 tracking-[0.25em] uppercase mb-6 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20"
          >
            Get Started Now
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tight mb-6"
          >
            Ready to take control
            <br />
            <span className="text-zinc-500">of your AI experience?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-zinc-400 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed"
          >
            No sign-up. No subscription. Just paste your API key and start chatting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/chat"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/25"
            >
              Launch Kairo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com/yashgargdev/Kairo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white font-semibold text-base rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
