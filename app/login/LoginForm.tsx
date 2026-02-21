'use client';

import { useState } from 'react';
import Link from 'next/link';
import { continueWithEmail } from './actions';
import { createClient } from '@/utils/supabase/client';

export function LoginForm({ error }: { error?: string }) {
    const [email, setEmail] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleAppleSignIn = () => {
        // Placeholder for Apple sign-in
        alert('Apple Sign-in is not configured yet.');
    };

    return (
        <div className="flex flex-col w-full max-w-sm mx-auto">
            <h2 className="text-[28px] md:text-[32px] font-serif font-medium text-white mb-8 tracking-tight">
                Login to your account
            </h2>

            {/* Social Buttons */}
            <div className="flex gap-3 mb-8">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="flex-1 flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white font-medium text-sm disabled:opacity-50 shadow-sm"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
            </div>

            <div className="relative flex items-center py-2 mb-6">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-[11px] font-medium tracking-widest uppercase">OR</span>
                <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all bg-white/[0.02]">
                        <div className="flex items-center px-4 py-3.5 bg-white/[0.03] border-r border-white/5">
                            <span className="material-symbols-outlined text-[18px] text-slate-500">mail</span>
                        </div>
                        <input
                            className="w-full bg-transparent text-white px-4 py-3.5 focus:outline-none text-[15px] placeholder-slate-500 font-light"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all bg-white/[0.02]">
                        <div className="flex items-center px-4 py-3.5 bg-white/[0.03] border-r border-white/5">
                            <span className="material-symbols-outlined text-[18px] text-slate-500">lock</span>
                        </div>
                        <input
                            className="w-full bg-transparent text-white px-4 py-3.5 focus:outline-none text-[15px] placeholder-slate-500 font-light"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium text-center border border-red-500/10">
                        {error}
                    </p>
                )}

                <button
                    formAction={continueWithEmail}
                    className="w-full py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all active:scale-[0.98] text-[15px] mt-2 shadow-xl shadow-white/5"
                >
                    Continue
                </button>
            </form>

            <div className="flex items-center justify-center gap-6 mt-32">
                <Link href="/privacy" className="text-[11px] text-slate-600 font-medium hover:text-slate-400 transition-colors">Privacy policy</Link>
                <Link href="/terms" className="text-[11px] text-slate-600 font-medium hover:text-slate-400 transition-colors">Terms of service</Link>
            </div>
        </div>
    );
}
