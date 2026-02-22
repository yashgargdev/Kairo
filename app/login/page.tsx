import { LoginForm } from './LoginForm'
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage(
    props: { searchParams: Promise<{ error: string }> }
) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect('/chat');
    }
    const searchParams = await props.searchParams;
    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#050505]">
            {/* Left Panel: Visual/Atmosphere */}
            <div className="hidden md:block w-1/2 relative min-h-[400px]">
                <img
                    src="/login-bg.png"
                    alt="Atmospheric Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Visual Overlay: Deeper gradient for dark mode transition */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/20 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none"></div>
            </div>

            {/* Right Panel: Form */}
            <div className="w-full md:w-1/2 flex flex-col min-h-screen bg-[#050505] relative border-l border-white/5">
                {/* Subtle Glow Orb for depth */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

                {/* Top Bar: Logo left, legal links right */}
                <div className="p-8 md:p-12 pb-0 relative z-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/Kairo-Logo-White.png"
                            alt="Kairo Logo"
                            className="size-10 object-contain"
                        />
                        <span className="text-xl font-serif font-bold text-white tracking-tight">kairo</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium">Terms</Link>
                        <Link href="/privacy" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium">Privacy</Link>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex flex-col justify-center px-8 md:px-0 pb-8 pt-4 relative z-10">
                    <LoginForm error={searchParams?.error} />
                </div>
            </div>
        </div>
    )
}
