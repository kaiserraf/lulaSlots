import { HttpError } from "../middlewares/errorHandler";
import { prisma } from "../config/prisma";
import { DAILY_REWARD_AMOUNT, DAILY_REWARD_INTERVAL_MS } from "../utils/game";

export const rewardService = {
  async status(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { lastDailyRewardAt: true } });
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    const now = Date.now();
    const last = user.lastDailyRewardAt ? user.lastDailyRewardAt.getTime() : null;
    if (last === null) {
      return { available: true, nextClaimAt: null, rewardAmount: Number(DAILY_REWARD_AMOUNT) };
    }
    const next = last + DAILY_REWARD_INTERVAL_MS;
    if (now >= next) {
      return { available: true, nextClaimAt: null, rewardAmount: Number(DAILY_REWARD_AMOUNT) };
    }
    return { available: false, nextClaimAt: new Date(next).toISOString(), rewardAmount: Number(DAILY_REWARD_AMOUNT) };
  },

  async claim(userId: string) {
    const cutoff = new Date(Date.now() - DAILY_REWARD_INTERVAL_MS);
    // Atômico: só atualiza se nunca resgatou ou se o último resgate for mais antigo que 24h.
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: userId,
          OR: [{ lastDailyRewardAt: null }, { lastDailyRewardAt: { lte: cutoff } }],
        },
        data: {
          balance: { increment: DAILY_REWARD_AMOUNT },
          lastDailyRewardAt: new Date(),
        },
      });
      if (updated.count === 0) {
        throw new HttpError(429, "Recompensa diária ainda não disponível.");
      }
      const user = await tx.user.findUnique({ where: { id: userId }, select: { balance: true, lastDailyRewardAt: true } });
      return user!;
    });
    return {
      rewardAmount: Number(DAILY_REWARD_AMOUNT),
      balanceAfter: Number(result.balance),
      claimedAt: result.lastDailyRewardAt,
    };
  },
};