// lib/queries/user.ts

import { prisma } from '@/lib/prisma'

export async function getAllUsers() {
  return await prisma.user.findMany()
}
