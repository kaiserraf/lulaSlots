import { env } from "./config/env";
import app from "./app";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`Backend Lula Slots rodando em http://localhost:${env.PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});