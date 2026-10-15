import { prisma } from "../config/prisma";
import type { User } from "@prisma/client";

export const userRepository = {
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async create(username: string, passwordHash: string) {
    return prisma.user.create({
      data: { username, passwordHash, balance: BigInt(50000) },
    });
  },
  async updateBalance(id: string, balance: bigint, tx = prisma) {
    return tx.user.update({ where: { id }, data: { balance } });
  },
};

export type PublicUser = Pick<User, "id" | "username" | "balance" | "lastDailyRewardAt" | "createdAt">;