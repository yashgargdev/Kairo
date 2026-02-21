'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { SettingsModal } from './Modals/SettingsModal';
import { ProfileModal } from './Modals/ProfileModal';
import { PersonalizationModal } from './Modals/PersonalizationModal';
import { logout } from '@/app/login/actions';
import { getChats, deleteChat } from '@/app/chat/actions';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { useUI } from './Providers/UIProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ user }: { user?: User | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useUI();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // Use direct API call with no-cache to guarantee fresh data
                const res = await fetch('/api/chats', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setChats(data);
                }
            } catch (e) {
                console.error('Failed to fetch chats:', e);
            }
        };
        if (user) fetchChats();

        // Listen for new chat creations or updates to refresh the sidebar
        const handleChatUpdate = () => {
            if (user) fetchChats();
        };

        window.addEventListener('chat-updated', handleChatUpdate);
        return () => window.removeEventListener('chat-updated', handleChatUpdate);
    }, [user]);

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDeleting) return;
        setIsDeleting(chatId);

        const result = await deleteChat(chatId);
        if (result?.success) {
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (pathname === `/chat/${chatId}`) {
                router.push('/chat/new');
            }
        } else {
            console.error('Failed to delete chat:', result?.error);
        }
        setIsDeleting(null);
    };

    const filteredChats = chats.filter(chat =>
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname, setIsMobileMenuOpen]);

    // Get user details
    const userEmail = user?.email || '';
    const name = user?.user_metadata?.full_name || '';
    const aboutYou = user?.user_metadata?.about_you || '';
    const customInstructions = user?.user_metadata?.custom_instructions || '';
    const mfaEnabled = user?.user_metadata?.mfa_enabled || false;
    const phone = user?.user_metadata?.phone || '';

    // Get initials for avatar
    const initial = name ? name.charAt(0).toUpperCase() : (userEmail ? userEmail.charAt(0).toUpperCase() : 'U');
    const displayName = name || (userEmail ? userEmail.split('@')[0] : 'Guest');

    const sidebarContent = (
        <>
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center size-10">
                            <img src="/Kairo-Logo-White.png" alt="Kairo Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-xl font-serif font-semibold leading-none tracking-wide">Kairo</h1>
                            <p className="text-primary/80 text-[10px] font-medium tracking-widest uppercase mt-1">Evolving Intelligence</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <Link href="/chat/new" className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg transition-all group mb-6">
                    <span className="material-symbols-outlined text-primary group-hover:scale-105 transition-transform font-light">add</span>
                    <span className="text-sm font-medium text-white">New Chat</span>
                </Link>
            </div>

            <div className="flex-1 px-4 pb-4 flex flex-col overflow-hidden">
                <div className="relative mb-4 shrink-0">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
                    {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all group relative ${pathname === `/chat/${chat.id}` ? 'bg-white/10 border-white/10 shadow-sm' : 'hover:bg-white/5 border-transparent'}`}
                            >
                                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-primary/70 transition-colors shrink-0">chat_bubble</span>
                                <span className={`text-[13px] font-medium truncate flex-1 pr-6 ${pathname === `/chat/${chat.id}` ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {chat.title}
                                </span>
                                <div
                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                    role="button"
                                    aria-disabled={isDeleting === chat.id}
                                    className={`absolute right-2 p-1.5 rounded-md text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 ${isDeleting === chat.id ? 'opacity-50 pointer-events-none' : ''}`}
                                    title="Delete chat"
                                >
                                    {isDeleting === chat.id ? (
                                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4 animate-fade-in opacity-50">
                            <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">{searchQuery ? 'search_off' : 'history'}</span>
                            <p className="text-xs text-slate-500 font-medium">{searchQuery ? 'No chats found' : 'No previous conversations'}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{searchQuery ? 'Try a different search term' : 'Chats will appear here'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 flex flex-col gap-2 relative" ref={profileMenuRef}>
                {/* Pop-up Profile Menu */}
                {isProfileMenuOpen && (
                    <div className="absolute bottom-[4.5rem] left-4 right-4 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 p-2 flex flex-col gap-1 backdrop-blur-2xl">
                        {/* User Info Header as Button */}
                        <button onClick={() => { setIsProfileModalOpen(true); setIsProfileMenuOpen(false); }} className="flex w-full items-center gap-3 p-3 mb-1 bg-white/[0.03] hover:bg-white/5 transition-colors rounded-xl border border-white/5 text-left group">
                            <div className="size-8 rounded-full bg-primary border text-black font-semibold text-xs flex items-center justify-center shrink-0 shadow-glow-gold-subtle group-hover:scale-105 transition-transform">
                                {initial}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{userEmail || 'Sign in to sync'}</p>
                            </div>
                        </button>

                        {/* Menu Options */}
                        <div className="flex flex-col px-1 pt-1 pb-2">
                            <button onClick={() => { setIsPersonalizationModalOpen(true); setIsProfileMenuOpen(false); }} className="flex items-center gap-3 p-2 px-3 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group">
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">palette</span>
                                Personalization
                            </button>
                            <button onClick={() => { setIsSettingsOpen(true); setIsProfileMenuOpen(false); }} className="flex items-center gap-3 p-2 px-3 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group">
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">settings</span>
                                Settings
                            </button>
                        </div>

                        <div className="h-[1px] w-[90%] mx-auto bg-white/5 mb-1" />

                        <div className="flex flex-col px-1">
                            {/* Logout Button form action */}
                            <form action={logout} className="w-full">
                                <button type="submit" className="w-full flex items-center gap-3 p-2 px-3 text-[13px] font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left group">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-red-400 transition-colors">logout</span>
                                    Log out
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 w-full p-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group relative">
                    <div className="size-8 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-300 font-serif font-medium text-xs ring-1 ring-transparent group-hover:ring-primary/40 transition-all">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-primary/70 truncate uppercase tracking-wide mt-0.5 font-semibold">Pro Member</p>
                    </div>
                    <span className={`material-symbols-outlined text-slate-500 text-[18px] transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-90 text-primary' : 'group-hover:text-slate-300'}`}>settings</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-72 h-full flex flex-col glass-panel hidden md:flex shrink-0 z-20">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-surface-dark z-[101] flex flex-col border-r border-white/5 md:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <PersonalizationModal
                isOpen={isPersonalizationModalOpen}
                onClose={() => setIsPersonalizationModalOpen(false)}
                initialAboutYou={aboutYou}
                initialCustomInstructions={customInstructions}
            />
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userEmail={userEmail}
                initialName={name}
                initialPhone={phone}
            />
        </>
    );
}
