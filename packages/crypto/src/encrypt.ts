export async function encrypt(
    data: string,
    key: Uint8Array
): Promise<{ encrypted: string; iv: string }> {
    // Use Web Crypto API
    if (!crypto || !crypto.subtle) {
        throw new Error("Web Crypto API is not available in this environment");
    }

    const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM IV is typically 12 bytes

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const dataBytes = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBytes
    );

    // Convert to Base64 for storage/transport
    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}
