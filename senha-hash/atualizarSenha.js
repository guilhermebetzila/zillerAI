import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atualizarSenha() {
  // nova hash gerada para a senha "Dubran10@@"
  const novoHash = '$2b$10$To.c86ZQn0NvMviTidM0OE0o.r390AdOzGAq074kt8DVmKm9Dm5rK';
  const idUsuario = 7; // ajuste o ID do usuário correto

  const usuario = await prisma.user.update({
    where: { id: idUsuario },
    data: { senha: novoHash },
  });

  console.log('✅ Senha atualizada com sucesso:', usuario);
}

atualizarSenha()
  .catch((e) => console.error('❌ Erro ao atualizar senha:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
