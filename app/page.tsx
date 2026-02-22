import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Kairo AI — Evolving Intelligence',
  description: 'Kairo is a free, open-source multilingual AI assistant. Chat, learn, code, and analyze documents in Hindi, English, and Hinglish — powered by Sarvam-M.',
};

const features = [
  { icon: 'chat', label: 'Streaming Chat', desc: 'Real-time AI responses with full conversation memory' },
  { icon: 'translate', label: 'Multilingual', desc: 'Hindi, English, and Hinglish — switch naturally mid-conversation' },
  { icon: 'description', label: 'Document Analysis', desc: 'Upload PDFs, DOCX, images, and CSV files for AI-powered analysis' },
  { icon: 'code', label: 'Code Assistant', desc: 'Write, explain, and debug code across all major languages' },
  { icon: 'lock', label: 'Private & Secure', desc: 'Your conversations are isolated by Supabase Row-Level Security' },
  { icon: 'public', label: 'Open Source', desc: 'Fully open-source on GitHub — self-host or contribute freely' },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/chat');
  }
  return (
    <div className="bg-gradient-to-b from-[#0d0d10] to-[#050505] text-slate-200">

      {/* Nav */}
      <nav className="w-full px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/5 z-50 sticky top-0 bg-[#0d0d10]/50 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/Kairo-Logo-White.png" alt="Kairo Logo" className="size-8 object-contain" />
          <span className="text-lg font-serif font-bold text-white tracking-tight">kairo</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium hidden md:block">Terms</Link>
          <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium hidden md:block">Privacy</Link>
          <a
            href="https://github.com/yashgargdev/Kairo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium hidden md:block"
          >
            GitHub
          </a>
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-full bg-primary text-black hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="w-full flex flex-col items-center text-center px-6 py-14 md:py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            v1.0.0 Beta — Open Source
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight tracking-tight mb-6">
            The AI that speaks<br />
            <span className="text-primary">your language</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg font-light max-w-xl leading-relaxed mb-10">
            Kairo is a free, open-source multilingual AI assistant. Chat, analyze documents, write code, and learn — in Hindi, English, or Hinglish.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-full bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Start for free →
            </Link>
            <a
              href="https://github.com/yashgargdev/Kairo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-xs font-semibold tracking-widest uppercase text-slate-600 mb-8">What Kairo can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-primary/15 hover:bg-white/[0.04] transition-all group"
            >
              <span className="material-symbols-outlined text-primary text-[22px] mb-3 block">{f.icon}</span>
              <p className="text-sm font-semibold text-white mb-1">{f.label}</p>
              <p className="text-xs text-slate-500 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
        <span>© 2026 Yash Garg. Open-source under MIT License.</span>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <a href="https://github.com/yashgargdev/Kairo" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
