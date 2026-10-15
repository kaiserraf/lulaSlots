import { HttpError } from "../middlewares/errorHandler";
import { userRepository } from "../repositories/userRepository";
import { spinRepository } from "../repositories/spinRepository";
import { prisma } from "../config/prisma";
import {
  ALLOWED_BETS,
  computeWin,
  generateGrid,
  isWinningRow,
} from "../utils/game";

export const gameService = {
  async spin(userId: string, betAmount: number) {
    if (!Number.isInteger(betAmount) || !ALLOWED_BETS.includes(betAmount)) {
      throw new HttpError(400, "Valor de aposta inválido.");
    }
    const bet = BigInt(betAmount);

    // Transação atômica: valida saldo, debita aposta, calcula prêmio, credita, registra giro.
    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpError(404, "Usuário não encontrado.");
        if (user.balance < bet) {
          throw new HttpError(400, "Saldo insuficiente.");
        }

        const symbols = generateGrid();
        const winAmount = computeWin(symbols, bet);
        const newBalance = user.balance - bet + winAmount;

        await tx.user.update({
          where: { id: userId },
          data: { balance: newBalance },
        });

        const spin = await tx.spin.create({
          data: {
            userId,
            betAmount: bet,
            symbols: symbols as unknown as object,
            winAmount,
            balanceAfter: newBalance,
            isWin: winAmount > BigInt(0),
          },
        });

        return { spin, newBalance, symbols, winAmount };
      },
      { isolationLevel: "Serializable" },
    );

    const winningLines: number[] = [];
    for (let row = 0; row < 3; row++) {
      if (isWinningRow(result.symbols, row)) winningLines.push(row);
    }

    return {
      spinId: result.spin.id,
      symbols: result.symbols,
      betAmount: betAmount,
      winAmount: Number(result.winAmount),
      balanceAfter: Number(result.newBalance),
      isWin: result.winAmount > BigInt(0),
      winningLines,
      createdAt: result.spin.createdAt,
    };
  },

  async history(userId: string) {
    const spins = await spinRepository.listByUser(userId, 20);
    return spins.map((s) => ({
      id: s.id,
      betAmount: Number(s.betAmount),
      symbols: s.symbols,
      winAmount: Number(s.winAmount),
      balanceAfter: Number(s.balanceAfter),
      isWin: s.isWin,
      createdAt: s.createdAt,
    }));
  },

  async stats(userId: string) {
    const stats = await spinRepository.statsByUser(userId);
    return {
      totalSpins: stats.totalSpins,
      totalBet: Number(stats.totalBet),
      totalWin: Number(stats.totalWin),
      wins: stats.wins,
      losses: stats.losses,
    };
  },
};