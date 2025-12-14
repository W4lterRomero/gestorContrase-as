import { argon2id } from '@noble/hashes/argon2';
import { randomBytes } from '@noble/hashes/utils';

export async function deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number = 3 // Argon2id iterations, adjust based on performance needs
): Promise<Uint8Array> {
    const passwordBytes = new TextEncoder().encode(password);

    // Argon2id parameters recommended for general use
    return argon2id(passwordBytes, salt, {
        t: iterations,      // iterations
        m: 65536,          // memory (64 MB)
        p: 1,              // parallelism
        dkLen: 32          // output length (256 bits)
    });
}

export function generateSalt(): Uint8Array {
    return randomBytes(32);
}
