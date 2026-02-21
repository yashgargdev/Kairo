'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toggleChatShare } from '@/app/chat/actions';
import { useUI } from './Providers/UIProvider';

export default function Header() {
    const [shareCopied, setShareCopied] = useState(false);
    const params = useParams();
    const chatId = params?.id as string;
    const { toggleMobileMenu } = useUI();

    const handleShare = async () => {
        if (!chatId || chatId === 'new') {
            alert('Please send a message first to share this chat.');
            return;
        }

        try {
            // Make the chat public in the database
            const result = await toggleChatShare(chatId, true);
            if (!result.success) {
                console.error('Failed to update share status:', result.error);
            }

            await navigator.clipboard.writeText(window.location.href);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <header className="glass-header h-16 px-8 flex items-center justify-between absolute top-0 w-full z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-slate-400 hover:text-white transition-colors flex items-center"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs tracking-wide font-sans">Model:</span>
                    <h2 className="text-sm font-serif font-medium text-white tracking-wider border-b border-primary/30 pb-0.5">Sarvam-M</h2>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button
                    onClick={handleShare}
                    className={`transition-colors ${shareCopied ? 'text-green-400' : 'text-slate-500 hover:text-primary'}`}
                    title="Share chat"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {shareCopied ? 'check' : 'share'}
                    </span>
                </button>
            </div>
        </header>
    );
}
