'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45 group-hover:rotate-90 transition-transform duration-500" />
            <Zap className="relative z-10 w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Kairo
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Models', href: '#models' },
            { label: 'How it works', href: '#how-it-works' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/yashgargdev/Kairo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Start Chatting
            <span className="text-xs">→</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Models', href: '#models' },
                { label: 'How it works', href: '#how-it-works' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-zinc-400 hover:text-white transition-colors py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-black text-sm font-semibold rounded-lg mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Start Chatting →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
