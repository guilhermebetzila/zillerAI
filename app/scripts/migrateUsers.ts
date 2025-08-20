import { PrismaClient } from '@prisma/client'

// Conexão com o banco LOCAL (usa LOCAL_DATABASE_URL do .env)
const local = new PrismaClient({
  datasources: {
    db: { url: process.env.LOCAL_DATABASE_URL! }
  }
})

// Conexão com o banco REMOTO (Railway - usa DATABASE_URL do .env)
const remote = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL! }
  }
})

async function main() {
  // Buscar todos os usuários do banco local
  const users = await local.user.findMany()
  console.log(`🚀 Migrando ${users.length} usuários...`)

  for (const u of users) {
    await remote.user.upsert({
      where: { email: u.email }, // evita duplicar pelo e-mail
      update: {}, // não sobrescreve caso já exista
      create: {
        email: u.email,
        nome: u.nome,
        senha: u.senha,
        saldo: u.saldo,
        cpf: u.cpf ?? "00000000000" // fallback se não tiver CPF
      }
    })
  }

  console.log("✅ Migração concluída com sucesso!")
}

main()
  .catch(e => console.error("❌ Erro na migração:", e))
  .finally(async () => {
    await local.$disconnect()
    await remote.$disconnect()
  })
