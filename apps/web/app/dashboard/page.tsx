'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';

export default function Dashboard() {
    const router = useRouter();
    // Mock data for now until API is ready
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }

        // Simulate loading
        setTimeout(() => {
            setLoading(false);
        }, 500);

        // TODO: Fetch vault items from API
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Vault...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">My Vault</h1>
                    <p className="text-zinc-500 text-sm">0 items</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                        {/* List items here */}
                    </div>
                )}
            </main>
        </div>
    );
}
