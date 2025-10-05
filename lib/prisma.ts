// app/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // Adiciona prisma ao globalThis para evitar múltiplas instâncias no dev
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
