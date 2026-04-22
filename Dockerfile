# Etapa 1: Construcción (Builder)
FROM oven/bun:1 AS builder
WORKDIR /app

# Copiar archivos de dependencias (soporta bun.lock o bun.lockb)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir el proyecto SvelteKit
RUN bun run build

# Etapa 2: Producción (Runner)
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Entorno de producción
ENV NODE_ENV=production

# Copiar archivos compilados, dependencias y assets estáticos base
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/static ./static

# Exponer el puerto por defecto
EXPOSE 3000

# Ejecutar la aplicación compilada
CMD ["bun", "run", "build/index.js"]