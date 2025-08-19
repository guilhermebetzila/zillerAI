import { PrismaClient } from '@prisma/client'

const local = new PrismaClient({
  datasources: {
    db: { 
      url: "postgresql://usuario_local:senha@localhost:5432/seubanco" // URL do Postgres local
    }
  }
})

const remote = new PrismaClient({
  datasources: {
    db: { 
      url: process.env.DATABASE_URL! // URL do Railway no seu .env
    }
  }
})

async function main() {
  const users = await local.user.findMany()
  console.log(`Migrando ${users.length} usuários...`)

  for (const u of users) {
    await remote.user.upsert({
      where: { email: u.email }, // garante que não duplica
      update: {}, // não altera se já existir
      create: {
        email: u.email,
        nome: u.nome,
        senha: u.senha,
        saldo: u.saldo,
        cpf: u.cpf ?? "00000000000" // 👈 se não tiver cpf, coloca padrão
      }
    })
  }

  console.log("Migração concluída ✅")
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await local.$disconnect()
    await remote.$disconnect()
  })
