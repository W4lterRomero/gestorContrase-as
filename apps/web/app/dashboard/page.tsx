'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { CreateItemModal } from '../../components/CreateItemModal';
import { encrypt, decrypt } from '@password-manager/crypto';

// Helper to handle base64 strings
function fromBase64(str: string): Uint8Array {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export default function Dashboard() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const keyStr = sessionStorage.getItem('masterKey');

        if (!token || !keyStr) {
            router.push('/');
            return;
        }

        setMasterKey(fromBase64(keyStr));

        // Load vault
        loadVault(fromBase64(keyStr));
    }, [router]);

    async function loadVault(key: Uint8Array) {
        try {
            setLoading(true);
            const vault = await fetchApi('/vault');

            if (vault.encryptedData && vault.iv) {
                // Decrypt
                const jsonStr = await decrypt(vault.encryptedData, vault.iv, key);
                const data = JSON.parse(jsonStr);
                if (Array.isArray(data)) {
                    setItems(data);
                }
            }
        } catch (err) {
            console.error("Failed to load vault or vault is empty", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveItem(newItem: any) {
        if (!masterKey) return;

        const updatedItems = [...items, { ...newItem, id: crypto.randomUUID() }];
        setItems(updatedItems);
        setIsModalOpen(false);

        // Encrypt and Sync
        try {
            const jsonStr = JSON.stringify(updatedItems);
            const { encrypted, iv } = await encrypt(jsonStr, masterKey);

            await fetchApi('/vault', {
                method: 'POST',
                body: JSON.stringify({
                    encryptedData: encrypted,
                    iv: iv
                })
            });
            console.log("Vault synced successfully!");
        } catch (err) {
            console.error("Failed to sync vault", err);
            alert("Failed to sync to cloud. Your changes are local only (in memory).");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('masterKey');
        router.push('/');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center dark:text-white">Loading Vault...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">My Vault</h1>
                    <p className="text-zinc-500 text-sm">{items.length} items</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + New Item
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                {items.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="text-4xl mb-4">🔐</div>
                        <h3 className="text-lg font-medium dark:text-white">Your vault is empty</h3>
                        <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                            Add your first password to get started with secure, zero-knowledge storage.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {items.map(item => (
                            <div key={item.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-500 transition-colors cursor-pointer shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold dark:text-white">{item.title}</h3>
                                        <p className="text-sm text-zinc-500">{item.username}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.password);
                                            alert("Password copied!");
                                        }}
                                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-blue-500"
                                    >
                                        Copy Pass
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <CreateItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
            />
        </div>
    );
}
