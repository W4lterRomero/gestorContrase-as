export async function decrypt(
    encryptedData: string,
    iv: string,
    key: Uint8Array
): Promise<string> {
    if (!crypto || !crypto.subtle) {
        throw new Error("Web Crypto API is not available in this environment");
    }

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        cryptoKey,
        encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
}
