import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Cria um usuário de demonstração idempotente (apenas para estudo local).
  const bcrypt = (await import("bcrypt")).default;
  const passwordHash = await bcrypt.hash("demo123", 10);
  await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      passwordHash,
      balance: BigInt(50000),
    },
  });
  console.log("Seed concluído. Usuário demo/demo123 disponível.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });