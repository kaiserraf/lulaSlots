import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const spinRepository = {
  async create(data: {
    userId: string;
    betAmount: bigint;
    symbols: string[];
    winAmount: bigint;
    balanceAfter: bigint;
    isWin: boolean;
  }) {
    return prisma.spin.create({
      data: {
        userId: data.userId,
        betAmount: data.betAmount,
        symbols: data.symbols as unknown as Prisma.InputJsonValue,
        winAmount: data.winAmount,
        balanceAfter: data.balanceAfter,
        isWin: data.isWin,
      },
    });
  },
  async listByUser(userId: string, limit = 20) {
    return prisma.spin.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  async statsByUser(userId: string) {
    const agg = await prisma.spin.aggregate({
      where: { userId },
      _sum: { betAmount: true, winAmount: true },
      _count: { _all: true },
    });
    const wins = await prisma.spin.count({ where: { userId, isWin: true } });
    const losses = await prisma.spin.count({ where: { userId, isWin: false } });
    return {
      totalSpins: agg._count._all,
      totalBet: agg._sum.betAmount ?? BigInt(0),
      totalWin: agg._sum.winAmount ?? BigInt(0),
      wins,
      losses,
    };
  },
};