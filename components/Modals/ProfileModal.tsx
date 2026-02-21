'use client';

import { ModalBase } from './ModalBase';
import { useState, useTransition } from 'react';
import { updateProfile } from '@/app/login/actions';

export function ProfileModal({
    isOpen,
    onClose,
    userEmail,
    initialName = '',
    initialPhone = ''
}: {
    isOpen: boolean,
    onClose: () => void,
    userEmail: string,
    initialName?: string,
    initialPhone?: string
}) {
    const [name, setName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);

            const result = await updateProfile(formData);

            if (result.error) {
                alert(`Error saving profile: ${result.error}`);
            } else {
                onClose();
            }
        });
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email Address</label>
                    <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="w-full bg-surface-dark border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-500 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary/50 transition-colors text-white"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary/50 transition-colors text-white"
                    />
                </div>

                <div className="pt-4 mt-2 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isPending} className="px-5 py-2 text-[13px] font-semibold text-black bg-gradient-gold rounded-xl shadow-glow-gold-subtle hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                        {isPending && <span className="size-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
