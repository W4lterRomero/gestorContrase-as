# Password Manager

Gestor de contraseñas multiplataforma (Web, iOS, Android) con arquitectura Zero-Knowledge.

## Prerrequisitos

Asegúrate de tener instalados:
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop

## Setup Inicial

1. Ejecuta el script de configuración:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

## Estructura

- `apps/api`: Backend (Fastify + Prisma)
- `apps/web`: Web Frontend (Next.js)
- `apps/mobile`: Mobile App (Expo)
- `packages/crypto`: Librería de encriptación compartida (Critical)
