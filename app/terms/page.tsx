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
    content: `Welcome to Kairo. These Terms of Service ("Terms") govern your use of the Kairo platform, an open-source AI chat interface that allows users to connect and interact with third-party AI services using their own API keys.\n\nBy accessing or using Kairo, you agree to these Terms.`,
  },
  {
    title: '2. Nature of the Service',
    content:
      'Kairo is a user interface layer that enables interaction with third-party AI providers such as OpenAI, Anthropic, Google Gemini, and others.',
    bullets: [
      'Kairo does not provide AI models',
      'Kairo does not process or bill API usage',
      'Kairo does not act as a reseller of AI services',
    ],
    footer: 'Users are solely responsible for obtaining and managing their own API keys.',
  },
  {
    title: '3. User Responsibilities',
    content: 'By using Kairo, you agree that:',
    bullets: [
      'You will provide and manage your own API keys securely',
      'You are responsible for all usage and charges incurred via your API providers',
      'You will comply with the terms and policies of the respective AI providers',
      'You will not use Kairo for illegal, harmful, or abusive activities',
    ],
    footer: 'Kairo is not responsible for misuse of third-party APIs.',
  },
  {
    title: '4. API Keys & Security',
    bullets: [
      'API keys entered into Kairo are handled locally (e.g., stored in browser or user-controlled environment unless otherwise specified)',
      'Kairo does not intentionally store or access your API keys on its servers',
      'You are responsible for safeguarding your API credentials',
    ],
  },
  {
    title: '5. Payments & Billing',
    bullets: [
      'Kairo does not charge subscription fees unless explicitly stated',
      'All AI usage costs are billed directly by the respective API providers',
      'Kairo is not responsible for any charges, overages, or billing disputes',
    ],
  },
  {
    title: '6. Open Source Nature',
    content:
      'Kairo is an open-source project and may be modified, forked, or self-hosted.',
    bullets: [
      'No warranty is provided for self-hosted or modified versions',
      'Community contributions are subject to project guidelines',
    ],
  },
  {
    title: '7. Availability',
    content: 'We strive to keep Kairo available, but:',
    bullets: [
      'We do not guarantee uptime or uninterrupted service',
      'Features may change, be added, or removed at any time',
    ],
  },
  {
    title: '8. Disclaimer of Warranties',
    content:
      'Kairo is provided "as is" without warranties of any kind. We do not guarantee:',
    bullets: [
      'Accuracy of AI responses',
      'Availability of third-party APIs',
      'Suitability for any specific purpose',
    ],
  },
  {
    title: '9. Limitation of Liability',
    content:
      'To the maximum extent permitted by law, Kairo and its creators will not be liable for:',
    bullets: [
      'Any damages arising from use of the platform',
      'API costs incurred through third-party providers',
      'Data loss or security breaches outside our control',
    ],
  },
  {
    title: '10. Third-Party Services',
    content:
      'Kairo integrates with third-party AI providers. We are not responsible for:',
    bullets: [
      'Their services, uptime, or policies',
      'Any data processed by those providers',
    ],
    footer: 'You must review and agree to their respective terms.',
  },
  {
    title: '11. Termination',
    content: 'We reserve the right to:',
    bullets: [
      'Restrict or terminate access if Terms are violated',
      'Modify or discontinue the service at any time',
    ],
  },
  {
    title: '12. Changes to Terms',
    content:
      'These Terms may be updated periodically. Continued use of Kairo constitutes acceptance of the updated Terms.',
  },
  {
    title: '13. Contact',
    content:
      'For questions or concerns, contact us at support@kairo.ai.',
  },
  {
    title: '14. Governing Law',
    content:
      'These Terms shall be governed by applicable laws of your jurisdiction.',
  },
];

export default function TermsPage() {
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
            Terms of{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Service
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
