'use client';

import { useState } from 'react';

interface VaultItem {
    id?: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    createdAt?: number;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: VaultItem) => void;
}

export function CreateItemModal({ isOpen, onClose, onSave }: ModalProps) {
    const [formData, setFormData] = useState<VaultItem>({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, createdAt: Date.now() });
        onClose();
        // Reset form
        setFormData({ title: '', username: '', password: '', url: '', notes: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">New Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Title</label>
                        <input
                            required
                            className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Google Account"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Username/Email</label>
                            <input
                                required
                                className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text" // Show by default for ease of verify? Or password type
                                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                                        const len = 16;
                                        let pass = "";
                                        for (let i = 0; i < len; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                                        setFormData(prev => ({ ...prev, password: pass }));
                                    }}
                                    className="absolute right-2 top-2 text-xs text-blue-500 hover:text-blue-600"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Website URL</label>
                        <input
                            className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Notes</label>
                        <textarea
                            className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
