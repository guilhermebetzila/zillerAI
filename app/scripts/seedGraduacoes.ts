// app/scripts/seedGraduacoes.ts
import { prisma } from "../../lib/prisma";

async function main() {
  const graduacoes = [
    { nome: "top-1", pontos: 100 },
    { nome: "top-2", pontos: 550 },
    { nome: "top-5", pontos: 1000 },
    { nome: "top-10", pontos: 2000 },
    { nome: "top-25", pontos: 4000 },
    { nome: "bispo", pontos: 10000 },
    { nome: "bispo-1", pontos: 20000 },
    { nome: "reis", pontos: 50000 },
    { nome: "reis-1k", pontos: 100000 },
    { nome: "reis-black", pontos: 400000 },
    { nome: "reis-black-diamond", pontos: 1000000 },
  ];

  // roda em paralelo para mais velocidade
  await Promise.all(
    graduacoes.map((g) =>
      prisma.graduacao.upsert({
        where: { pontos: g.pontos }, // `pontos` é @unique ✅
        update: { nome: g.nome }, // se já existir, atualiza o nome
        create: g,
      })
    )
  );

  console.log("✅ Graduações registradas com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao registrar graduações:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
