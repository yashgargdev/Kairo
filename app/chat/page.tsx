'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/chat/new');
    }, [router]);

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span className="text-xs font-medium uppercase tracking-widest">Initializing...</span>
            </div>
        </div>
    );
}
