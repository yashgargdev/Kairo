import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service — Kairo',
    description: 'Read the Terms of Service for Kairo AI.',
};

export default function TermsPage() {
    return (
        <div className="w-full h-full overflow-y-auto relative z-10">
            {/* Header */}
            <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <Link href="/chat" className="flex items-center gap-2 group">
                    <img src="/Kairo-Logo-White.png" alt="Kairo Logo" className="size-6 object-contain" />
                    <span className="text-white font-medium text-sm tracking-wide">kairo</span>
                </Link>
                <Link href="/chat" className="text-xs text-slate-500 hover:text-white transition-colors">
                    ← Back to Kairo
                </Link>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <p className="text-xs text-primary font-semibold tracking-widest uppercase mb-3">Legal</p>
                    <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-400 text-sm">Last updated: February 22, 2026</p>
                </div>

                <div className="space-y-10 text-slate-300 text-[15px] leading-relaxed">
                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using Kairo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. Kairo is an AI-powered chat application designed to assist users with information and creative tasks.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">2. Use of the Service</h2>
                        <p className="mb-3">You agree to use Kairo only for lawful purposes. You may not:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Use the Service to generate harmful, illegal, or abusive content</li>
                            <li>Attempt to reverse-engineer or probe the underlying AI models</li>
                            <li>Misuse the Service in a way that disrupts other users</li>
                            <li>Share access credentials or use the Service on behalf of others without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">3. AI-Generated Content</h2>
                        <p>Kairo uses AI models to generate responses. These responses may not always be accurate, complete, or up-to-date. <strong className="text-white">Always verify important information independently.</strong> Kairo is not liable for decisions made based on AI-generated content.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">4. User Data & Privacy</h2>
                        <p>Your conversations and data are stored securely in our database. We do not sell your data to third parties. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details on how we handle your information.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">5. Account Responsibility</h2>
                        <p>You are responsible for maintaining the security of your account. Enable Two-Factor Authentication for enhanced security. Notify us immediately at the contact below if you suspect unauthorized access.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">6. Intellectual Property</h2>
                        <p>The Kairo name, logo, and interface design are proprietary. AI-generated content produced during your sessions is yours to use, subject to applicable laws and the terms of the underlying AI model providers.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">7. Service Availability</h2>
                        <p>We strive for high availability but do not guarantee uninterrupted access. The Service may be modified, suspended, or discontinued at any time with reasonable notice.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">8. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law, Kairo and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">9. Changes to Terms</h2>
                        <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes your acceptance of the new Terms. We will make reasonable efforts to notify users of significant changes.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">10. Contact</h2>
                        <p>For questions about these Terms, please reach out through the Settings panel within the application.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
                    <span>© 2026 Kairo. All rights reserved.</span>
                    <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy →</Link>
                </div>
            </main>
        </div>
    );
}
