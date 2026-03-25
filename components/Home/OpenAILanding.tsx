'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

/* ── Animation Variants ── */
const fade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08 },
  }),
};

/* ── Data ── */
const providers = ['OpenAI', 'Claude', 'Gemini', 'Sarvam'];

const values = [
  {
    icon: 'vpn_key',
    title: 'Bring Your Own Keys',
    desc: 'Use your own API keys. Your data, your billing, your control.',
  },
  {
    icon: 'money_off',
    title: 'No Monthly Fees',
    desc: 'No subscriptions. No hidden costs. Pay only for the API calls you make.',
  },
  {
    icon: 'forum',
    title: 'ChatGPT-like Experience',
    desc: 'Clean, fast, familiar chat interface — just without the $20/month price tag.',
  },
  {
    icon: 'code',
    title: 'Open Source',
    desc: 'Fully open-source. Self-host it, modify it, or contribute to it.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Add Your API Key',
    desc: 'Paste your API key securely in your browser. It never leaves your device.',
  },
  {
    num: '02',
    title: 'Start Chatting',
    desc: 'Choose a model — GPT-4o, Claude, Gemini — and start chatting instantly.',
  },
  {
    num: '03',
    title: 'Pay Only for Usage',
    desc: 'You are billed directly by the provider. No middleman, no markup.',
  },
];

const useCases = [
  { icon: 'smart_toy', label: 'Personal AI Assistant' },
  { icon: 'terminal', label: 'Coding Help' },
  { icon: 'edit_note', label: 'Content Writing' },
  { icon: 'school', label: 'Study & Research' },
  { icon: 'task_alt', label: 'Daily Productivity' },
];

export default function OpenAILanding() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans scroll-smooth selection:bg-purple-500/30">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-50 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <Link href="/" className="flex items-center">
          <Image src="/Kairo-Logo-White.png" alt="Kairo" width={80} height={24} className="h-6 w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#open-source" className="hover:text-white transition-colors">Open Source</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/yashgargdev/Kairo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <Link
            href="/login"
            className="px-5 py-2 text-[13px] font-semibold rounded-full bg-white text-black hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300"
          >
            Try Kairo
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-6xl mx-auto px-6 lg:px-12">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-28 pb-32 md:pt-40 md:pb-44 flex flex-col items-center text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/15 via-pink-500/10 to-orange-500/15 blur-[120px] pointer-events-none" />

          <motion.span initial="hidden" animate="visible" variants={fade} custom={0}
            className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/60 mb-8 backdrop-blur-sm uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            v2.0 — Open Source
          </motion.span>

          <motion.h1 initial="hidden" animate="visible" variants={fade} custom={1}
            className="relative z-10 text-4xl sm:text-5xl md:text-[4.25rem] font-bold tracking-tight leading-[1.1] max-w-3xl"
          >
            Chat with AI.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Use Your Own Keys.
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fade} custom={2}
            className="relative z-10 mt-6 text-[15px] md:text-lg text-white/45 max-w-2xl leading-relaxed"
          >
            Kairo gives you a ChatGPT-like experience using your own API keys from OpenAI, Claude, Gemini, and more. No subscriptions. No markup. Just pay for what you use.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fade} custom={3}
            className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/login"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-semibold hover:shadow-[0_0_28px_rgba(168,85,247,0.35)] hover:scale-[1.03] transition-all duration-300"
            >
              Get Started — It&apos;s Free
            </Link>
            <a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer"
              className="px-7 py-3 rounded-full border border-white/10 bg-white/[0.03] text-white/70 text-sm font-medium hover:bg-white/[0.07] transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
          </motion.div>

          {/* Provider Badges */}
          <motion.div initial="hidden" animate="visible" variants={fade} custom={4}
            className="relative z-10 mt-16 flex flex-col items-center gap-4"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 font-semibold">Works with your favorite models</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {providers.map((p) => (
                <span key={p} className="px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-[12px] text-white/40 font-medium backdrop-blur-sm">
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════ VALUE PROPS ═══════════ */}
        <section id="features" className="py-24 border-t border-white/[0.04]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why use Kairo?</h2>
            <p className="mt-3 text-white/35 text-[15px] max-w-lg mx-auto">A smarter way to use AI — without the subscription tax.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fade} custom={i}
                className="group relative p-7 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/15 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/[0.04] to-orange-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[20px] text-purple-400">{v.icon}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white mb-1.5">{v.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ COST ADVANTAGE ═══════════ */}
        <section id="pricing" className="py-24 border-t border-white/[0.04]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0}
            className="relative rounded-3xl border border-white/[0.04] bg-white/[0.02] p-10 md:p-16 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Stop paying for subscriptions.</h2>
              <p className="text-white/40 text-[15px] leading-relaxed mb-10">
                Why pay ₹2,000/month for ChatGPT Plus when you can pay only for what you actually use? With Kairo, you connect your own API key and get billed directly by the provider — no middleman, no markup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                {/* Traditional */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px] text-red-400">block</span>
                    <span className="text-[13px] font-semibold text-red-400 uppercase tracking-wider">Traditional AI Apps</span>
                  </div>
                  <ul className="space-y-2.5 text-[13px] text-white/35">
                    <li className="flex items-start gap-2"><span className="text-red-400/60 mt-0.5">✕</span> Fixed monthly pricing</li>
                    <li className="flex items-start gap-2"><span className="text-red-400/60 mt-0.5">✕</span> Pay even when you don&apos;t use it</li>
                    <li className="flex items-start gap-2"><span className="text-red-400/60 mt-0.5">✕</span> Vendor lock-in</li>
                    <li className="flex items-start gap-2"><span className="text-red-400/60 mt-0.5">✕</span> Limited model choices</li>
                  </ul>
                </div>

                {/* Kairo */}
                <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px] text-green-400">check_circle</span>
                    <span className="text-[13px] font-semibold text-green-400 uppercase tracking-wider">Kairo</span>
                  </div>
                  <ul className="space-y-2.5 text-[13px] text-white/50">
                    <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Pay-per-use via your API key</li>
                    <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> No token wastage, no limits</li>
                    <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Switch models freely</li>
                    <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Open source &amp; self-hostable</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="py-24 border-t border-white/[0.04]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-white/35 text-[15px] max-w-lg mx-auto">Up and running in under 60 seconds.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fade} custom={i}
                className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.02]"
              >
                <span className="text-5xl font-black bg-gradient-to-br from-purple-500/20 to-pink-500/20 bg-clip-text text-transparent">{s.num}</span>
                <h3 className="text-base font-semibold text-white mt-4 mb-2">{s.title}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ USE CASES ═══════════ */}
        <section className="py-24 border-t border-white/[0.04]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Use Kairo for anything</h2>
            <p className="mt-3 text-white/35 text-[15px] max-w-lg mx-auto">One interface. Any model. Every use case.</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {useCases.map((u, i) => (
              <motion.div key={u.label} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fade} custom={i}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/15 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[18px] text-purple-400">{u.icon}</span>
                <span className="text-[13px] font-medium text-white/55">{u.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ OPEN SOURCE ═══════════ */}
        <section id="open-source" className="py-24 border-t border-white/[0.04]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0}
            className="relative rounded-3xl border border-white/[0.04] bg-white/[0.02] p-10 md:p-14 overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-green-600/[0.06] to-emerald-500/[0.06] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/15 bg-green-500/[0.04] text-green-400 text-[10px] font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                MIT Licensed
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Kairo is fully open source.</h2>
              <p className="text-white/35 text-[15px] leading-relaxed mb-8">
                Inspect the code, self-host on your own server, or contribute. No black boxes. What you see is what you get.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { icon: 'code', label: 'Open Source' },
                  { icon: 'cloud_download', label: 'Self-Hostable' },
                  { icon: 'groups', label: 'Community Driven' },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.05] bg-white/[0.02] text-[12px] text-white/40 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-green-400">{item.icon}</span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fade} custom={0}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-tight">
              Chat smarter.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Stop overpaying.
              </span>
            </h2>
            <p className="text-white/35 text-[15px] max-w-md mx-auto mb-10">
              Bring your own keys, pick your model, and start chatting. Free to start.
            </p>
            <Link href="/login"
              className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-semibold hover:shadow-[0_0_28px_rgba(168,85,247,0.35)] hover:scale-[1.03] transition-all duration-300"
            >
              Try Kairo
            </Link>
          </motion.div>
        </section>

      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.04] bg-[#09090b]">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {/* Product */}
            <div>
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-[13px] text-white/25">
                <li><a href="#features" className="hover:text-white/50 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white/50 transition-colors">Pricing</a></li>
                <li><a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Docs</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5 text-[13px] text-white/25">
                <li><Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link></li>
              </ul>
            </div>
            {/* Developers */}
            <div>
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Developers</h4>
              <ul className="space-y-2.5 text-[13px] text-white/25">
                <li><a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a></li>
                <li><a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Open Source</a></li>
              </ul>
            </div>
            {/* Brand */}
            <div>
              <Link href="/" className="inline-block mb-3">
                <Image src="/Kairo-Logo-White.png" alt="Kairo" width={80} height={24} className="h-6 w-auto" />
              </Link>
              <p className="text-[12px] text-white/20 leading-relaxed">Chat with AI using your own keys. Open source forever.</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/15">
            <span>© 2026 Kairo. MIT License.</span>
            <span>Made for developers who value control.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
