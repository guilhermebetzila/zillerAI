import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atualizarSenha() {
  const novoHash = '$2b$10$@WeIwOxDXnblxYOY0lwS09KmK4t58HvT0n5EZszwlL7lxhn.EG'; // coloque aqui o hash gerado
  const idUsuario = 7;

  const usuario = await prisma.user.update({
    where: { id: idUsuario },
    data: { senha: novoHash },
  });

  console.log('Senha atualizada com sucesso:', usuario);
}

atualizarSenha()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
