'use client';

import { ModalBase } from './ModalBase';
import { useState, useTransition } from 'react';
import { updatePersonalization } from '@/app/login/actions';

export function PersonalizationModal({
    isOpen,
    onClose,
    initialAboutYou = '',
    initialCustomInstructions = ''
}: {
    isOpen: boolean,
    onClose: () => void,
    initialAboutYou?: string,
    initialCustomInstructions?: string
}) {
    const [aboutYou, setAboutYou] = useState(initialAboutYou);
    const [customInstructions, setCustomInstructions] = useState(initialCustomInstructions);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('aboutYou', aboutYou);
            formData.append('customInstructions', customInstructions);

            const result = await updatePersonalization(formData);

            if (result.error) {
                alert(`Error saving personalization: ${result.error}`);
            } else {
                onClose();
            }
        });
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Personalization">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-white mb-2">About you</h3>
                    <p className="text-xs text-slate-400 mb-3">What would you like Kairo to know about you to provide better responses?</p>
                    <textarea
                        value={aboutYou}
                        onChange={(e) => setAboutYou(e.target.value)}
                        placeholder="e.g., I'm a software developer based in New York. I prefer concise answers."
                        className="w-full h-32 bg-background border border-white/10 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-primary/50 transition-colors text-white resize-none"
                    />
                </div>

                <div>
                    <h3 className="text-sm font-medium text-white mb-2">Custom instructions</h3>
                    <p className="text-xs text-slate-400 mb-3">How would you like Kairo to respond?</p>
                    <textarea
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g., Explain things like I'm a beginner. Always write code in TypeScript."
                        className="w-full h-32 bg-background border border-white/10 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-primary/50 transition-colors text-white resize-none"
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
