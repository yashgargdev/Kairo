'use client';

import { ModalBase } from './ModalBase';
import { UploadCloud, File, X } from 'lucide-react';
import { useState, useRef } from 'react';

export function UploadModal({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload?: (file: File) => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleContainerClick = () => {
        if (!selectedFile) {
            fileInputRef.current?.click();
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = () => {
        if (selectedFile) {
            if (onUpload) {
                onUpload(selectedFile);
            }
            setSelectedFile(null);
            onClose();
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Upload Document">
            <div
                onClick={handleContainerClick}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors ${selectedFile ? 'border-primary/50 bg-primary/5 cursor-default' : 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer group'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.txt,.docx,.xlsx,.xls,.csv,.md,.py,.html,.css,.java,.js,.ts,.png,.jpg,.jpeg"
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center animate-fade-in w-full">
                        <div className="flex items-center gap-3 w-full bg-surface-dark border border-white/10 p-3 rounded-lg mb-6">
                            <File className="w-8 h-8 text-primary shadow-glow-gold-subtle" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={handleRemoveFile}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={handleUpload}
                            className="w-full py-2.5 bg-gradient-gold text-black rounded-xl font-semibold shadow-glow-gold-subtle hover:brightness-110 active:scale-95 transition-all"
                        >
                            Attach Document
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-foreground/40 group-hover:text-primary transition-colors mb-4" />
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PDF, TXT, or DOCX (max 10MB)</p>
                    </>
                )}
            </div>
        </ModalBase>
    );
}
