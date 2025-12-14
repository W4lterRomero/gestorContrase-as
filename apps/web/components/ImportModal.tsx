'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: any[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setLoading(false);
                if (results.errors.length > 0) {
                    console.error("CSV Errors:", results.errors);
                    setError('Error parsing CSV. Please check the format.');
                    return;
                }

                const data = results.data as any[];

                // Map common CSV columns to our schema
                // Chrome/Brave: name, url, username, password
                // Firefox: "url","username","password","httpRealm","formActionOrigin","guid","timeCreated","timeLastUsed","timePasswordChanged"

                const mappedItems = data.map((row: any) => ({
                    title: row.name || row.Title || row.title || row.url || 'Untitled',
                    url: row.url || row.URL || row.Url || '',
                    username: row.username || row.Username || row.login_username || '',
                    password: row.password || row.Password || row.login_password || '',
                    notes: row.notes || row.note || ''
                })).filter(item => item.password); // Only import items with passwords

                if (mappedItems.length === 0) {
                    setError('No passwords found in file. Make sure headers include "username" and "password".');
                    return;
                }

                onImport(mappedItems);
                onClose();
            },
            error: (err) => {
                setLoading(false);
                setError('Failed to read file: ' + err.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Import Passwords</h2>
                <p className="text-sm text-zinc-500 mb-6">
                    Upload a CSV file exported from Chrome, Brave, Safari, or other password managers.
                </p>

                <div className="space-y-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-zinc-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-zinc-800 dark:file:text-zinc-300
                "
                    />

                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="text-blue-500 text-sm">Processing file...</div>
                    )}
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
