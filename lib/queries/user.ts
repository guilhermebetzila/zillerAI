// lib/queries/user.ts

import { prisma } from '@lib/prisma'

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany()
    return users
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }
}
