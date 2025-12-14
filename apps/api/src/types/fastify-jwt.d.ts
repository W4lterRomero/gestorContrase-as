import '@fastify/jwt';

declare module 'fastify' {
    interface FastifyInstance {
        jwt: {
            sign(payload: any): string;
            verify<T>(token: string): T;
        }
    }
}
