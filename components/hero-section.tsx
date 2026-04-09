'use client'

import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Github, Key, Lock } from 'lucide-react'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'
import { Card } from '@/components/ui/card'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export function HeroSection() {
  const splineContainerRef = useRef<HTMLDivElement>(null)

  // Forward global mousemove to the Spline canvas so it stays
  // interactive even when the cursor is over the text content.
  useEffect(() => {
    const forward = (e: MouseEvent) => {
      const canvas = splineContainerRef.current?.querySelector('canvas')
      if (!canvas) return
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: false,
          cancelable: true,
        })
      )
    }
    window.addEventListener('mousemove', forward)
    return () => window.removeEventListener('mousemove', forward)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/4 rounded-full blur-[100px] animate-pulse-glow [animation-delay:1.5s]" />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-12">
        <Card className="w-full min-h-[85vh] bg-[#0d0d0d]/80 border-white/[0.06] relative overflow-hidden rounded-2xl backdrop-blur-sm">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#f59e0b"
          />

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-amber-500/20 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-amber-500/20 rounded-br-2xl" />

          {/* Robot — hidden on mobile to avoid overlap */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            ref={splineContainerRef}
            className="hidden md:block absolute inset-y-0 right-0 w-[70%] z-0"
          >
            {/* Left fade so robot blends into the text area naturally */}
            <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent z-10 pointer-events-none" />
            {/* Amber glow behind robot */}
            <div className="absolute inset-0 bg-gradient-to-l from-amber-500/8 via-transparent to-transparent pointer-events-none" />
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 h-full min-h-[85vh] flex flex-col justify-center p-6 sm:p-8 lg:p-14 w-full md:max-w-[640px]">

            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 w-fit mb-8 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-mono font-medium tracking-wider"
            >
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              OPEN SOURCE · NO LOGIN REQUIRED
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-display font-black leading-[0.92] tracking-tight text-white mb-6"
            >
              Chat with
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  Any AI Model
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-400 origin-left rounded-full"
                />
              </span>
              <br />
              Your Own Keys
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-zinc-400 text-base lg:text-lg leading-relaxed max-w-lg mb-10 font-light"
            >
              Kairo is a private, open-source AI chat interface. Bring your own API keys for
              GPT-4, Claude, Gemini, and more. Zero data stored — everything lives in your browser.
            </motion.p>

            {/* Trust pills */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3 mb-10"
            >
              {[
                { icon: Key, text: 'Your API keys, your control' },
                { icon: Lock, text: 'No data leaves your browser' },
                { icon: Github, text: '100% open source' },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full"
                >
                  <Icon className="w-3 h-3 text-amber-400" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/chat"
                className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
              >
                Start Chatting Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/yashgargdev/Kairo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white font-semibold text-sm rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex gap-8 mt-12 pt-8 border-t border-white/[0.06]"
            >
              {[
                { value: '10+', label: 'AI Models' },
                { value: '0', label: 'Data Stored' },
                { value: '100%', label: 'Private' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-display font-black text-white">{value}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 font-mono">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </Card>
      </div>
    </section>
  )
}
