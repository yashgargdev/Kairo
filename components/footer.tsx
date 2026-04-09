import Link from 'next/link'
import { Github, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/[0.05] py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500 rounded-md rotate-45" />
            <Zap className="relative z-10 w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-bold text-white">Kairo</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="#features" className="hover:text-zinc-300 transition-colors">Features</Link>
          <Link href="#models" className="hover:text-zinc-300 transition-colors">Models</Link>
          <a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/yashgargdev/Kairo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white text-xs rounded-lg transition-all hover:bg-white/[0.08]"
          >
            <Github className="w-3.5 h-3.5" />
            Open Source
          </a>
          <span className="text-zinc-700 text-xs font-mono">MIT License</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/[0.04]">
        <p className="text-center text-zinc-700 text-xs font-mono">
          © 2025 Kairo · Built for developers who value privacy
        </p>
      </div>
    </footer>
  )
}
