'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';
import { deriveKey, generateSalt } from '@password-manager/crypto';

// Helper to convert Uint8Array to Hex string for transport (simplified)
// Actually server routes expect Base64 or Hex? Let's check server...
// Server routes expect strings. @password-manager/crypto uses Uint8Array.
// We need formatting helpers.

function toHex(buffer: Uint8Array): string {
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
    const matches = hex.match(/.{1,2}/g);
    if (!matches) return new Uint8Array();
    return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

// Better yet, let's use the Base64 utils from the crypto package if they were exported, 
// or just standard Buffer/btoa in browser.
function bufferToBase64(buf: Uint8Array): string {
    let binary = '';
    const len = buf.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buf[i]);
    }
    return window.btoa(binary);
}

// In the Implementation Plan we decided: 
// AuthKey = KDF(MasterPassword, Salt_Auth)
// We send the HASH of this AuthKey to the server.

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleRegister() {
        // 1. Generate Salts
        const saltAuth = generateSalt();
        const saltEnc = generateSalt();

        // 2. Derive Keys
        // AuthKey is derived from Password + Salt_Auth
        const authKey = await deriveKey(password, saltAuth);

        // We send HASH(AuthKey) to server so server doesn't even know AuthKey
        // Actually, usually we send derived key and server hashes it. 
        // Plan said: "AuthKey = KDF(Pass, Salt)" -> Sent to server.
        // Server implementation: "const hashedAuthKey = await bcrypt.hash(body.authKeyHash, 10);"
        // So we just send the Base64 of AuthKey.

        const authKeyString = bufferToBase64(authKey);
        const saltAuthString = bufferToBase64(saltAuth);
        const saltEncString = bufferToBase64(saltEnc);

        await fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email,
                authKeyHash: authKeyString,
                saltAuth: saltAuthString,
                saltEnc: saltEncString
            })
        });

        // Auto login after register
        await handleLogin();
    }

    async function handleLogin() {
        // 1. Get Salt from Server
        // We need to implement /auth/get-salt endpoint or just try login and fail?
        // The server has /auth/get-salt.

        const { saltAuth: saltAuthBase64 } = await fetchApi('/auth/get-salt', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        // Convert base64 salt back to Uint8Array
        const saltAuth = Uint8Array.from(atob(saltAuthBase64), c => c.charCodeAt(0));

        // 2. Derive AuthKey
        const authKey = await deriveKey(password, saltAuth);
        const authKeyString = bufferToBase64(authKey);

        // 3. Send to Server
        const response = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                authKeyHash: authKeyString
            })
        });

        // 4. Store Token & Derive Encryption Key
        localStorage.setItem('token', response.token);

        // We derive the Master Encryption Key using the salt from the server/user data
        // In a real app we would use a second salt (Salt_Enc) returned from login or derived differently.
        // For this simple implementation, let's assume we use the same password but different salt?
        // Actually the plan said "MasterEncryptionKey = KDF(MasterPassword, Salt_Enc)".
        // The login response returns `saltEnc`.

        const saltEnc = Uint8Array.from(atob(response.saltEnc), c => c.charCodeAt(0));
        const masterKey = await deriveKey(password, saltEnc);
        const masterKeyString = bufferToBase64(masterKey);

        // Store strictly in SessionStorage (cleared on tab close) for security
        sessionStorage.setItem('masterKey', masterKeyString);

        router.push('/dashboard');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">SecurePass</h1>
                    <p className="text-gray-500 mt-2">Zero-Knowledge Encryption</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Master Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Unlock Vault' : 'Create Vault')}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-500 hover:underline"
                    >
                        {isLogin ? 'New here? Create vault' : 'Have a vault? Unlock it'}
                    </button>
                </div>
            </div>
        </main>
    );
}
