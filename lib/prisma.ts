// app/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

/**
 * 🔹 Este arquivo garante que apenas uma instância do Prisma seja usada
 * em ambiente de desenvolvimento (evita o erro de "too many connections").
 * 🔹 Em produção, cria uma nova instância limpa.
 * 🔹 Inclui logging configurado e inicialização segura.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
