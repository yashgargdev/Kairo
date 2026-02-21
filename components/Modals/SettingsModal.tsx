'use client';

import { ModalBase } from './ModalBase';
import { useState, useTransition, useEffect } from 'react';
import { changePassword, enrollMFA, verifyMFA, unenrollMFA, getMFAFactors } from '@/app/login/actions';

type MFAStep = 'idle' | 'qr' | 'verify' | 'enabled';

export function SettingsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean,
    onClose: () => void,
}) {
    const [mfaStep, setMFAStep] = useState<MFAStep>('idle');
    const [factorId, setFactorId] = useState<string | null>(null);
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [mfaError, setMFAError] = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isPending, startTransition] = useTransition();

    // Load current MFA status when modal opens
    useEffect(() => {
        if (isOpen) {
            getMFAFactors().then(result => {
                if (result.success && result.factors && result.factors.length > 0) {
                    setFactorId(result.factors[0].id);
                    setMFAStep('enabled');
                } else {
                    setMFAStep('idle');
                    setFactorId(null);
                }
            });
        }
    }, [isOpen]);

    const handleEnroll = () => {
        setMFAError('');
        startTransition(async () => {
            const result = await enrollMFA();
            if ('error' in result && result.error) {
                setMFAError(result.error);
                return;
            }
            if (result.success) {
                setFactorId(result.factorId!);
                setQrCodeSvg(result.qrCodeUrl!);
                setSecret(result.secret!);
                setMFAStep('qr');
            }
        });
    };

    const handleVerify = () => {
        if (!factorId || otpCode.length !== 6) return;
        setMFAError('');
        startTransition(async () => {
            const result = await verifyMFA(factorId, otpCode);
            if (result.error) {
                setMFAError(result.error);
                setOtpCode('');
                return;
            }
            setMFAStep('enabled');
            setOtpCode('');
            setQrCodeSvg(null);
        });
    };

    const handleDisable = () => {
        if (!factorId) return;
        setMFAError('');
        startTransition(async () => {
            const result = await unenrollMFA(factorId);
            if (result.error) {
                setMFAError(result.error);
                return;
            }
            setMFAStep('idle');
            setFactorId(null);
        });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const formData = new FormData();
            formData.append('password', newPassword);
            const result = await changePassword(formData);
            if (result.success) {
                alert('Password updated successfully!');
                setShowPasswordForm(false);
                setNewPassword('');
            } else {
                alert(`Error: ${result.error}`);
            }
        });
    };

    const is2FAEnabled = mfaStep === 'enabled';

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-foreground/70 mb-4">Security</h3>

                    <div className="space-y-4">
                        {/* 2FA Section */}
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${is2FAEnabled ? 'text-primary' : 'text-slate-500'}`}>security_update_good</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                                        <p className="text-[11px] text-slate-400">
                                            {is2FAEnabled ? 'TOTP authenticator active' : 'Add an extra layer of security.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={is2FAEnabled ? handleDisable : (mfaStep === 'qr' || mfaStep === 'verify' ? undefined : handleEnroll)}
                                    disabled={isPending || mfaStep === 'qr' || mfaStep === 'verify'}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none disabled:opacity-50 ${is2FAEnabled ? 'bg-primary' : 'bg-white/10'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                                </button>
                            </div>

                            {/* QR Code Step */}
                            {mfaStep === 'qr' && qrCodeSvg && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="text-center space-y-2">
                                        <p className="text-xs text-slate-300 font-medium">Scan with your authenticator app</p>
                                        <p className="text-[10px] text-slate-500">(Google Authenticator, Authy, etc.)</p>
                                    </div>
                                    {/* QR Code - Supabase returns SVG data URI */}
                                    <div className="flex justify-center">
                                        <div className="bg-white p-3 rounded-xl">
                                            <img src={qrCodeSvg} alt="2FA QR Code" className="w-40 h-40" />
                                        </div>
                                    </div>
                                    {secret && (
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 mb-1">Or enter manually:</p>
                                            <code className="text-[11px] bg-white/5 px-2 py-1 rounded text-slate-300 tracking-widest break-all">{secret}</code>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setMFAStep('verify')}
                                        className="w-full py-2 bg-primary text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all"
                                    >
                                        I'VE SCANNED IT →
                                    </button>
                                </div>
                            )}

                            {/* OTP Verify Step */}
                            {mfaStep === 'verify' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-xs text-slate-300">Enter the 6-digit code from your authenticator app:</p>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center tracking-[0.5em] font-mono focus:outline-none focus:border-primary/50"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMFAStep('qr')}
                                            className="flex-1 py-2 bg-white/5 text-white text-xs rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handleVerify}
                                            disabled={isPending || otpCode.length !== 6}
                                            className="flex-1 py-2 bg-primary text-black text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
                                        >
                                            {isPending ? 'VERIFYING...' : 'VERIFY & ENABLE'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {mfaError && (
                                <p className="text-[11px] text-red-400 text-center">{mfaError}</p>
                            )}
                        </div>

                        {/* Change Password */}
                        {!showPasswordForm ? (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">key</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">Change Password</p>
                                        <p className="text-[11px] text-slate-400">Update your account password regularly.</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-500 text-[20px]">chevron_right</span>
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-white">New Password</p>
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-wider">Cancel</button>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                                <button
                                    type="submit"
                                    disabled={isPending || newPassword.length < 6}
                                    className="w-full py-2 bg-primary text-black text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all font-serif italic"
                                >
                                    {isPending ? 'UPDATING...' : 'CONFIRM CHANGE'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}
