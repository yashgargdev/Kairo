import { updatePassword } from '@/app/update-password/actions';
import Link from 'next/link';

export default async function UpdatePasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 text-white">
            <div className="w-full max-w-sm flex flex-col">
                <div className="mb-8 text-center">
                    <h2 className="text-[26px] md:text-[30px] font-serif font-medium mb-3 tracking-tight">Set new password</h2>
                    <p className="text-slate-400 text-[14px]">Please enter your new password below.</p>
                </div>

                <form className="flex flex-col gap-4">
                    <div className="flex items-center border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all bg-white/[0.02]">
                        <div className="flex items-center px-4 py-3 bg-white/[0.03] border-r border-white/5">
                            <span className="material-symbols-outlined text-[18px] text-slate-500">lock</span>
                        </div>
                        <input
                            className="w-full bg-transparent text-white pl-4 pr-12 py-3 focus:outline-none text-[15px] placeholder-slate-500 font-light"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="New Password"
                            required
                        />
                    </div>

                    {searchParams?.error && (
                        <p className="p-3 rounded-xl text-xs font-medium text-center bg-red-500/10 text-red-400 border border-red-500/10">
                            {searchParams.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        formAction={updatePassword}
                        className="w-full py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all active:scale-[0.98] text-[15px] mt-2 shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                    >
                        Update Password
                    </button>
                    
                </form>
            </div>
        </div>
    );
}
