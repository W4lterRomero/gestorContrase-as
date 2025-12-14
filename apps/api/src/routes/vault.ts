import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const updateVaultSchema = z.object({
    encryptedData: z.string(),
    iv: z.string(),
    version: z.number().default(1)
});

export async function vaultRoutes(fastify: FastifyInstance) {
    // Ensure user is authenticated for all routes here
    fastify.addHook('onRequest', async (request) => {
        await request.jwtVerify();
    });

    // Get User Vault
    fastify.get('/', async (request, reply) => {
        const { userId } = request.user as { userId: string };

        const vault = await prisma.vault.findUnique({
            where: { userId }
        });

        if (!vault) {
            // Should basically never happen if we create vault on register
            return reply.code(404).send({ error: 'Vault not found' });
        }

        return vault;
    });

    // Sync / Update Vault
    // Simple strategy: Overwrite (Last Write Wins) for now
    fastify.post('/', async (request, reply) => {
        const { userId } = request.user as { userId: string };

        try {
            const body = updateVaultSchema.parse(request.body);

            const vault = await prisma.vault.upsert({
                where: { userId },
                update: {
                    encryptedData: body.encryptedData,
                    iv: body.iv,
                    version: { increment: 1 },
                    lastSyncedAt: new Date()
                },
                create: {
                    userId,
                    encryptedData: body.encryptedData,
                    iv: body.iv,
                    version: 1
                }
            });

            return {
                success: true,
                version: vault.version,
                lastSyncedAt: vault.lastSyncedAt
            };

        } catch (error: any) {
            request.log.error(error);
            return reply.code(400).send({ error: 'Invalid data', details: error });
        }
    });
}
