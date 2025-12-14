import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { authRoutes } from './routes/auth';
import { vaultRoutes } from './routes/vault';

const fastify = Fastify({
    logger: true
});

// Register plugins
fastify.register(cors);
fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

// Health check
fastify.get('/health', async () => {
    return { status: 'ok' };
});

// Root route
fastify.get('/', async () => {
    return { message: 'Password Manager API is running 🚀' };
});

// Register Routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(vaultRoutes, { prefix: '/vault' });

const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
