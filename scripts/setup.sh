#!/bin/bash

echo "🚀 Configurando Password Manager..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar prerrequisitos
echo -e "${YELLOW}Verificando prerrequisitos...${NC}"
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm no está instalado"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker no está instalado"; exit 1; }

echo -e "${GREEN}✓ Prerrequisitos OK${NC}"

# 2. Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
pnpm install

# 3. Copiar archivos .env si no existen
if [ ! -f apps/api/.env ]; then
    echo -e "${YELLOW}Creando apps/api/.env...${NC}"
    cp apps/api/.env.example apps/api/.env 2>/dev/null || echo "⚠️ apps/api/.env.example no encontrado"
fi

if [ ! -f apps/web/.env.local ]; then
    echo -e "${YELLOW}Creando apps/web/.env.local...${NC}"
    cp apps/web/.env.example apps/web/.env.local 2>/dev/null || echo "⚠️ apps/web/.env.example no encontrado"
fi

# 4. Levantar Docker Compose
if [ -f docker/docker-compose.yml ]; then
    echo -e "${YELLOW}Iniciando servicios Docker...${NC}"
    docker-compose -f docker/docker-compose.yml up -d
    
    echo -e "${YELLOW}Esperando a PostgreSQL...${NC}"
    sleep 5
fi

# 5. Ejecutar migraciones
# (Disabled until api setup is complete)
# echo -e "${YELLOW}Ejecutando migraciones de base de datos...${NC}"
# cd apps/api && pnpm prisma migrate dev --name init && pnpm prisma generate && cd ../..

echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo "Para iniciar el desarrollo, ejecuta: pnpm dev"
