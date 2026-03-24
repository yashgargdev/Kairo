'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06 },
  }),
};

const sections = [
  {
    title: '1. Introduction',
    content: `Kairo ("we", "our", or "us") respects your privacy. This Privacy Policy explains how information is handled when you use Kairo, an open-source AI chat interface that allows users to connect to third-party AI services using their own API keys.\n\nBy using Kairo, you agree to this Privacy Policy.`,
  },
  {
    title: '2. Core Principle',
    content: 'Kairo is designed with privacy in mind:',
    bullets: [
      'We do not provide AI models',
      'We do not sell or share your data',
      'We do not act as a middleman for API usage',
      'You interact directly with third-party AI providers using your own API keys',
    ],
  },
  {
    title: '3. Information We Collect',
    subsections: [
      {
        subtitle: 'a) Local Data (Primary)',
        content:
          'Kairo may store certain data locally in your browser or environment, such as:',
        bullets: [
          'API keys (stored locally unless using a hosted version)',
          'Chat history (if saved locally)',
          'User preferences',
        ],
        footer: 'This data is controlled by you.',
      },
      {
        subtitle: 'b) Minimal Server Data (if applicable)',
        content:
          'If you use a hosted version of Kairo, we may collect limited data such as:',
        bullets: [
          'Basic usage logs (e.g., performance, errors)',
          'Anonymous analytics (if enabled)',
        ],
        footer: 'We do not intentionally collect personal or sensitive data.',
      },
    ],
  },
  {
    title: '4. API Keys & Security',
    bullets: [
      'API keys you enter are intended to remain on your device',
      'Kairo does not store or access your API keys on its servers unless explicitly stated',
      'You are responsible for securing your API credentials',
    ],
  },
  {
    title: '5. Third-Party Services',
    content:
      'Kairo connects to third-party AI providers such as OpenAI, Anthropic, Google Gemini, and others. When you use these services:',
    bullets: [
      'Your prompts and data are sent directly to those providers',
      'Their privacy policies apply',
    ],
    footer:
      'Kairo is not responsible for how third-party services handle your data.',
  },
  {
    title: '6. Data Usage',
    content: 'We do not:',
    bullets: [
      'Sell your data',
      'Track personal identity',
      'Use your data for advertising',
    ],
    footer:
      'Any data processed is used only to operate and improve the platform.',
  },
  {
    title: '7. Open Source Transparency',
    content: 'Kairo is open source, meaning:',
    bullets: [
      'You can inspect how data is handled',
      'You can self-host to maintain full control',
      'You can modify storage behavior as needed',
    ],
  },
  {
    title: '8. Data Retention',
    bullets: [
      'Local data remains in your control until you delete it',
      'We do not store user data on servers unless explicitly required for a feature',
    ],
  },
  {
    title: '9. Security',
    content:
      'We take reasonable measures to protect the platform, but:',
    bullets: [
      'No system is completely secure',
      'You are responsible for protecting your API keys and usage',
    ],
  },
  {
    title: "10. Children's Privacy",
    content:
      'Kairo is not intended for users under the age of 13. We do not knowingly collect data from children.',
  },
  {
    title: '11. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. Continued use of Kairo means you accept the updated policy.',
  },
  {
    title: '12. Contact',
    content:
      'For privacy-related questions, contact us at support@kairo.ai.',
  },
  {
    title: '13. Your Control',
    content: 'You have full control over:',
    bullets: [
      'Your API keys',
      'Your usage',
      'Your data (especially in self-hosted setups)',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <Link href="/" className="flex items-center">
          <Image src="/Kairo-Logo-White.png" alt="Kairo" width={80} height={24} className="h-6 w-auto" priority />
        </Link>
        <Link href="/" className="text-[13px] text-white/40 hover:text-white transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <div className="w-full max-w-3xl mx-auto px-6 lg:px-12 pt-20 pb-24">
        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fade} custom={0} className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-6">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-white/30 text-[14px]">Last Updated: March 2026</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fade}
              custom={i}
              className="p-6 md:p-8 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-purple-500/10 transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold text-white mb-3">{s.title}</h2>

              {s.content && (
                <p className="text-[13px] text-white/35 leading-relaxed whitespace-pre-line mb-3">
                  {s.content}
                </p>
              )}

              {s.bullets && (
                <ul className="space-y-2 mb-3">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[13px] text-white/40 leading-relaxed">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400/60 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {/* Subsections */}
              {'subsections' in s && s.subsections && (s.subsections as any[]).map((sub: { subtitle: string; content?: string; bullets?: string[]; footer?: string }) => (
                <div key={sub.subtitle} className="mt-5 ml-3 pl-4 border-l border-white/[0.06]">
                  <h3 className="text-[14px] font-medium text-white/70 mb-2">{sub.subtitle}</h3>
                  {sub.content && (
                    <p className="text-[13px] text-white/35 leading-relaxed mb-2">{sub.content}</p>
                  )}
                  {sub.bullets && (
                    <ul className="space-y-2 mb-2">
                      {sub.bullets.map((b: string) => (
                        <li key={b} className="flex items-start gap-2.5 text-[13px] text-white/40 leading-relaxed">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400/60 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sub.footer && (
                    <p className="text-[13px] text-white/25 italic">{sub.footer}</p>
                  )}
                </div>
              ))}

              {s.footer && (
                <p className="text-[13px] text-white/25 italic">{s.footer}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="mt-16 pt-8 border-t border-white/[0.04] text-center"
        >
          <p className="text-[12px] text-white/15">© 2026 Kairo — Open-source AI workspace</p>
        </motion.div>
      </div>
    </div>
  );
}
