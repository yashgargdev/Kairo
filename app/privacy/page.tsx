import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy — Kairo',
    description: 'Read the Privacy Policy for Kairo AI.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <Link href="/chat" className="flex items-center gap-2 group">
                    <span className="text-primary font-serif italic text-xl font-bold">K</span>
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
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-400 text-sm">Last updated: February 22, 2026</p>
                </div>

                <div className="space-y-10 text-slate-300 text-[15px] leading-relaxed">
                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">1. Information We Collect</h2>
                        <p className="mb-3">When you use Kairo, we collect the following information:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Account data:</strong> Email address, name, and profile information you provide during sign-up</li>
                            <li><strong className="text-slate-300">Conversation data:</strong> Messages you send to and receive from Kairo AI, stored in our secure database</li>
                            <li><strong className="text-slate-300">Usage data:</strong> How you interact with the application (e.g., features used, session duration)</li>
                            <li><strong className="text-slate-300">Files:</strong> Documents or images you upload for AI analysis, processed in memory and not permanently stored beyond your session</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">2. How We Use Your Information</h2>
                        <p className="mb-3">Your data is used to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Provide and personalize the Kairo AI chat experience</li>
                            <li>Maintain your conversation history across sessions</li>
                            <li>Enable features like personalized AI instructions and memory</li>
                            <li>Improve the Service and fix bugs</li>
                            <li>Ensure account security and prevent abuse</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">3. Data Storage & Security</h2>
                        <p>Your data is stored securely using <strong className="text-white">Supabase</strong>, a SOC 2 Type II compliant platform. We use:</p>
                        <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-400">
                            <li>Row-level security policies to ensure only you can access your conversations</li>
                            <li>Encrypted connections (TLS) for all data in transit</li>
                            <li>Encrypted storage at rest</li>
                            <li>Optional Two-Factor Authentication (TOTP) for your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">4. Third-Party Services</h2>
                        <p className="mb-3">We use the following third-party services to operate Kairo:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Sarvam AI:</strong> Powers the AI chat responses. Your messages are sent to Sarvam's API for processing. See <span className="text-primary">sarvam.ai/privacy</span> for their policy.</li>
                            <li><strong className="text-slate-300">Supabase:</strong> Authentication and database hosting.</li>
                            <li><strong className="text-slate-300">Google OAuth:</strong> Optional sign-in method. We only receive your name and email.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">5. Data Sharing</h2>
                        <p>We <strong className="text-white">do not sell your personal data</strong> to anyone. We only share data with third-party services listed above, strictly to operate the Service. We may disclose data if required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">6. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Access all data we hold about you</li>
                            <li>Delete your account and all associated conversation history</li>
                            <li>Export your conversation data</li>
                            <li>Update or correct your profile information at any time via Settings</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">7. Conversation Memory</h2>
                        <p>Kairo stores your conversation history to provide context-aware responses. Each message is stored per-chat in our database. You can delete individual chats at any time. Deleting a chat permanently removes all messages in it from our database.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">8. Cookies</h2>
                        <p>We use session cookies to keep you logged in. No third-party advertising cookies are used. You can clear cookies via your browser settings, though this will log you out.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">9. Children's Privacy</h2>
                        <p>Kairo is not intended for children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal information, please contact us immediately.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">10. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy periodically. We will notify users of material changes. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">11. Contact Us</h2>
                        <p>For privacy-related questions or to exercise your data rights, please reach out through the Settings panel within the application.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
                    <span>© 2026 Kairo. All rights reserved.</span>
                    <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service →</Link>
                </div>
            </main>
        </div>
    );
}
